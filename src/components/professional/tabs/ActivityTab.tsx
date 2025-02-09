import React, { useState } from 'react';
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
  const [filter, setFilter] = useState<Activity['type'] | 'all'>('all');
  
  const activities: Activity[] = [
    {
      id: '1',
      type: 'appointment',
      title: 'New Appointment Request',
      description: 'Sarah Johnson requested a Bridal Makeup appointment for March 20th',
      timestamp: '2024-03-15T10:30:00Z',
      status: 'pending',
      action: {
        label: 'Review Request',
        onClick: () => console.log('Review appointment request')
      }
    },
    {
      id: '2',
      type: 'review',
      title: 'New Review',
      description: 'Emma Wilson left a 5-star review for your Soft Glam service',
      timestamp: '2024-03-15T09:45:00Z',
      action: {
        label: 'View Review',
        onClick: () => console.log('View review')
      }
    },
    {
      id: '3',
      type: 'favorite',
      title: 'Added to Favorites',
      description: 'Your profile was added to favorites by 3 new clients',
      timestamp: '2024-03-15T08:20:00Z'
    },
    {
      id: '4',
      type: 'aftercare',
      title: 'Aftercare Summary Viewed',
      description: 'Client viewed and confirmed their aftercare instructions',
      timestamp: '2024-03-14T15:30:00Z',
      status: 'completed'
    },
    {
      id: '5',
      type: 'lastminute',
      title: 'Last Minute Opportunity',
      description: 'Fill an empty slot today at 3 PM with 20% higher earnings',
      timestamp: '2024-03-14T14:00:00Z',
      status: 'urgent',
      action: {
        label: 'Opt In',
        onClick: () => console.log('Opt in for last minute')
      }
    },
    {
      id: '6',
      type: 'trending',
      title: 'Trending Service Alert',
      description: 'Chrome Girl Nails is trending in your area',
      timestamp: '2024-03-14T13:15:00Z',
      action: {
        label: 'Add Service',
        onClick: () => console.log('Add trending service')
      }
    }
  ];

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
      <FooterNav />
    </div>
  );
};