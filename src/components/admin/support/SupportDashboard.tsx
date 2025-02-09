import React from 'react';
import { ComplaintsManagement } from './ComplaintsManagement';
import { DisputeResolution } from './DisputeResolution';
import { ReviewModeration } from './ReviewModeration';
import { SupportTickets } from './SupportTickets';

export const SupportDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Support Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComplaintsManagement />
        <DisputeResolution />
      </div>

      <ReviewModeration />
      <SupportTickets />
    </div>
  );
};