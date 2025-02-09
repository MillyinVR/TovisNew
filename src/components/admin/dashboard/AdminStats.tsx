import React from 'react';
import { Users, DollarSign, Calendar, AlertTriangle, FileCheck } from 'lucide-react';

interface Stat {
  name: string;
  value: string;
  change: string;
  icon: typeof Users | typeof DollarSign | typeof Calendar | typeof AlertTriangle | typeof FileCheck;
  color: string;
}

export const AdminStats = () => {
  const stats: Stat[] = [
    // Business Performance Metrics
    {
      name: 'Total Professionals',
      value: '245',
      change: '+12%',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      name: 'Monthly Revenue',
      value: '$45,678',
      change: '+8.2%',
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      name: 'Active Bookings',
      value: '1,234',
      change: '+15%',
      icon: Calendar,
      color: 'text-purple-500'
    },
    // Operational Metrics
    {
      name: 'Pending Professionals',
      value: '24',
      change: '+3',
      icon: Users,
      color: 'text-indigo-500'
    },
    {
      name: 'Expiring Licenses',
      value: '12',
      change: '+2',
      icon: FileCheck,
      color: 'text-yellow-500'
    },
    {
      name: 'Active Complaints',
      value: '8',
      change: '-2',
      icon: AlertTriangle,
      color: 'text-red-500'
    },
    {
      name: "Today's Bookings",
      value: '156',
      change: '+23%',
      icon: Calendar,
      color: 'text-green-500'
    },
    {
      name: 'Open Issues',
      value: '23',
      change: '-5%',
      icon: AlertTriangle,
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
