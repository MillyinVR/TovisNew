import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Star, AlertCircle } from 'lucide-react';

interface Appointment {
  id: string;
  professionalName: string;
  professionalAvatar: string;
  service: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'requested' | 'waitlisted' | 'completed' | 'cancelled';
  position?: number; // For waitlist position
  rating?: number;
}

type AppointmentFilter = 'upcoming' | 'requested' | 'waitlisted';

export const AppointmentsTab = () => {
  const [activeFilter, setActiveFilter] = useState<AppointmentFilter>('upcoming');

  const appointments: Appointment[] = [
    {
      id: '1',
      professionalName: 'Sarah Johnson',
      professionalAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      service: 'Bridal Makeup',
      date: '2024-03-20',
      time: '10:00 AM',
      location: 'New York, NY',
      status: 'upcoming',
      rating: 4.9
    },
    {
      id: '2',
      professionalName: 'Mike Thompson',
      professionalAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      service: 'Haircut & Style',
      date: '2024-03-25',
      time: '2:30 PM',
      location: 'Los Angeles, CA',
      status: 'requested',
      rating: 4.8
    },
    {
      id: '3',
      professionalName: 'Emma Davis',
      professionalAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
      service: 'Nail Art',
      date: '2024-03-30',
      time: '3:00 PM',
      location: 'Chicago, IL',
      status: 'waitlisted',
      position: 2,
      rating: 4.7
    }
  ];

  const filteredAppointments = appointments.filter(
    appointment => appointment.status === activeFilter
  );

  const handleReschedule = (appointmentId: string) => {
    console.log('Reschedule appointment:', appointmentId);
  };

  const handleCancel = (appointmentId: string) => {
    console.log('Cancel appointment:', appointmentId);
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg w-fit">
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
          {filteredAppointments.length === 0 ? (
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
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      {appointment.status === 'waitlisted' ? 'Leave Waitlist' : 'Cancel'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};