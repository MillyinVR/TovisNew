import React from 'react';
import { AdminStats } from './AdminStats';
import { RecentActivity } from './RecentActivity';
import { SystemHealth } from '../system/SystemHealth';
import { QuickActions } from './QuickActions';
import { ComplaintsOverview } from './ComplaintsOverview';
import { ExpiringLicenses } from './ExpiringLicenses';

export const AdminOverview = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        <QuickActions />
      </div>

      <AdminStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivity compact />
            <SystemHealth />
          </div>
          <div className="mt-6">
            <ExpiringLicenses />
          </div>
        </div>
        <div className="lg:col-span-1">
          <ComplaintsOverview compact />
        </div>
      </div>
    </div>
  );
};
