import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, addMinutes } from 'date-fns';
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Plus,
  Settings,
  Users,
  AlertTriangle
} from 'lucide-react';
import { TimeSlot } from '../../../types/calendar';
import { useWorkingHours } from '../../../hooks/useWorkingHours';
import { useProfessionalAppointments } from '../../../hooks/useProfessionalAppointments';
import { useClientData } from '../../../hooks/useClientData';
import { useAuth } from '../../../contexts/AuthContext';
import { auth } from '../../../lib/firebase';
import { EventModal } from './modals/EventModal';
import { WorkingHoursModal } from './modals/WorkingHoursModal';
import { CustomWorkingHoursModal } from './modals/CustomWorkingHoursModal';
import { BookingsListModal } from './modals/BookingsListModal';
import { AftercareSummaryModal } from './modals/AftercareSummaryModal';
import { ClientProfileModal } from './modals/ClientProfileModal';
import { CalendarManagement } from '../../professional/calendar/CalendarManagement';
import './calendar.css';


export const BookingCalendar = () => {
  const { currentUser } = useAuth();
  const calendarRef = useRef<any>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showWorkingHoursModal, setShowWorkingHoursModal] = useState(false);
  const [showCustomHoursModal, setShowCustomHoursModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimeSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showClientProfileModal, setShowClientProfileModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  
  // Custom hooks
  const { 
    workingHours, 
    customWorkingHours, 
    blockedTimeSlots,
    updateWorkingHours, 
    updateCustomWorkingHours,
    addBlockedTimeSlot,
    editBlockedTimeSlot,
    removeBlockedTimeSlot,
    loading: workingHoursLoading
  } = useWorkingHours();
  
  const {
    appointments,
    todayAppointments,
    pendingAppointments,
    calendarEvents,
    approveAppointment,
    cancelAppointment,
    refreshAppointments,
    loading: appointmentsLoading
  } = useProfessionalAppointments();
  
  const { getClientProfile } = useClientData();
  
  // Combine blocked time slots and appointments into events
  const [events, setEvents] = useState<TimeSlot[]>([]);
  
  // Refresh token when component mounts to ensure permissions are up to date
  useEffect(() => {
    const refreshToken = async () => {
      try {
        if (auth.currentUser) {
          console.log('Refreshing token in BookingCalendar component');
          await auth.currentUser.getIdToken(true);
          console.log('Token refreshed successfully in BookingCalendar');
        }
      } catch (error) {
        console.error('Error refreshing token in BookingCalendar:', error);
      }
    };
    
    refreshToken();
    
    // Add a global error handler for Firestore errors
    const originalConsoleError = console.error;
    console.error = function(...args) {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('@firebase/firestore')) {
        console.log('FIRESTORE ERROR DETAILS:', args);
        // Try to extract more information about the error
        if (args[1] && args[1].code === 'permission-denied') {
          console.log('PERMISSION DENIED ERROR:', args[1]);
          if (args[1].details) {
            console.log('ERROR DETAILS:', args[1].details);
          }
        }
      }
      originalConsoleError.apply(console, args);
    };
    
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  useEffect(() => {
    // Combine blocked time slots and calendar events
    // Note: calendarEvents already filters out cancelled appointments in useProfessionalAppointments
    const combinedEvents = [
      ...calendarEvents.map(event => {
        // Convert AppointmentStatus enum to TimeSlot status string
        let status: 'confirmed' | 'pending' | 'cancelled' | 'scheduled' = 'scheduled';
        
        // Normalize the status to uppercase for consistent comparison
        const normalizedStatus = String(event.status).toUpperCase();
        
        if (normalizedStatus === 'SCHEDULED' || normalizedStatus === 'CONFIRMED' || normalizedStatus === 'COMPLETED') {
          status = 'scheduled';
        } else if (normalizedStatus === 'PENDING' || normalizedStatus === 'REQUESTED') {
          status = 'pending';
        } else if (normalizedStatus === 'CANCELLED') {
          status = 'cancelled';
        }
        
        // Format the title based on status
        let title = event.title;
        if (normalizedStatus === 'REQUESTED' || normalizedStatus === 'PENDING') {
          // Add [PENDING] prefix if not already present
          if (!title.includes('[PENDING]')) {
            title = `[PENDING] ${title}`;
          }
        } else {
          // Remove [PENDING] prefix if present
          title = title.replace('[PENDING] ', '');
        }
        
        return {
          ...event,
          title,
          status,
          extendedProps: {
            ...event.extendedProps,
            clientId: event.extendedProps?.clientId,
            originalStatus: event.status // Store the original status for reference
          }
        } as TimeSlot;
      }),
      ...blockedTimeSlots.map(slot => ({
        ...slot,
        type: 'blocked' as const,
        service: '',
        status: 'scheduled' as const
      } as TimeSlot))
    ];
    
    setEvents(combinedEvents as TimeSlot[]);
  }, [calendarEvents, blockedTimeSlots]);
  const [showOutOfHoursWarning, setShowOutOfHoursWarning] = useState(false);
  const [showTodayBookingsModal, setShowTodayBookingsModal] = useState(false);
  const [showPendingRequestsModal, setShowPendingRequestsModal] = useState(false);
  const [showAftercareSummaryModal, setShowAftercareSummaryModal] = useState(false);


  // Handle approve/deny actions
  const handleApproveRequest = async (bookingId: string) => {
    try {
      console.log('Approving appointment:', bookingId);
      
      // Refresh the authentication token to ensure it doesn't expire during the process
      try {
        if (auth.currentUser) {
          console.log('Refreshing token before approving appointment');
          await auth.currentUser.getIdToken(true);
          console.log('Token refreshed successfully');
        }
      } catch (tokenError) {
        console.error('Error refreshing token:', tokenError);
        // Continue with the operation even if token refresh fails
      }
      
      await approveAppointment(bookingId);
      
      // Update the local events state to reflect the change
      setEvents(prevEvents => 
        prevEvents.map(event => {
          if (event.id === bookingId) {
            return {
              ...event,
              title: event.title.replace('[PENDING] ', ''), // Remove the pending prefix
              status: 'scheduled',
              extendedProps: {
                ...event.extendedProps,
                originalStatus: 'SCHEDULED'
              }
            };
          }
          return event;
        })
      );
      
      // Explicitly refresh appointments
      refreshAppointments();
    } catch (error) {
      console.error('Error approving booking:', error);
    }
  };

  const handleDenyRequest = async (bookingId: string) => {
    try {
      console.log('Denying appointment:', bookingId);
      
      // Refresh the authentication token to ensure it doesn't expire during the process
      try {
        if (auth.currentUser) {
          console.log('Refreshing token before denying appointment');
          await auth.currentUser.getIdToken(true);
          console.log('Token refreshed successfully');
        }
      } catch (tokenError) {
        console.error('Error refreshing token:', tokenError);
        // Continue with the operation even if token refresh fails
      }
      
      await cancelAppointment(bookingId, 'Appointment request denied by professional');
      
      // Update the local events state to reflect the change
      setEvents(prevEvents => 
        prevEvents.map(event => {
          if (event.id === bookingId) {
            return {
              ...event,
              status: 'cancelled',
              extendedProps: {
                ...event.extendedProps,
                originalStatus: 'CANCELLED'
              }
            };
          }
          return event;
        })
      );
      
      // Explicitly refresh appointments
      refreshAppointments();
    } catch (error) {
      console.error('Error denying booking:', error);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    try {
      // Only show event modal in timeGrid views
      if (selectInfo.view.type === 'dayGridMonth') {
        const calendarApi = selectInfo.view.calendar;
        calendarApi.changeView('timeGridWeek', selectInfo.start);
        return;
      }

      const isOutsideWorkingHours = checkIfOutsideWorkingHours(selectInfo.start);
      setSelectedDate(selectInfo.start);
      setShowOutOfHoursWarning(isOutsideWorkingHours);
      setShowEventModal(true);
    } catch (error) {
      console.error('Error handling date select:', error);
    }
  };

  const handleEventClick = (clickInfo: any) => {
    try {
      console.log('Event clicked:', clickInfo);
      
      let eventId: string | undefined;
      
      // Determine the event ID based on the structure of clickInfo
      if (clickInfo.id) {
        // Direct ID from CalendarManagement component
        eventId = clickInfo.id;
      } else if (clickInfo.event && clickInfo.event.id) {
        // ID from FullCalendar event object
        eventId = clickInfo.event.id;
      } else if (clickInfo.extendedProps && clickInfo.extendedProps.appointmentId) {
        // ID from extendedProps
        eventId = clickInfo.extendedProps.appointmentId;
      }
      
      if (!eventId) {
        console.error('Could not determine event ID from click info:', clickInfo);
        return;
      }
      
      // Find the event in our events array
      const event = events.find(e => e.id === eventId);
      if (event) {
        console.log('Found event in events array:', event);
        setSelectedEvent(event);
        setShowEventModal(true);
        
        // Store client info for potential profile view
        if (event.clientName && event.extendedProps?.clientId) {
          console.log('Setting client info:', event.extendedProps.clientId, event.clientName);
          setSelectedClientId(event.extendedProps.clientId);
          setSelectedClientName(event.clientName);
        }
      } else {
        console.log('Event not found in events array for ID:', eventId);
        
        // Try to extract information directly from the clickInfo object
        if (clickInfo.title && (clickInfo.start || clickInfo.event?.start)) {
          const start = clickInfo.start || clickInfo.event?.start;
          const end = clickInfo.end || clickInfo.event?.end;
          const status = clickInfo.status || clickInfo.event?.extendedProps?.status;
          const clientName = clickInfo.clientName || clickInfo.event?.extendedProps?.clientName;
          const clientId = clickInfo.extendedProps?.clientId || clickInfo.event?.extendedProps?.clientId;
          const service = clickInfo.service || clickInfo.event?.extendedProps?.service || clickInfo.title;
          
          // Create a temporary event object
          const tempEvent: TimeSlot = {
            id: eventId,
            title: clickInfo.title,
            start: start,
            end: end,
            type: 'booking',
            status: status || 'scheduled',
            service: service,
            clientName: clientName,
            extendedProps: {
              clientId: clientId,
              appointmentId: eventId
            }
          };
          
          console.log('Created temporary event from click info:', tempEvent);
          setSelectedEvent(tempEvent);
          setShowEventModal(true);
          
          if (clientName && clientId) {
            setSelectedClientId(clientId);
            setSelectedClientName(clientName);
          }
        } else {
          console.error('Could not create temporary event from click info:', clickInfo);
        }
      }
    } catch (error) {
      console.error('Error handling event click:', error);
    }
  };

  const handleDateClick = (arg: any) => {
    try {
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        if (calendarApi.view.type === 'dayGridMonth') {
          calendarApi.changeView('timeGridWeek', arg.date);
        }
      }
    } catch (error) {
      console.error('Error handling date click:', error);
    }
  };

  const handleEventDrop = (dropInfo: any) => {
    try {
      const isOutsideWorkingHours = checkIfOutsideWorkingHours(dropInfo.event.start);
      if (isOutsideWorkingHours) {
        setShowOutOfHoursWarning(true);
      }

      const updatedEvents = events.map(event => {
        if (event.id === dropInfo.event.id) {
          return {
            ...event,
            start: dropInfo.event.start.toISOString(),
            end: dropInfo.event.end.toISOString()
          };
        }
        return event;
      });
      setEvents(updatedEvents);
    } catch (error) {
      console.error('Error handling event drop:', error);
    }
  };

  const handleEventResize = (resizeInfo: any) => {
    try {
      const isOutsideWorkingHours = checkIfOutsideWorkingHours(resizeInfo.event.start) || 
                                   checkIfOutsideWorkingHours(resizeInfo.event.end);
      if (isOutsideWorkingHours) {
        setShowOutOfHoursWarning(true);
      }

      const updatedEvents = events.map(event => {
        if (event.id === resizeInfo.event.id) {
          return {
            ...event,
            start: resizeInfo.event.start.toISOString(),
            end: resizeInfo.event.end.toISOString()
          };
        }
        return event;
      });
      setEvents(updatedEvents);
    } catch (error) {
      console.error('Error handling event resize:', error);
    }
  };

  const checkIfOutsideWorkingHours = (date: Date): boolean => {
    try {
      const dayOfWeek = format(date, 'EEEE').toLowerCase();
      const timeStr = format(date, 'HH:mm');
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Check custom hours first
      const customHours = customWorkingHours.find(hours => hours.date === dateStr);
      if (customHours) {
        return timeStr < customHours.start || timeStr > customHours.end;
      }

      // Fall back to regular working hours
      const dayHours = workingHours[dayOfWeek];
      if (!dayHours?.enabled) return true;
      return timeStr < dayHours.start || timeStr > dayHours.end;
    } catch (error) {
      console.error('Error checking working hours:', error);
      return true; // Default to outside working hours on error
    }
  };

  const getBusinessHours = () => {
    try {
      const regularHours = Object.entries(workingHours)
        .filter(([_, hours]) => hours.enabled)
        .map(([day, hours]) => ({
          daysOfWeek: [['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day)],
          startTime: hours.start,
          endTime: hours.end,
          display: 'auto'
        }));

      const customHours = customWorkingHours.map(hours => ({
        startTime: hours.start,
        endTime: hours.end,
        startRecur: hours.date,
        endRecur: hours.date
      }));

      const businessHours = [...regularHours, ...customHours];
      console.log('Business hours configuration:', businessHours);
      return businessHours;
    } catch (error) {
      console.error('Error getting business hours:', error);
      return []; // Return empty array on error
    }
  };

  const handleAddEvent = async (eventData: Partial<TimeSlot>) => {
    try {
      if (!selectedDate || !currentUser?.uid) return;

      await addBlockedTimeSlot({
        title: eventData.title || 'Blocked Time',
        start: selectedDate,
        end: addMinutes(selectedDate, 60)
      });
      
      setShowEventModal(false);
      setSelectedDate(null);
      setShowOutOfHoursWarning(false);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleUpdateEvent = async (eventData: Partial<TimeSlot>) => {
    try {
      if (!selectedEvent || !currentUser?.uid) return;

      // Only update blocked time slots, not appointments
      if (selectedEvent.type === 'blocked') {
        await editBlockedTimeSlot(selectedEvent.id, {
          title: eventData.title,
          start: eventData.start,
          end: eventData.end
        });
      }
      
      setShowEventModal(false);
      setSelectedEvent(null);
      setShowOutOfHoursWarning(false);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      if (!currentUser?.uid) return;
      
      // Refresh the authentication token to ensure it doesn't expire during the process
      try {
        if (auth.currentUser) {
          console.log('Refreshing token before deleting/cancelling event');
          await auth.currentUser.getIdToken(true);
          console.log('Token refreshed successfully');
        }
      } catch (tokenError) {
        console.error('Error refreshing token:', tokenError);
        // Continue with the operation even if token refresh fails
      }
      
      // Check if this is a blocked time slot or an appointment
      const event = events.find(e => e.id === eventId);
      
      if (event?.type === 'blocked') {
        // Delete blocked time slot
        await removeBlockedTimeSlot(eventId);
      } else if (event?.type === 'booking') {
        // Cancel appointment
        await cancelAppointment(eventId, 'Cancelled by professional');
        
        // Explicitly refresh appointments
        refreshAppointments();
      }
      
      setShowEventModal(false);
      setSelectedEvent(null);
      setShowOutOfHoursWarning(false);
    } catch (error) {
      console.error('Error deleting/cancelling event:', error);
    }
  };

  const handleClientSelect = (clientId: string, clientName: string) => {
    setSelectedClientId(clientId);
    setSelectedClientName(clientName);
    setShowClientProfileModal(true);
    
    // Close the event modal if it's open
    if (showEventModal) {
      setShowEventModal(false);
    }
  };
  
  // Function to handle client profile link click from EventModal
  useEffect(() => {
    // Define a global function to handle client profile opening
    const handleClientProfileClick = (clientId: string, clientName: string) => {
      handleClientSelect(clientId, clientName);
    };
    
    // Attach to window for EventModal to access
    (window as any).openClientProfile = handleClientProfileClick;
    
    // Cleanup
    return () => {
      delete (window as any).openClientProfile;
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Calendar Management */}
      <div className="bg-[#1a1a1a] p-3 sm:p-6 rounded-lg shadow-sm text-white mt-3 sm:mt-8 flex-none">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-lg font-medium text-white">Calendar Management</h2>
            <p className="text-sm text-gray-400">
              Manage your availability and appointments
            </p>
          </div>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => setShowWorkingHoursModal(true)}
              className="inline-flex items-center justify-center w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-[#262626] hover:bg-[#333333] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="whitespace-nowrap">Working Hours</span>
            </button>
            <button
              onClick={() => {
                setSelectedEvent(null);
                setSelectedDate(new Date());
                setShowEventModal(true);
              }}
              className="inline-flex items-center justify-center w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="whitespace-nowrap">Block Time</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-3 sm:mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <button
            onClick={() => setShowTodayBookingsModal(true)}
            className="bg-[#262626] p-3 sm:p-4 rounded-lg hover:bg-[#333333] transition-colors w-full text-left"
          >
            <div className="flex items-center">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-400">Today's Bookings</p>
                <h3 className="text-base sm:text-lg font-semibold text-white">{todayAppointments.length}</h3>
              </div>
            </div>
          </button>
          <div className="bg-[#262626] p-3 sm:p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-400">Available Hours</p>
                <h3 className="text-base sm:text-lg font-semibold text-white">6</h3>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowPendingRequestsModal(true)}
            className="bg-[#262626] p-3 sm:p-4 rounded-lg hover:bg-[#333333] transition-colors w-full text-left"
          >
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-400">Pending Requests</p>
                <h3 className="text-base sm:text-lg font-semibold text-white">{pendingAppointments.length}</h3>
              </div>
            </div>
          </button>
          <div className="bg-[#262626] p-3 sm:p-4 rounded-lg">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-400">Blocked Time</p>
                <h3 className="text-base sm:text-lg font-semibold text-white">3 hrs</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="calendar-wrapper bg-white p-3 sm:p-4 rounded-lg shadow-sm mt-4 sm:mt-6 flex-grow overflow-hidden">
        <div className="w-full overflow-x-auto -mx-3 px-3 pb-2 h-full">
          <CalendarManagement 
            appointments={appointments} 
            onEventSelect={handleEventClick}
            onClientSelect={handleClientSelect}
            onRefresh={refreshAppointments}
          />
        </div>
      </div>

      {/* Modals */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedEvent(null);
          setSelectedDate(null);
          setShowOutOfHoursWarning(false);
        }}
        selectedDate={selectedDate}
        selectedEvent={selectedEvent}
        onAdd={handleAddEvent}
        onUpdate={handleUpdateEvent}
        onDelete={handleDeleteEvent}
        showWarning={showOutOfHoursWarning}
        onApprove={handleApproveRequest}
        onDeny={handleDenyRequest}
        onRefresh={refreshAppointments}
      />

      <WorkingHoursModal
        isOpen={showWorkingHoursModal}
        onClose={() => setShowWorkingHoursModal(false)}
        workingHours={workingHours}
        onSave={updateWorkingHours}
        onCustomHours={() => {
          setShowWorkingHoursModal(false);
          setShowCustomHoursModal(true);
        }}
      />

      <CustomWorkingHoursModal
        isOpen={showCustomHoursModal}
        onClose={() => setShowCustomHoursModal(false)}
        onSave={updateCustomWorkingHours}
        existingHours={customWorkingHours}
      />

      <BookingsListModal
        isOpen={showTodayBookingsModal}
        onClose={() => setShowTodayBookingsModal(false)}
        title="Today's Bookings"
        bookings={todayAppointments.map(appt => ({
          id: appt.id,
          clientId: appt.clientId,
          clientName: appt.clientName,
          service: appt.serviceName,
          time: new Date(appt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'confirmed'
        }))}
        type="today"
        onApprove={handleApproveRequest}
        onDeny={handleDenyRequest}
      />

      <BookingsListModal
        isOpen={showPendingRequestsModal}
        onClose={() => setShowPendingRequestsModal(false)}
        title="Pending Requests"
        bookings={pendingAppointments.map(appt => ({
          id: appt.id,
          clientId: appt.clientId,
          clientName: appt.clientName,
          service: appt.serviceName,
          time: new Date(appt.startTime).toLocaleString([], { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit'
          }),
          status: 'pending'
        }))}
        type="pending"
        onApprove={handleApproveRequest}
        onDeny={handleDenyRequest}
      />

      <AftercareSummaryModal
        isOpen={showAftercareSummaryModal}
        onClose={() => setShowAftercareSummaryModal(false)}
        todayClients={todayAppointments.map(appt => ({
          id: appt.clientId,
          name: appt.clientName,
          services: [{
            id: appt.id,
            name: appt.serviceName
          }]
        }))}
      />

      <ClientProfileModal
        isOpen={showClientProfileModal}
        onClose={() => setShowClientProfileModal(false)}
        clientId={selectedClientId}
        clientName={selectedClientName}
      />
    </div>
  );
};
