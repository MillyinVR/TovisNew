import React, { useState, useRef } from 'react';
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
import { TimeSlot, WorkingHours } from '../../../types/calendar';
import { EventModal } from './modals/EventModal';
import { WorkingHoursModal } from './modals/WorkingHoursModal';
import { CustomWorkingHoursModal } from './modals/CustomWorkingHoursModal';
import { BookingsListModal } from './modals/BookingsListModal';
import { AftercareSummaryModal } from './modals/AftercareSummaryModal';
import './calendar.css';

interface CustomWorkingHours {
  date: string;
  start: string;
  end: string;
}

interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  service: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export const BookingCalendar = () => {
  const calendarRef = useRef<any>(null);
  const [events, setEvents] = useState<TimeSlot[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showWorkingHoursModal, setShowWorkingHoursModal] = useState(false);
  const [showCustomHoursModal, setShowCustomHoursModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimeSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: { start: '09:00', end: '17:00', enabled: true },
    tuesday: { start: '09:00', end: '17:00', enabled: true },
    wednesday: { start: '09:00', end: '17:00', enabled: true },
    thursday: { start: '09:00', end: '17:00', enabled: true },
    friday: { start: '09:00', end: '17:00', enabled: true },
    saturday: { start: '10:00', end: '15:00', enabled: false },
    sunday: { start: '10:00', end: '15:00', enabled: false },
  });
  const [customWorkingHours, setCustomWorkingHours] = useState<CustomWorkingHours[]>([]);
  const [showOutOfHoursWarning, setShowOutOfHoursWarning] = useState(false);
  const [showTodayBookingsModal, setShowTodayBookingsModal] = useState(false);
  const [showPendingRequestsModal, setShowPendingRequestsModal] = useState(false);
  const [showAftercareSummaryModal, setShowAftercareSummaryModal] = useState(false);

  // Mock data for today's bookings
  const todayBookings: Booking[] = [
    {
      id: '1',
      clientId: 'client1',
      clientName: 'Sarah Johnson',
      service: 'Hair Styling',
      time: '10:00 AM',
      status: 'confirmed'
    },
    {
      id: '2',
      clientId: 'client2',
      clientName: 'Emma Davis',
      service: 'Makeup',
      time: '2:00 PM',
      status: 'confirmed'
    },
    {
      id: '3',
      clientId: 'client3',
      clientName: 'Maria Garcia',
      service: 'Nail Art',
      time: '4:30 PM',
      status: 'confirmed'
    }
  ];

  // Mock data for pending requests
  const pendingRequests: Booking[] = [
    {
      id: '4',
      clientId: 'client4',
      clientName: 'Jessica Wilson',
      service: 'Hair Coloring',
      time: 'Tomorrow, 11:00 AM',
      status: 'pending'
    },
    {
      id: '5',
      clientId: 'client5',
      clientName: 'Amanda Brown',
      service: 'Full Makeup',
      time: 'Tomorrow, 3:00 PM',
      status: 'pending'
    }
  ];

  // Handle approve/deny actions
  const handleApproveRequest = (bookingId: string) => {
    try {
      // In a real app, this would make an API call
      console.log('Approved booking:', bookingId);
    } catch (error) {
      console.error('Error approving booking:', error);
    }
  };

  const handleDenyRequest = (bookingId: string) => {
    try {
      // In a real app, this would make an API call
      console.log('Denied booking:', bookingId);
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
      const event = events.find(e => e.id === clickInfo.event.id);
      if (event) {
        setSelectedEvent(event);
        setShowEventModal(true);
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

      return [...regularHours, ...customHours];
    } catch (error) {
      console.error('Error getting business hours:', error);
      return []; // Return empty array on error
    }
  };

  const handleAddEvent = (eventData: Partial<TimeSlot>) => {
    try {
      if (!selectedDate) return;

      const newEvent: TimeSlot = {
        id: Date.now().toString(),
        start: selectedDate.toISOString(),
        end: addMinutes(selectedDate, 60).toISOString(),
        title: eventData.title || 'New Event',
        type: eventData.type || 'blocked',
        service: eventData.service || '',
        status: eventData.status || 'scheduled',
        ...eventData
      };

      setEvents([...events, newEvent]);
      setShowEventModal(false);
      setSelectedDate(null);
      setShowOutOfHoursWarning(false);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleUpdateEvent = (eventData: Partial<TimeSlot>) => {
    try {
      if (!selectedEvent) return;

      const updatedEvents = events.map(event => {
        if (event.id === selectedEvent.id) {
          return {
            ...event,
            ...eventData
          };
        }
        return event;
      });

      setEvents(updatedEvents);
      setShowEventModal(false);
      setSelectedEvent(null);
      setShowOutOfHoursWarning(false);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    try {
      setEvents(events.filter(event => event.id !== eventId));
      setShowEventModal(false);
      setSelectedEvent(null);
      setShowOutOfHoursWarning(false);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Calendar Management */}
      <div className="bg-[#1a1a1a] p-4 sm:p-6 rounded-lg shadow-sm text-white mt-8 flex-none">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-lg font-medium text-white">Calendar Management</h2>
            <p className="text-sm text-gray-400">
              Manage your availability and appointments
            </p>
          </div>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => setShowWorkingHoursModal(true)}
              className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-[#262626] hover:bg-[#333333] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Settings className="h-5 w-5 mr-2" />
              Working Hours
            </button>
            <button
              onClick={() => {
                setSelectedEvent(null);
                setSelectedDate(new Date());
                setShowEventModal(true);
              }}
              className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Plus className="h-5 w-5 mr-2" />
              Block Time
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => setShowTodayBookingsModal(true)}
            className="bg-[#262626] p-3 sm:p-4 rounded-lg hover:bg-[#333333] transition-colors w-full text-left"
          >
            <div className="flex items-center">
              <Users className="h-6 w-6 text-indigo-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Today's Bookings</p>
                <h3 className="text-lg font-semibold text-white">{todayBookings.length}</h3>
              </div>
            </div>
          </button>
          <div className="bg-[#262626] p-3 sm:p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Available Hours</p>
                <h3 className="text-lg font-semibold text-white">6</h3>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowPendingRequestsModal(true)}
            className="bg-[#262626] p-3 sm:p-4 rounded-lg hover:bg-[#333333] transition-colors w-full text-left"
          >
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-yellow-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Pending Requests</p>
                <h3 className="text-lg font-semibold text-white">{pendingRequests.length}</h3>
              </div>
            </div>
          </button>
          <div className="bg-[#262626] p-3 sm:p-4 rounded-lg">
            <div className="flex items-center">
              <CalendarIcon className="h-6 w-6 text-purple-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Blocked Time</p>
                <h3 className="text-lg font-semibold text-white">3 hrs</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="calendar-wrapper bg-white p-2 sm:p-4 rounded-lg shadow-sm mt-4">
        <div className="calendar-container">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'customToday prev,next',
              center: 'timeGridDay,timeGridWeek,dayGridMonth',
              right: 'title'
            }}
            customButtons={{
              customToday: {
                text: new Date().getDate().toString(),
                click: () => {
                  const calendarApi = calendarRef.current.getApi();
                  calendarApi.today();
                }
              }
            }}
            titleFormat={{ year: 'numeric', month: 'long', day: '2-digit' }}
            allDaySlot={false}
            views={{
              timeGridDay: {
                slotDuration: '00:15:00',
                slotLabelInterval: '00:15:00',
                slotLabelFormat: {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true,
                  meridiem: 'short'
                }
              },
              timeGridWeek: {
                dayHeaderContent: (args) => {
                  const date = args.date.getDate();
                  const weekday = args.date.toLocaleDateString('en-US', { weekday: 'short' });
                  return {
                    html: `<div class="fc-col-header-cell-cushion">
                      <span class="date-number">${date}</span>
                      <span class="weekday-name">${weekday}</span>
                    </div>`
                  };
                },
                slotDuration: '00:15:00',
                slotLabelInterval: '00:15:00',
                slotLabelFormat: {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true,
                  meridiem: 'short'
                }
              },
              dayGridMonth: {
                dayHeaderContent: (args) => {
                  return args.date.toLocaleDateString('en-US', { weekday: 'short' });
                }
              }
            }}
            height="100%"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={events.map(event => ({
              ...event,
              className: `event-${event.type}`,
              backgroundColor: event.type === 'booking' 
                ? '#4F46E5' 
                : event.type === 'blocked'
                ? '#EF4444'
                : '#10B981'
            }))}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            dateClick={handleDateClick}
            scrollTime="06:00:00"
            slotDuration="00:15:00"
            snapDuration="00:15:00"
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              meridiem: 'short',
              omitZeroMinute: true
            }}
            slotMinWidth={65}
            slotLaneClassNames="calendar-slot-lane"
            businessHours={getBusinessHours()}
            nowIndicator={true}
            selectConstraint="businessHours"
            selectOverlap={false}
            eventOverlap={false}
            slotEventOverlap={false}
            handleWindowResize={true}
            stickyHeaderDates={false}
            firstDay={1}
            weekNumbers={false}
            navLinks={true}
            initialDate={selectedDate || undefined}
            selectAllow={(selectInfo) => {
              setShowOutOfHoursWarning(checkIfOutsideWorkingHours(selectInfo.start));
              return true;
            }}
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
      />

      <WorkingHoursModal
        isOpen={showWorkingHoursModal}
        onClose={() => setShowWorkingHoursModal(false)}
        workingHours={workingHours}
        onSave={setWorkingHours}
        onCustomHours={() => {
          setShowWorkingHoursModal(false);
          setShowCustomHoursModal(true);
        }}
      />

      <CustomWorkingHoursModal
        isOpen={showCustomHoursModal}
        onClose={() => setShowCustomHoursModal(false)}
        onSave={setCustomWorkingHours}
        existingHours={customWorkingHours}
      />

      <BookingsListModal
        isOpen={showTodayBookingsModal}
        onClose={() => setShowTodayBookingsModal(false)}
        title="Today's Bookings"
        bookings={todayBookings}
        type="today"
        onApprove={handleApproveRequest}
        onDeny={handleDenyRequest}
      />

      <BookingsListModal
        isOpen={showPendingRequestsModal}
        onClose={() => setShowPendingRequestsModal(false)}
        title="Pending Requests"
        bookings={pendingRequests}
        type="pending"
        onApprove={handleApproveRequest}
        onDeny={handleDenyRequest}
      />

      <AftercareSummaryModal
        isOpen={showAftercareSummaryModal}
        onClose={() => setShowAftercareSummaryModal(false)}
        todayClients={todayBookings.map(booking => ({
          id: booking.clientId,
          name: booking.clientName,
          services: [{
            id: booking.id,
            name: booking.service
          }],
          beforeImage: '/placeholder-before.jpg'
        }))}
      />
    </div>
  );
};
