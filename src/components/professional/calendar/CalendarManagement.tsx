import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer, Event } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from '../../../contexts/AuthContext';
import { useCalendar } from '../../../hooks/useCalendar';
import { Appointment, AppointmentStatus } from '../../../types/appointment';
import { CalendarEvent } from '../../../types/calendar';

interface RBGEvent extends Event, CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: AppointmentStatus;
  service: string;
}

const localizer = momentLocalizer(moment);

interface CalendarManagementProps {
  appointments: Appointment[];
  onEventSelect: (event: CalendarEvent) => void;
}

export const CalendarManagement: React.FC<CalendarManagementProps> = ({
  appointments,
  onEventSelect,
}) => {
  const { currentUser } = useAuth();
  const { events: calendarEvents } = useCalendar();
  const [events, setEvents] = useState<RBGEvent[]>([]);

  useEffect(() => {
    if (appointments.length > 0) {
      const mappedEvents = appointments.map((appt) => ({
        id: appt.id,
        title: appt.serviceName || 'Appointment',
        start: new Date(appt.startTime),
        end: new Date(appt.endTime),
        status: appt.status,
        type: 'booking' as const,
        service: appt.serviceName || 'Service',
        serviceName: appt.serviceName,
        startTime: appt.startTime,
        endTime: appt.endTime
      }));
      setEvents(mappedEvents);
    }
  }, [appointments]);

  const handleSelectEvent = (event: RBGEvent) => {
    onEventSelect(event);
  };

  return (
    <div className="h-[800px]">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Appointment Calendar</h2>
      </div>
  
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelectEvent}
        defaultView="week"
        views={['month','week','day']}
        min={new Date(0, 0, 0, 8, 0, 0)}
        max={new Date(0, 0, 0, 20, 0, 0)}
        eventPropGetter={(event: RBGEvent) => {
          const status = event.status;
          return {
            style: {
              backgroundColor:
                status === AppointmentStatus.SCHEDULED
                  ? '#10B981'
                  : status === AppointmentStatus.PENDING
                  ? '#FBBF24'
                  : '#EF4444',
            },
          };
        }}
      />
    </div>
  );
};
