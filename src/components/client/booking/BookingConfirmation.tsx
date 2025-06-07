import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { FooterNav } from '../../shared/FooterNav';
import { createAppointment } from '../../../lib/api/appointments';
import { format, parseISO, addMinutes } from 'date-fns';

interface BookingState {
  professionalId: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  appointmentTime: string;
  professionalName: string;
}

const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Get booking details from location state
  const bookingDetails = location.state as BookingState;
  
  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Missing booking information</p>
            <button 
              onClick={() => navigate('/discover')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Back to Discovery
            </button>
          </div>
        </div>
        <FooterNav userType={userProfile?.role === 'professional' ? 'professional' : 'client'} />
      </div>
    );
  }
  
  const {
    professionalId,
    serviceId,
    serviceName,
    servicePrice,
    serviceDuration,
    appointmentTime,
    professionalName
  } = bookingDetails;
  
  // Validate appointment time format and provide fallback if invalid
  let parsedAppointmentTime: Date;
  let formattedDate: string;
  let formattedTime: string;
  let endTime: string;
  
  try {
    // Try to parse the appointment time
    parsedAppointmentTime = parseISO(appointmentTime);
    
    // Check if the parsed date is valid
    if (isNaN(parsedAppointmentTime.getTime())) {
      throw new Error('Invalid date');
    }
    
    formattedDate = format(parsedAppointmentTime, 'EEEE, MMMM d, yyyy');
    formattedTime = format(parsedAppointmentTime, 'h:mm a');
    endTime = format(
      addMinutes(parsedAppointmentTime, serviceDuration),
      'h:mm a'
    );
  } catch (err) {
    console.error('Error parsing appointment time:', err, appointmentTime);
    // Use current date/time as fallback
    const now = new Date();
    formattedDate = format(now, 'EEEE, MMMM d, yyyy');
    formattedTime = format(now, 'h:mm a');
    endTime = format(addMinutes(now, serviceDuration || 60), 'h:mm a');
    // Set error to inform user
    if (!error) {
      setError('There was an issue with the appointment time. Please try booking again.');
    }
  }
  
  const handleConfirmBooking = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Use current date as fallback if appointment time is invalid
      const now = new Date();
      const nowStr = now.toISOString();
      
      // Calculate appointment date and end time safely
      let appointmentDate: string;
      let appointmentEndTimeStr: string;
      
      try {
        // Try to extract date from the appointment time string
        if (appointmentTime && appointmentTime.includes('T')) {
          appointmentDate = appointmentTime.split('T')[0];
        } else {
          appointmentDate = format(now, 'yyyy-MM-dd');
        }
        
        // Calculate end time by adding duration to the start time
        // Use string manipulation instead of Date operations to avoid timezone issues
        const [datePart, timePart] = (appointmentTime || nowStr).split('T');
        if (datePart && timePart) {
          const [hours, minutes] = timePart.split(':').map(Number);
          
          // Add duration to get end time
          let endHours = hours;
          let endMinutes = minutes + (serviceDuration || 60);
          
          // Handle minute overflow
          while (endMinutes >= 60) {
            endHours += 1;
            endMinutes -= 60;
          }
          
          // Handle hour overflow
          endHours = endHours % 24;
          
          // Format end time
          const endTimePart = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:00`;
          appointmentEndTimeStr = `${datePart}T${endTimePart}`;
        } else {
          // Fallback to now + duration
          appointmentEndTimeStr = addMinutes(now, serviceDuration || 60).toISOString();
        }
      } catch (err) {
        console.error('Error calculating appointment times:', err);
        // Use fallback values
        appointmentDate = format(now, 'yyyy-MM-dd');
        appointmentEndTimeStr = addMinutes(now, serviceDuration || 60).toISOString();
      }
      
      // Ensure professionalName is not undefined
      const safeProfessionalName = professionalName || 'Professional';
      
      // Log the appointment data for debugging
      console.log('Creating appointment with data:', {
        professionalId,
        professionalName: safeProfessionalName,
        clientId: currentUser.uid,
        clientName: userProfile?.displayName || 'Client',
        service: serviceId,
        serviceName,
        date: appointmentDate,
        startTime: appointmentTime || nowStr,
        endTime: appointmentEndTimeStr
      });
      
      // Additional logging to help debug the professionalId
      console.log('Professional ID type:', typeof professionalId);
      console.log('Professional ID length:', professionalId.length);
      console.log('Professional ID contains underscore:', professionalId.includes('_'));
      
      // Create appointment - ensure professionalId is correctly passed
      await createAppointment({
        professionalId: professionalId, // Ensure this is the correct professional ID
        professionalName: safeProfessionalName,
        clientId: currentUser.uid,
        clientName: userProfile?.displayName || 'Client',
        service: serviceId,
        serviceName: serviceName || 'Service',
        date: appointmentDate,
        startTime: appointmentTime || nowStr,
        endTime: appointmentEndTimeStr,
        location: '',
        notes: '',
        calendarSync: false
      });
      
      setSuccess(true);
      
      // Redirect to bookings page after a delay
      setTimeout(() => {
        navigate('/client/bookings');
      }, 3000);
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err instanceof Error ? err.message : 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Confirm Your Booking</h1>
          
          {success ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mt-3 text-lg font-medium text-gray-900">Booking Successful!</h2>
              <p className="mt-2 text-sm text-gray-500">
                Your appointment has been booked successfully. The professional will be notified of your request.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Redirecting to your bookings...
              </p>
            </div>
          ) : (
            <>
              <div className="border-t border-b border-gray-200 py-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{serviceName}</h2>
                    <p className="text-gray-600">with {professionalName}</p>
                    <div className="mt-2">
                      <span className="text-indigo-600 font-medium">Starting at ${servicePrice}</span>
                      <span className="text-gray-400 text-sm ml-2">({serviceDuration} min)</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                    <p className="text-gray-800">{formattedDate}</p>
                    <p className="text-gray-800">{formattedTime} - {endTime}</p>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={handleConfirmBooking}
                  disabled={loading}
                  className={`px-6 py-3 rounded-md text-white font-medium ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <FooterNav userType={userProfile?.role === 'professional' ? 'professional' : 'client'} />
    </div>
  );
};

export default BookingConfirmation;
