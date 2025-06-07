import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FooterNav } from '../../shared/FooterNav';
import { 
  Bell, 
  Calendar, 
  Star, 
  Heart, 
  ClipboardList, 
  Clock,
  TrendingUp,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useNotifications } from '../../../hooks/useNotifications';
import { useProfessionalAppointments } from '../../../hooks/useProfessionalAppointments';
import { format, parseISO } from 'date-fns';
import { AppointmentStatus } from '../../../types/appointment';

interface Activity {
  id: string;
  type: 'appointment' | 'review' | 'favorite' | 'aftercare' | 'lastminute' | 'trending';
  title: string;
  description: string;
  timestamp: string;
  status?: 'pending' | 'completed' | 'urgent';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const ActivityTab = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Activity['type'] | 'all'>('all');
  const { notifications } = useNotifications();
  const { pendingAppointments } = useProfessionalAppointments();
  const [activities, setActivities] = useState<Activity[]>([]);
  
  // Convert notifications and pending appointments to activities
  useEffect(() => {
    const notificationActivities = notifications.map(notification => {
      // Determine activity type based on notification type
      let type: Activity['type'] = 'appointment';
      if (notification.type?.includes('review')) type = 'review';
      else if (notification.type?.includes('favorite')) type = 'favorite';
      else if (notification.type?.includes('aftercare')) type = 'aftercare';
      
      return {
        id: notification.id,
        type,
        title: notification.message,
        description: notification.message,
        timestamp: notification.timestamp.toISOString(),
        status: notification.read ? 'completed' : 'pending',
        action: type === 'appointment' ? {
          label: 'Review Request',
          onClick: () => navigate('/professional/bookings')
        } : undefined
      } as Activity;
    });
    
    // Convert pending appointments to activities
    const appointmentActivities = pendingAppointments.map(appointment => {
      const formattedDate = format(parseISO(appointment.startTime), 'MMMM d, yyyy');
      const formattedTime = format(parseISO(appointment.startTime), 'h:mm a');
      
      return {
        id: `appointment_${appointment.id}`,
        type: 'appointment',
        title: 'New Appointment Request',
        description: `${appointment.clientName} requested a ${appointment.serviceName} appointment for ${formattedDate} at ${formattedTime}`,
        timestamp: appointment.createdAt,
        status: 'pending',
        action: {
          label: 'Review Request',
          onClick: () => navigate('/professional/bookings')
        }
      } as Activity;
    });
    
    // Combine and sort by timestamp (newest first)
    const allActivities = [...notificationActivities, ...appointmentActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setActivities(allActivities);
  }, [notifications, pendingAppointments, navigate]);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-6 w-6 text-blue-500" />;
      case 'review':
        return <Star className="h-6 w-6 text-yellow-500" />;
      case 'favorite':
        return <Heart className="h-6 w-6 text-red-500" />;
      case 'aftercare':
        return <ClipboardList className="h-6 w-6 text-green-500" />;
      case 'lastminute':
        return <Clock className="h-6 w-6 text-purple-500" />;
      case 'trending':
        return <TrendingUp className="h-6 w-6 text-indigo-500" />;
      default:
        return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusIcon = (status?: Activity['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const filteredActivities = activities.filter(
    activity => filter === 'all' || activity.type === filter
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
            <p className="mt-1 text-sm text-gray-500">
              Stay updated with your latest activities and notifications
            </p>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Activities
              </button>
              <button
                onClick={() => setFilter('appointment')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  filter === 'appointment'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Appointments
              </button>
              <button
                onClick={() => setFilter('review')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  filter === 'review'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Reviews
              </button>
              <button
                onClick={() => setFilter('lastminute')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  filter === 'lastminute'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Last Minute
              </button>
              <button
                onClick={() => setFilter('trending')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  filter === 'trending'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Trending
              </button>
            </div>
          </div>

          {/* Activity List */}
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      {activity.status && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          activity.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : activity.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {getStatusIcon(activity.status)}
                          <span className="ml-1 capitalize">{activity.status}</span>
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {activity.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                      {activity.action && (
                        <button
                          onClick={activity.action.onClick}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                        >
                          {activity.action.label}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <FooterNav userType="professional" />
    </div>
  );
};
