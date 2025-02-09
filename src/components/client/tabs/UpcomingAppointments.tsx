import React from 'react';
import { Calendar, Clock, MapPin, Star } from 'lucide-react';

interface Appointment {
  id: string;
  professionalName: string;
  professionalAvatar: string;
  service: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  rating?: number;
}

export const UpcomingAppointments = () => {
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
      status: 'upcoming',
      rating: 4.8
    }
  ];

  const handleReschedule = (appointmentId: string) => {
    // Implement reschedule logic
    console.log('Reschedule appointment:', appointmentId);
  };

  const handleCancel = (appointmentId: string) => {
    // Implement cancel logic
    console.log('Cancel appointment:', appointmentId);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Upcoming Appointments
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your scheduled beauty services
          </p>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
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
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => handleReschedule(appointment.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleCancel(appointment.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Cancel
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};