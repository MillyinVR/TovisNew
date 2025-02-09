import React, { useState } from 'react';
import { PendingVerifications } from './PendingVerifications';
import { PerformanceMetrics } from './PerformanceMetrics';
import { LicenseManagement } from './LicenseManagement';
import { ProfessionalDirectory } from './ProfessionalDirectory';

export const ProfessionalManagement = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'performance' | 'license' | 'directory'>('pending');

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900 pb-4">Professional Management</h1>
        
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`${
              activeTab === 'pending'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            Pending Verifications
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`${
              activeTab === 'performance'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            Performance Metrics
          </button>
          <button
            onClick={() => setActiveTab('license')}
            className={`${
              activeTab === 'license'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            License Management
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`${
              activeTab === 'directory'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            Professional Directory
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'pending' && <PendingVerifications />}
        {activeTab === 'performance' && <PerformanceMetrics />}
        {activeTab === 'license' && <LicenseManagement />}
        {activeTab === 'directory' && <ProfessionalDirectory />}
      </div>
    </div>
  );
};
