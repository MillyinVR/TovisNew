import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useProfessionalData } from '../../../hooks/useProfessionalData';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { FooterNav } from '../../shared/FooterNav';
import { WorkingHours } from '../../../types/calendar';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

interface TimeSlot {
  time: string;
  available: boolean;
  formattedTime: string;
}

const ServiceAvailability: React.FC = () => {
  const { professionalId, serviceId } = useParams<{ professionalId: string; serviceId: string }>();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { professionalData } = useProfessionalData({
    professionalId: professionalId,
    includeServices: true
  });
  // Using default working hours and random availability for simplicity
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [professional, setProfessional] = useState<any>(null);
  const [service, setService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  
  // Generate dates for the next 7 days
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const dates = Array.from({ length: 14 }, (_, i) => addDays(startDate, i));
  
  useEffect(() => {
    const fetchData = async () => {
      if (!professionalId || !serviceId) {
        setError('Missing professional or service information');
        setLoading(false);
        return;
      }
      
      try {
        if (professionalData) {
          setProfessional(professionalData);
          
          // Debug the services data
          console.log('Professional Data:', professionalData);
          console.log('Services:', professionalData.services);
          console.log('Looking for serviceId:', serviceId);
          
          // Find the specific service with more flexible matching
          const serviceData = professionalData.services?.find((s: any) => {
            console.log('Checking service:', s);
            return s.id === serviceId || 
                   s.baseServiceId === serviceId || 
                   (s.baseService && s.baseService.id === serviceId);
          });
          
          if (!serviceData) {
            // If service not found, try to fetch it directly from the services collection
            console.log('Service not found in professional services, fetching from services collection');
            
            try {
              // First try to get the service from the professional's services collection
              const serviceRef = doc(db, 'users', professionalId, 'services', serviceId);
              const serviceDoc = await getDoc(serviceRef);
              
              if (serviceDoc.exists()) {
                const fetchedService = {
                  id: serviceDoc.id,
                  ...serviceDoc.data()
                };
                console.log('Found service in professional services collection:', fetchedService);
                setService(fetchedService);
              } else {
                // If not found, try to get the base service from the services collection
                const baseServiceRef = doc(db, 'services', serviceId);
                const baseServiceDoc = await getDoc(baseServiceRef);
                
                if (baseServiceDoc.exists()) {
                  const baseService = {
                    id: baseServiceDoc.id,
                    ...baseServiceDoc.data()
                  } as any;
                  console.log('Found base service:', baseService);
                  
                  // Now try to find the professional's version of this service
                  const professionalServicesRef = collection(db, 'users', professionalId, 'services');
                  const q = query(professionalServicesRef, where('baseServiceId', '==', serviceId));
                  const querySnapshot = await getDocs(q);
                  
                  if (!querySnapshot.empty) {
                    const professionalService = {
                      id: querySnapshot.docs[0].id,
                      ...querySnapshot.docs[0].data()
                    };
                    console.log('Found professional service by baseServiceId:', professionalService);
                    setService(professionalService);
                  } else {
                    // Use the base service with the professional's price if available
                    console.log('Using base service with professional price');
                    setService({
                      ...baseService,
                      name: baseService.name || 'Service',
                      price: baseService.basePrice || baseService.price || 0,
                      duration: baseService.baseDuration || baseService.duration || 60
                    });
                  }
                } else {
                  // If all else fails, use a default service
                  console.error('Service not found in any collection. Using default service data.');
                  const defaultService = {
                    id: serviceId,
                    name: 'Service',
                    description: 'Service description',
                    price: 0,
                    duration: 60
                  };
                  setService(defaultService);
                }
              }
            } catch (error) {
              console.error('Error fetching service:', error);
              // Create a default service object with the serviceId
              const defaultService = {
                id: serviceId,
                name: 'Service',
                description: 'Service description',
                price: 0,
                duration: 60
              };
              setService(defaultService);
            }
          } else {
            setService(serviceData);
          }
          
          // Generate available time slots
          generateTimeSlots(selectedDate, professionalId);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load availability. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [professionalId, serviceId, professionalData]);
  
  useEffect(() => {
    if (professionalId) {
      generateTimeSlots(selectedDate, professionalId);
    }
  }, [selectedDate, professionalId]);
  
  const generateTimeSlots = async (date: Date, profId: string) => {
    try {
      setLoading(true);
      
      const dayOfWeek = format(date, 'EEEE').toLowerCase();
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Define the type for working hours
      type DaySettings = { start: string; end: string; enabled: boolean };
      
      // Fetch professional's working hours using the client API
      let workingHours: WorkingHours;
      try {
        const workingHoursRef = await fetch(`/api/professionals/${profId}/working-hours`);
        if (workingHoursRef.ok) {
          workingHours = await workingHoursRef.json();
        } else {
          throw new Error('Failed to fetch working hours');
        }
      } catch (error) {
        console.error('Error fetching working hours, using defaults:', error);
        // Default working hours to use as fallback
        workingHours = {
          monday: { start: '09:00', end: '17:00', enabled: true },
          tuesday: { start: '09:00', end: '17:00', enabled: true },
          wednesday: { start: '09:00', end: '17:00', enabled: true },
          thursday: { start: '09:00', end: '17:00', enabled: true },
          friday: { start: '09:00', end: '17:00', enabled: true },
          saturday: { start: '10:00', end: '15:00', enabled: false },
          sunday: { start: '10:00', end: '15:00', enabled: false }
        };
      }
      
      // Check for custom working hours for this specific date
      let customHours = null;
      try {
        // Safely construct the URL with query parameters
        const customHoursUrl = `/api/professionals/${profId}/custom-working-hours?date=${encodeURIComponent(dateStr)}`;
        const customHoursRef = await fetch(customHoursUrl);
        if (customHoursRef.ok) {
          const data = await customHoursRef.json();
          if (data) {
            customHours = data;
          }
        }
      } catch (error) {
        console.error('Error fetching custom hours, using regular hours:', error);
      }
      
      // Determine start and end times
      let startTime = '09:00';
      let endTime = '17:00';
      let isWorkingDay = true;
      
      // Use custom hours for this date if available
      if (customHours && customHours.enabled) {
        startTime = customHours.start;
        endTime = customHours.end;
      } else {
        // Otherwise use regular working hours for this day of week
        const currentDaySettings = workingHours[dayOfWeek];
        if (currentDaySettings) {
          if (currentDaySettings.enabled) {
            startTime = currentDaySettings.start;
            endTime = currentDaySettings.end;
          } else {
            // Not working this day
            isWorkingDay = false;
          }
        }
      }
      
      if (!isWorkingDay) {
        setTimeSlots([]);
        setLoading(false);
        return;
      }
      
      // Generate time slots in 30-minute increments
      const slots: TimeSlot[] = [];
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      let currentHour = startHour;
      let currentMinute = startMinute;
      
      // Fetch existing appointments for this professional on this date
      let bookedSlots: string[] = [];
      try {
        const appointmentsRef = await fetch(`/api/professionals/${profId}/appointments?date=${dateStr}`);
        if (appointmentsRef.ok) {
          const appointments = await appointmentsRef.json();
          // Extract start times of all appointments
          bookedSlots = appointments.map((appt: any) => {
            const apptTime = new Date(appt.startTime);
            return format(apptTime, 'HH:mm');
          });
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
      
      // Generate all possible time slots within working hours
      while (
        currentHour < endHour || 
        (currentHour === endHour && currentMinute < endMinute)
      ) {
        const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        const fullTimeString = `${dateStr}T${timeString}:00`;
        
        // Check if this time slot is already booked
        const isBooked = bookedSlots.includes(timeString);
        
        slots.push({
          time: fullTimeString,
          available: !isBooked,
          formattedTime: format(parseISO(fullTimeString), 'h:mm a')
        });
        
        // Increment by 30 minutes
        currentMinute += 30;
        if (currentMinute >= 60) {
          currentHour += 1;
          currentMinute = 0;
        }
      }
      
      setTimeSlots(slots);
    } catch (err) {
      console.error('Error generating time slots:', err);
      setError('Failed to load available time slots');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };
  
  const handleTimeSelect = (time: string) => {
    setSelectedTimeSlot(time);
  };
  
  const handleBookAppointment = () => {
    if (!selectedTimeSlot || !currentUser) {
      return;
    }
    
    // Ensure we have valid data for the booking
    const bookingData = {
      professionalId: professionalId || '',
      serviceId: serviceId || '',
      serviceName: service?.name || 'Service',
      servicePrice: service?.price || 0,
      serviceDuration: service?.duration || 60,
      appointmentTime: selectedTimeSlot,
      professionalName: professional?.displayName || 'Professional'
    };
    
    // Log the booking data for debugging
    console.log('Booking appointment with data:', bookingData);
    
    // Navigate to confirmation page with all the necessary details
    navigate(`/book/confirm`, {
      state: bookingData
    });
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
        <FooterNav userType={userProfile?.role === 'professional' ? 'professional' : 'client'} />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={handleBack}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Go Back
            </button>
          </div>
        </div>
        <FooterNav userType={userProfile?.role === 'professional' ? 'professional' : 'client'} />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </button>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Book Appointment</h1>
          
          {professional && service && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800">{service.name}</h2>
              <p className="text-gray-600">with {professional.displayName}</p>
              <div className="mt-2 flex items-center">
                <span className="text-indigo-600 font-medium">Starting at ${service.price}</span>
                <span className="text-gray-400 text-sm ml-2">({service.duration} min)</span>
              </div>
            </div>
          )}
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select a Date</h3>
            <div className="flex overflow-x-auto pb-4 space-x-2 scrollbar-hide">
              {dates.map((date) => (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateSelect(date)}
                  className={`flex-shrink-0 p-3 rounded-lg border ${
                    isSameDay(date, selectedDate)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="text-center">
                    <p className={`text-xs font-medium ${
                      isSameDay(date, selectedDate) ? 'text-indigo-100' : 'text-gray-500'
                    }`}>
                      {format(date, 'EEE')}
                    </p>
                    <p className="text-lg font-semibold">{format(date, 'd')}</p>
                    <p className={`text-xs ${
                      isSameDay(date, selectedDate) ? 'text-indigo-100' : 'text-gray-500'
                    }`}>
                      {format(date, 'MMM')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select a Time</h3>
            {timeSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                    className={`p-3 rounded-lg border text-center ${
                      selectedTimeSlot === slot.time
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : slot.available
                        ? 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    {slot.formattedTime}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No available time slots for this date</p>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleBookAppointment}
              disabled={!selectedTimeSlot}
              className={`px-6 py-3 rounded-md text-white font-medium ${
                selectedTimeSlot
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>
      <FooterNav userType={userProfile?.role === 'professional' ? 'professional' : 'client'} />
    </div>
  );
};

export default ServiceAvailability;
