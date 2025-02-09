import React, { useState } from 'react';
import { Settings, Bell, Mail, Globe, DollarSign, Percent, Clock, Calendar } from 'lucide-react';

interface SystemConfig {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  booking: {
    advanceNotice: number;
    cancellationWindow: number;
    maxBookingsPerDay: number;
  };
  commission: {
    rate: number;
    minimumPayout: number;
    payoutSchedule: 'weekly' | 'biweekly' | 'monthly';
  };
  localization: {
    timezone: string;
    currency: string;
    dateFormat: string;
  };
}

export const SystemConfiguration = () => {
  const [config, setConfig] = useState<SystemConfig>({
    notifications: {
      email: true,
      sms: true,
      push: false
    },
    booking: {
      advanceNotice: 24,
      cancellationWindow: 48,
      maxBookingsPerDay: 10
    },
    commission: {
      rate: 15,
      minimumPayout: 100,
      payoutSchedule: 'weekly'
    },
    localization: {
      timezone: 'America/New_York',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY'
    }
  });

  const handleConfigChange = (section: keyof SystemConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">System Configuration</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage system-wide settings and preferences
          </p>
        </div>
        <Settings className="h-6 w-6 text-gray-400" />
      </div>

      <div className="space-y-6">
        {/* Notification Settings */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Notification Settings</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-700">Email Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notifications.email}
                  onChange={(e) => handleConfigChange('notifications', 'email', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-700">SMS Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notifications.sms}
                  onChange={(e) => handleConfigChange('notifications', 'sms', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-700">Push Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notifications.push}
                  onChange={(e) => handleConfigChange('notifications', 'push', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};