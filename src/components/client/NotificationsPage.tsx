import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { FooterNav } from '../shared/FooterNav';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage = () => {
  const { notifications } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h1 className="ml-2 text-xl font-semibold text-gray-900">Notifications</h1>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div key={notification.id} className="p-4 mb-2 bg-white rounded-lg shadow-sm">
                <div className="text-sm text-gray-700">{notification.message}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(notification.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500">No new notifications</div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0">
        <FooterNav userType="client" />
      </div>
    </div>
  );
};
