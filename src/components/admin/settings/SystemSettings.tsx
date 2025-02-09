import React from 'react';
import { SecuritySettings } from './SecuritySettings';
import { RoleManagement } from './RoleManagement';
import { SystemConfiguration } from './SystemConfiguration';

export const SystemSettings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">System Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SecuritySettings />
        <RoleManagement />
      </div>

      <SystemConfiguration />
      {/* Temporarily commented out until ComplianceSettings component is created */}
      {/* <ComplianceSettings /> */}
    </div>
  );
};