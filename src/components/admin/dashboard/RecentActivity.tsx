import React from 'react';
import { Activity, User, CheckCircle, XCircle, AlertTriangle, Settings } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityItem {
  id: string;
  adminName: string;
  action: 'approved_professional' | 'rejected_professional' | 'resolved_complaint' | 'updated_settings';
  target: string;
  date: string;
  details: string;
}

interface RecentActivityProps {
  compact?: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ compact = false }) => {
  // Sample activities - in production this would come from a real data source
  const activities: ActivityItem[] = [
    {
      id: '1',
      adminName: 'John Admin',
      action: 'approved_professional',
      target: 'Sarah Johnson',
      date: new Date().toISOString(),
      details: 'Approved makeup artist application'
    },
    {
      id: '2',
      adminName: 'Jane Admin',
      action: 'resolved_complaint',
      target: 'Booking #12345',
      date: new Date(Date.now() - 3600000).toISOString(),
      details: 'Resolved customer complaint and issued partial refund'
    },
    {
      id: '3',
      adminName: 'Mike Admin',
      action: 'updated_settings',
      target: 'System Settings',
      date: new Date(Date.now() - 7200000).toISOString(),
      details: 'Updated booking cancellation policy'
    }
  ];

  const getActionIcon = (action: ActivityItem['action']) => {
    switch (action) {
      case 'approved_professional':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected_professional':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'resolved_complaint':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'updated_settings':
        return <Settings className="h-5 w-5 text-blue-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {activities.slice(0, 3).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              {getActionIcon(activity.action)}
              <div>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.adminName}</span>
                  {' '}{activity.details}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(activity.date), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h3 className="text-lg font-medium text-gray-900">Activity Log</h3>
            <p className="mt-2 text-sm text-gray-700">
              Track administrative actions and system changes
            </p>
          </div>
        </div>
        <div className="mt-6 flow-root">
          <ul className="-mb-8">
            {activities.map((activity, activityIdx) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {activityIdx !== activities.length - 1 ? (
                    <span
                      className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">
                            {activity.adminName}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {format(new Date(activity.date), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        <p>{activity.details}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
