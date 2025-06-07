import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Star, AlertCircle, CheckCircle, Clock3 } from 'lucide-react';
import { useAppointments } from '../../../hooks/useAppointments';
import { AppointmentStatus, Appointment as AppointmentType } from '../../../types/appointment';
import { format, parseISO, addDays, isWithinInterval } from 'date-fns';

interface AppointmentUI {
  id: string;
  professionalName: string;
  professionalAvatar: string;
  service: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'requested' | 'prebooked' | 'confirmed' | 'waitlisted' | 'completed' | 'cancelled';
  position?: number; // For waitlist position
  rating?: number;
  startTimeDate: Date; // Actual Date object for filtering
  isApproved: boolean; // Whether the appointment is approved by professional
}

type AppointmentFilter = 'upcoming' | 'requested' | 'prebooked' | 'confirmed' | 'waitlisted';

export const AppointmentsTab = () => {
  const [activeFilter, setActiveFilter] = useState<AppointmentFilter>('upcoming');
  const { appointments: dbAppointments, loading, cancelAppointment } = useAppointments();
  const [uiAppointments, setUiAppointments] = useState<AppointmentUI[]>([]);

  // Convert database appointments to UI appointments
  useEffect(() => {
    if (!dbAppointments) return;

    const convertedAppointments = dbAppointments.map((appointment: AppointmentType) => {
      // Default avatar based on first letter of professional name
      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.professionalName)}&background=random`;
      
      // Map database appointment status to UI status
      let uiStatus: 'upcoming' | 'requested' | 'prebooked' | 'confirmed' | 'waitlisted' | 'completed' | 'cancelled';
      let isApproved = false;
      
      switch (appointment.status) {
        case AppointmentStatus.REQUESTED:
          uiStatus = 'requested';
          isApproved = false;
          break;
        case AppointmentStatus.PREBOOKED:
          uiStatus = 'prebooked';
          isApproved = false;
          break;
        case AppointmentStatus.SCHEDULED:
          // Check if this was a requested appointment that was approved
          if (appointment.statusReason === "Approved by professional") {
            uiStatus = 'confirmed';
            isApproved = true;
          } else {
            uiStatus = 'upcoming';
            isApproved = true;
          }
          break;
        case AppointmentStatus.COMPLETED:
          uiStatus = 'completed';
          isApproved = true;
          break;
        case AppointmentStatus.CANCELLED:
          uiStatus = 'cancelled';
          isApproved = false;
          break;
        case AppointmentStatus.PENDING:
          uiStatus = 'waitlisted';
          isApproved = false;
          break;
        default:
          uiStatus = 'waitlisted';
          isApproved = false;
      }

      // Format date and time
      let dateStr = '';
      let timeStr = '';
      let startTimeDate = new Date();
      try {
        const startDate = parseISO(appointment.startTime);
        startTimeDate = startDate;
        dateStr = format(startDate, 'yyyy-MM-dd');
        timeStr = format(startDate, 'h:mm a');
      } catch (err) {
        console.error('Error parsing date:', err);
        dateStr = appointment.date || '';
        timeStr = '';
      }

      return {
        id: appointment.id,
        professionalName: appointment.professionalName,
        professionalAvatar: defaultAvatar,
        service: appointment.serviceName,
        date: dateStr,
        time: timeStr,
        location: appointment.location || 'Location not specified',
        status: uiStatus,
        rating: 4.8, // Default rating since we don't have this in the database yet
        startTimeDate,
        isApproved
      };
    });

    setUiAppointments(convertedAppointments);
  }, [dbAppointments]);

  // Filter appointments based on the active filter
  const filteredAppointments = uiAppointments.filter(appointment => {
    if (activeFilter === 'upcoming') {
      // For upcoming, show all appointments in the next 14 days regardless of status
      // This ensures confirmed appointments also show up in the upcoming tab
      const now = new Date();
      const twoWeeksFromNow = addDays(now, 14);
      
      // Include all appointments within the date range that are not cancelled or completed
      return appointment.status !== 'cancelled' && 
             appointment.status !== 'completed' &&
             isWithinInterval(appointment.startTimeDate, { start: now, end: twoWeeksFromNow });
    }
    
    return appointment.status === activeFilter;
  });

  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReschedule = (appointmentId: string) => {
    // For now, we'll just show a message that this feature is coming soon
    // In a future implementation, this would navigate to a reschedule page
    alert('Reschedule feature coming soon. Please cancel this appointment and book a new one.');
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      setIsProcessing(appointmentId);
      setError(null);
      
      // Use the cancelAppointment function from the hook
      await cancelAppointment(appointmentId, 'Cancelled by client');
      
      // The appointment list will automatically update due to the Firestore listener in useAppointments
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      
      // Check if the error is related to authentication
      if (err instanceof Error && 
          (err.message.includes('auth') || 
           err.message.includes('permission') || 
           err.message.includes('token'))) {
        setError('Authentication error. Please refresh the page and try again.');
      } else {
        setError('Failed to cancel appointment. Please try again.');
      }
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap space-x-2 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveFilter('upcoming')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeFilter === 'upcoming'
              ? 'bg-white shadow text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveFilter('requested')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeFilter === 'requested'
              ? 'bg-white shadow text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Requested
        </button>
        <button
          onClick={() => setActiveFilter('confirmed')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeFilter === 'confirmed'
              ? 'bg-white shadow text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Confirmed
        </button>
        <button
          onClick={() => setActiveFilter('prebooked')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeFilter === 'prebooked'
              ? 'bg-white shadow text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Prebooked
        </button>
        <button
          onClick={() => setActiveFilter('waitlisted')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeFilter === 'waitlisted'
              ? 'bg-white shadow text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Waitlisted
        </button>
      </div>

      {/* Appointments List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Appointments
          </h3>
        </div>
        <div className="border-t border-gray-200">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No {activeFilter} appointments
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <li key={appointment.id} className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={appointment.professionalAvatar}
                        alt={appointment.professionalName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {appointment.service}
                        </h4>
                        <p className="text-sm text-gray-500">
                          with {appointment.professionalName}
                        </p>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          {appointment.rating}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {appointment.date}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {appointment.time}
                        </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {appointment.location}
                      </div>
                      {appointment.status === 'waitlisted' && (
                        <div className="flex items-center text-sm text-orange-600">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Waitlist Position: {appointment.position}
                        </div>
                      )}
                      {activeFilter === 'upcoming' && (
                        <div className={`flex items-center text-sm ${appointment.isApproved ? 'text-green-600' : 'text-amber-600'}`}>
                          {appointment.isApproved ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approved
                            </>
                          ) : (
                            <>
                              <Clock3 className="h-4 w-4 mr-1" />
                              Pending Approval
                            </>
                          )}
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    {appointment.status !== 'waitlisted' && (
                      <button
                        onClick={() => handleReschedule(appointment.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Reschedule
                      </button>
                    )}
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      disabled={isProcessing === appointment.id}
                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md ${
                        isProcessing === appointment.id 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                          : 'text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                      }`}
                    >
                      {isProcessing === appointment.id 
                        ? 'Processing...' 
                        : appointment.status === 'waitlisted' ? 'Leave Waitlist' : 'Cancel'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};
