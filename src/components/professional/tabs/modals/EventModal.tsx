import React, { useState } from 'react';
import { X, AlertTriangle, Check, XIcon, Calendar, Clock, User, Edit, Send, Link } from 'lucide-react';
import { TimeSlot } from '../../../../types/calendar';
import { format, parseISO } from 'date-fns';
import { AppointmentStatus } from '../../../../types/appointment';
import { sendNotification } from '../../../../lib/firebase';
import { auth } from '../../../../lib/firebase';
import { useProfessionalAppointments } from '../../../../hooks/useProfessionalAppointments';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  selectedEvent: TimeSlot | null;
  onAdd: (event: Partial<TimeSlot>) => void;
  onUpdate: (event: Partial<TimeSlot>) => void;
  onDelete: (eventId: string) => void;
  showWarning?: boolean;
  onApprove?: (eventId: string) => void;
  onDeny?: (eventId: string) => void;
  onRefresh?: () => void;
}

interface RescheduleData {
  date: string;
  startTime: string;
  endTime: string;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedEvent,
  onAdd,
  onUpdate,
  onDelete,
  showWarning = false,
  onApprove,
  onDeny,
  onRefresh,
}) => {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<RescheduleData>({
    date: '',
    startTime: '',
    endTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');
  const { rescheduleAppointment } = useProfessionalAppointments();

  if (!isOpen) return null;

  // Check if this is a pending appointment
  const isPendingAppointment = selectedEvent && 
    selectedEvent.type === 'booking' && 
    selectedEvent.status === 'pending';
    
  // Check if this is a confirmed appointment
  const isConfirmedAppointment = selectedEvent && 
    selectedEvent.type === 'booking' && 
    (selectedEvent.status === 'scheduled' || selectedEvent.status === 'confirmed');
    
  console.log('Event Modal - Selected Event:', selectedEvent);
  console.log('Status:', selectedEvent?.status);
  console.log('isPendingAppointment:', isPendingAppointment);
  console.log('isConfirmedAppointment:', isConfirmedAppointment);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Get the date part from selectedDate
    const datePart = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
    
    // Get the time parts from the form
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    
    // Combine date and time
    const startDateTime = new Date(`${datePart}T${startTime}`);
    const endDateTime = new Date(`${datePart}T${endTime}`);

    const eventData = {
      title: formData.get('title') as string,
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      type: 'blocked' as const
    };

    if (selectedEvent) {
      onUpdate({ ...eventData, id: selectedEvent.id });
    } else {
      onAdd(eventData);
    }
  };

  const getTimeString = (date: Date | string | null) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'HH:mm');
  };

  const handleApprove = async () => {
    if (selectedEvent && onApprove) {
      try {
        // Refresh the authentication token to ensure it doesn't expire during the process
        if (auth.currentUser) {
          console.log('Refreshing token before approving');
          await auth.currentUser.getIdToken(true);
          console.log('Token refreshed successfully');
        }
        
        // Only proceed if token refresh was successful or not needed
        onApprove(selectedEvent.id);
        onClose();
      } catch (tokenError) {
        console.error('Error refreshing token:', tokenError);
        // Show an error message to the user
        alert('Authentication error. Please try again or refresh the page.');
      }
    }
  };

  const handleDeny = async () => {
    if (selectedEvent && onDeny) {
      try {
        // Refresh the authentication token to ensure it doesn't expire during the process
        if (auth.currentUser) {
          console.log('Refreshing token before denying');
          await auth.currentUser.getIdToken(true);
          console.log('Token refreshed successfully');
        }
        
        // Only proceed if token refresh was successful or not needed
        onDeny(selectedEvent.id);
        onClose();
      } catch (tokenError) {
        console.error('Error refreshing token:', tokenError);
        // Show an error message to the user
        alert('Authentication error. Please try again or refresh the page.');
      }
    }
  };
  
  const handleRescheduleClick = () => {
    if (selectedEvent) {
      const startDate = typeof selectedEvent.start === 'string' 
        ? parseISO(selectedEvent.start) 
        : selectedEvent.start;
      
      const endDate = typeof selectedEvent.end === 'string' 
        ? parseISO(selectedEvent.end) 
        : selectedEvent.end;
      
      setRescheduleData({
        date: format(startDate, 'yyyy-MM-dd'),
        startTime: format(startDate, 'HH:mm'),
        endTime: format(endDate, 'HH:mm')
      });
      
      setIsRescheduling(true);
    }
  };
  
  const handleRescheduleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedEvent || !selectedEvent.id) return;
    
    try {
      setIsSubmitting(true);
      setRescheduleError('');
      
      console.log('Rescheduling appointment:', selectedEvent.id);
      
      // Refresh the authentication token to ensure it doesn't expire during the process
      if (auth.currentUser) {
        console.log('Refreshing token before rescheduling');
        await auth.currentUser.getIdToken(true);
        console.log('Token refreshed successfully');
      }
      
      // Create new start and end times from form data
      // Use the user's local timezone by explicitly setting it
      console.log('Rescheduling with date:', rescheduleData.date);
      console.log('Rescheduling with start time:', rescheduleData.startTime);
      console.log('Rescheduling with end time:', rescheduleData.endTime);
      
      // Parse the date and time components
      const [year, month, day] = rescheduleData.date.split('-').map(Number);
      const [startHours, startMinutes] = rescheduleData.startTime.split(':').map(Number);
      const [endHours, endMinutes] = rescheduleData.endTime.split(':').map(Number);
      
      // Create dates with explicit time components to avoid timezone issues
      // Note: month is 0-indexed in JavaScript Date
      const startDateTime = new Date(year, month - 1, day, startHours, startMinutes);
      const endDateTime = new Date(year, month - 1, day, endHours, endMinutes);
      
      console.log('Start date time (local):', startDateTime.toString());
      console.log('End date time (local):', endDateTime.toString());
      console.log('Start date time (ISO):', startDateTime.toISOString());
      console.log('End date time (ISO):', endDateTime.toISOString());
      
      // Update appointment using the hook
      await rescheduleAppointment(
        selectedEvent.id,
        startDateTime.toISOString(),
        endDateTime.toISOString()
      );
      
      // Send notification to client
      if (selectedEvent.extendedProps?.clientId) {
        await sendNotification({
          userId: selectedEvent.extendedProps.clientId,
          title: 'Appointment Rescheduled',
          body: `Your ${selectedEvent.service} appointment has been rescheduled. Please approve or deny the new time.`,
          data: {
            type: 'appointment_reschedule',
            appointmentId: selectedEvent.id,
            service: selectedEvent.service,
            newStartTime: startDateTime.toISOString(),
            newEndTime: endDateTime.toISOString()
          }
        });
      }
      
      // Call the onRefresh prop to refresh appointments from the parent component
      if (onRefresh) {
        console.log('Calling onRefresh after rescheduling');
        await onRefresh();
        console.log('onRefresh completed');
      }
      
      setRescheduleSuccess(true);
      
      // Don't close the modal automatically - let the user close it when they're ready
      // This ensures they can see the success message and the calendar has time to update
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      setRescheduleError('Failed to reschedule appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClientProfileClick = () => {
    if (selectedEvent?.extendedProps?.clientId && selectedEvent?.clientName) {
      // Try to use the global function if it exists
      if (typeof window !== 'undefined' && (window as any).openClientProfile) {
        (window as any).openClientProfile(
          selectedEvent.extendedProps.clientId,
          selectedEvent.clientName
        );
      }
      
      // Close this modal
      onClose();
    } else {
      console.error('Client information not available for profile view');
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute inset-0 overflow-hidden">
        <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
          <div className="relative bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-2 sm:mx-0">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                {isPendingAppointment 
                  ? 'Pending Appointment Request' 
                  : isConfirmedAppointment
                    ? 'Appointment Details'
                    : selectedEvent 
                      ? selectedEvent.type === 'booking' 
                        ? 'Appointment Details' 
                        : 'Edit Blocked Time' 
                      : 'Block Time'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {showWarning && !isPendingAppointment && !isConfirmedAppointment && (
              <div className="mb-3 sm:mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-2 sm:p-4">
                <div className="flex">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm text-yellow-700">
                      This time slot is outside your working hours. You can still schedule it, but it may affect client expectations.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {rescheduleSuccess && (
              <div className="mb-3 sm:mb-4 bg-green-50 border-l-4 border-green-400 p-2 sm:p-4">
                <div className="flex">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm text-green-700">
                      Appointment rescheduled successfully. A notification has been sent to the client for approval.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {rescheduleError && (
              <div className="mb-3 sm:mb-4 bg-red-50 border-l-4 border-red-400 p-2 sm:p-4">
                <div className="flex">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm text-red-700">
                      {rescheduleError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isPendingAppointment && !isRescheduling ? (
              // Pending appointment view
              <div className="space-y-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        This is a pending appointment request that requires your approval.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Service</h4>
                    <p className="text-base font-medium text-gray-900">{selectedEvent.service}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Client</h4>
                    <button 
                      onClick={handleClientProfileClick}
                      className="text-base font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      {selectedEvent.clientName || 'Client'}
                      <Link className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Date</h4>
                      <p className="text-base font-medium text-gray-900">
                        {format(new Date(selectedEvent.start), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Time</h4>
                      <p className="text-base font-medium text-gray-900">
                        {format(new Date(selectedEvent.start), 'h:mm a')} - {format(new Date(selectedEvent.end), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleRescheduleClick}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Reschedule
                  </button>
                  <button
                    type="button"
                    onClick={handleDeny}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    <XIcon className="h-4 w-4 mr-2" />
                    Deny
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </button>
                </div>
              </div>
            ) : isConfirmedAppointment && !isRescheduling ? (
              // Confirmed appointment view
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Service</h4>
                      <p className="text-base font-medium text-gray-900">{selectedEvent.service}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-indigo-500 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Client</h4>
                      <button 
                        onClick={handleClientProfileClick}
                        className="text-base font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
                      >
                        {selectedEvent.clientName || 'Client'}
                        <Link className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Date</h4>
                      <p className="text-base font-medium text-gray-900">
                        {format(new Date(selectedEvent.start), 'EEEE, MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-indigo-500 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Time</h4>
                      <p className="text-base font-medium text-gray-900">
                        {format(new Date(selectedEvent.start), 'h:mm a')} - {format(new Date(selectedEvent.end), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => onDelete(selectedEvent.id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    <XIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRescheduleClick}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Reschedule
                  </button>
                </div>
              </div>
            ) : isRescheduling ? (
              // Reschedule form
              <form onSubmit={handleRescheduleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="date" className="block text-xs sm:text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={rescheduleData.date}
                    onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs sm:text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label htmlFor="startTime" className="block text-xs sm:text-sm font-medium text-gray-700">
                      Start Time
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      value={rescheduleData.startTime}
                      onChange={(e) => setRescheduleData({...rescheduleData, startTime: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="endTime" className="block text-xs sm:text-sm font-medium text-gray-700">
                      End Time
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      value={rescheduleData.endTime}
                      onChange={(e) => setRescheduleData({...rescheduleData, endTime: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 flex flex-wrap justify-end gap-2 sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsRescheduling(false)}
                    className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send for Approval
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              // Regular form for blocked time
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="title" className="block text-xs sm:text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    defaultValue={selectedEvent?.title}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs sm:text-sm"
                    placeholder="e.g., Lunch Break"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label htmlFor="startTime" className="block text-xs sm:text-sm font-medium text-gray-700">
                      Start Time
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      defaultValue={getTimeString(selectedEvent?.start || selectedDate)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="endTime" className="block text-xs sm:text-sm font-medium text-gray-700">
                      End Time
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      defaultValue={getTimeString(selectedEvent?.end || (selectedDate && new Date(selectedDate.getTime() + 60 * 60 * 1000)))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 flex flex-wrap justify-end gap-2 sm:space-x-3">
                  {selectedEvent && selectedEvent.type === 'blocked' && (
                    <button
                      type="button"
                      onClick={() => onDelete(selectedEvent.id)}
                      className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    {selectedEvent ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
