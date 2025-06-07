import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer, Event } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-management.css';
import { useAuth } from '../../../contexts/AuthContext';
import { useCalendar } from '../../../hooks/useCalendar';
import { useWorkingHours } from '../../../hooks/useWorkingHours';
import { useProfessionalAppointments } from '../../../hooks/useProfessionalAppointments';
import { Appointment, AppointmentStatus } from '../../../types/appointment';
import { CalendarEvent } from '../../../types/calendar';

interface RBGEvent extends Event, CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: AppointmentStatus;
  service: string;
  clientId?: string;
  clientName?: string;
}

const localizer = momentLocalizer(moment);

interface CalendarManagementProps {
  appointments: Appointment[];
  onEventSelect: (event: CalendarEvent) => void;
  onClientSelect?: (clientId: string, clientName: string) => void;
  onRefresh?: () => void;
}

export const CalendarManagement: React.FC<CalendarManagementProps> = ({
  appointments,
  onEventSelect,
  onClientSelect,
  onRefresh,
}) => {
  const { currentUser } = useAuth();
  const { events: calendarEvents } = useCalendar();
  const { workingHours } = useWorkingHours();
  const { approveAppointment, cancelAppointment } = useProfessionalAppointments();
  const [events, setEvents] = useState<RBGEvent[]>([]);
  
  // Set to show full 24 hours (using 23:59:59 as end time)
  const [minTime, setMinTime] = useState<Date>(new Date(0, 0, 0, 0, 0, 0));
  const [maxTime, setMaxTime] = useState<Date>(new Date(0, 0, 0, 23, 59, 59));

  // We're not limiting the calendar view to working hours anymore
  // This ensures professionals can see and manage the full 24-hour day

  // Function to refresh events from appointments
  const refreshEvents = () => {
    if (appointments.length > 0) {
      // Show all non-cancelled appointments in the calendar
      const filteredAppointments = appointments.filter(
        appt => appt.status !== AppointmentStatus.CANCELLED
      );
      
      const mappedEvents = filteredAppointments.map((appt) => {
        // Determine if this is a pending appointment
        const isPending = appt.status === AppointmentStatus.REQUESTED || appt.status === AppointmentStatus.PENDING;
        
        // Format the title based on status
        let title = appt.serviceName || 'Appointment';
        if (isPending) {
          // Add [PENDING] prefix if not already present
          if (!title.includes('[PENDING]')) {
            title = `[PENDING] ${title}`;
          }
        } else {
          // Remove [PENDING] prefix if present
          title = title.replace('[PENDING] ', '');
        }
        
        return {
          id: appt.id,
          title: title,
          start: new Date(appt.startTime),
          end: new Date(appt.endTime),
          status: appt.status,
          type: 'booking' as const,
          service: appt.serviceName || 'Service',
          serviceName: appt.serviceName,
          startTime: appt.startTime,
          endTime: appt.endTime,
          clientId: appt.clientId,
          clientName: appt.clientName
        };
      });
      setEvents(mappedEvents);
    }
  };

  // Refresh events when appointments change
  useEffect(() => {
    refreshEvents();
  }, [appointments]);

  const handleSelectEvent = (event: RBGEvent) => {
    console.log('Event selected:', event);
    // Convert RBGEvent to CalendarEvent format
    const calendarEvent: CalendarEvent = {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      status: event.status,
      type: event.type || 'booking',
      service: event.service || '',
      serviceName: event.service || '',
      startTime: event.start.toISOString(),
      endTime: event.end.toISOString(),
      clientName: event.clientName,
      extendedProps: {
        clientId: event.clientId,
        appointmentId: event.id
      }
    };
    onEventSelect(calendarEvent);
  };

  const handleApproveAppointment = async (event: RBGEvent, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event selection
    try {
      if (event.id) {
        await approveAppointment(event.id);
        console.log('Appointment approved:', event.id);
        
        // Update the events state to reflect the change
        setEvents(prevEvents => 
          prevEvents.map(evt => {
            if (evt.id === event.id) {
              return {
                ...evt,
                status: AppointmentStatus.SCHEDULED,
                title: evt.title.replace('[PENDING] ', '')
              };
            }
            return evt;
          })
        );
        
        // Call the onRefresh prop to refresh appointments from the parent component
        if (onRefresh) {
          onRefresh();
        }
        
        // Also refresh local events after a short delay
        setTimeout(refreshEvents, 500);
      }
    } catch (error) {
      console.error('Error approving appointment:', error);
    }
  };

  const handleDenyAppointment = async (event: RBGEvent, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event selection
    try {
      if (event.id) {
        await cancelAppointment(event.id, 'Appointment request denied by professional');
        console.log('Appointment denied:', event.id);
        
        // Remove the denied appointment from the events state
        setEvents(prevEvents => prevEvents.filter(evt => evt.id !== event.id));
        
        // Call the onRefresh prop to refresh appointments from the parent component
        if (onRefresh) {
          onRefresh();
        }
        
        // Also refresh local events after a short delay
        setTimeout(refreshEvents, 500);
      }
    } catch (error) {
      console.error('Error denying appointment:', error);
    }
  };

  const handleClientClick = (clientId: string | undefined, clientName: string | undefined, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event selection
    if (clientId && clientName && onClientSelect) {
      onClientSelect(clientId, clientName);
    }
  };

  return (
    <div className="h-auto min-h-[500px] md:min-h-[600px] lg:min-h-[800px] w-full">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h2 className="text-xl font-semibold mb-2 sm:mb-0">Appointment Calendar</h2>
      </div>
  
      <div className="calendar-container w-full overflow-x-auto">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          defaultView="week"
          views={['month','week','day']}
          min={minTime}
          max={maxTime}
          style={{ height: '100%', minHeight: '500px', width: '100%' }}
          eventPropGetter={(event: RBGEvent) => {
            const status = event.status;
            return {
              style: {
                backgroundColor:
                  status === AppointmentStatus.SCHEDULED
                    ? '#10B981' // Green for confirmed
                    : status === AppointmentStatus.COMPLETED
                    ? '#8B5CF6' // Purple for completed
                    : status === AppointmentStatus.REQUESTED || status === AppointmentStatus.PENDING
                    ? '#FBBF24' // Yellow for pending/requested
                    : '#EF4444', // Red for others (cancelled)
                border: (status === AppointmentStatus.REQUESTED || status === AppointmentStatus.PENDING) 
                  ? '2px dashed #F59E0B' // Dashed border for pending/requested
                  : 'none',
                opacity: (status === AppointmentStatus.REQUESTED || status === AppointmentStatus.PENDING) 
                  ? 0.8 // Slightly transparent for pending/requested
                  : 1,
              },
              className: (status === AppointmentStatus.REQUESTED || status === AppointmentStatus.PENDING)
                ? 'pending-appointment' // Add a class for additional styling if needed
                : '',
            };
          }}
          components={{
            event: (props) => {
              const event = props.event as RBGEvent;
              const isPending = event.status === AppointmentStatus.REQUESTED || event.status === AppointmentStatus.PENDING;
              
              return (
                <div className={`rbc-event-content ${isPending ? 'pending-event-container' : ''}`}>
                  <div className="event-title">{event.title}</div>
                  
                  {isPending && (
                    <>
                      <div className="client-name" onClick={(e) => handleClientClick(event.clientId, event.clientName, e)}>
                        <span className="text-xs font-medium text-blue-600 hover:underline cursor-pointer">
                          {event.clientName || 'Client'}
                        </span>
                      </div>
                      <div className="pending-event-actions">
                        <button 
                          className="pending-approve-btn" 
                          onClick={(e) => handleApproveAppointment(event, e)}
                          title="Approve"
                        >
                          ✓
                        </button>
                        <button 
                          className="pending-deny-btn" 
                          onClick={(e) => handleDenyAppointment(event, e)}
                          title="Deny"
                        >
                          ✕
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            }
          }}
        />
      </div>
    </div>
  );
};
