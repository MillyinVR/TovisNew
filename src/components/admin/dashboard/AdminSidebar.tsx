import React from 'react';
import { 
  LayoutDashboard,
  Users,
  Settings,
  HeartHandshake,
  DollarSign,
  Megaphone,
  Package,
  Calendar
} from 'lucide-react';

import { DashboardTab } from './AdminDashboardLayout';

interface AdminSidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

export const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'professionals', label: 'Professionals', icon: Users },
    { id: 'services', label: 'Services', icon: Package },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'support', label: 'Support', icon: HeartHandshake },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="w-64 bg-white shadow-sm min-h-screen flex-shrink-0 overflow-y-auto">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as DashboardTab)}
                className={`${
                  activeTab === item.id
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full`}
              >
                <Icon
                  className={`${
                    activeTab === item.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 h-5 w-5`}
                />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
