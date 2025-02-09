import React from 'react';
import { Plus, UserPlus, Settings, AlertTriangle } from 'lucide-react';

export const QuickActions = () => {
  const actions = [
    {
      name: 'Add Service',
      icon: Plus,
      onClick: () => console.log('Add Service clicked')
    },
    {
      name: 'Verify Professional',
      icon: UserPlus,
      onClick: () => console.log('Verify Professional clicked')
    },
    {
      name: 'System Settings',
      icon: Settings,
      onClick: () => console.log('System Settings clicked')
    },
    {
      name: 'View Issues',
      icon: AlertTriangle,
      onClick: () => console.log('View Issues clicked')
    }
  ];

  return (
    <div className="flex space-x-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.name}
            onClick={action.onClick}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Icon className="h-4 w-4 mr-2" />
            {action.name}
          </button>
        );
      })}
    </div>
  );
};