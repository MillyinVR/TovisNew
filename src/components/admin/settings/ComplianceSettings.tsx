import React from 'react';
import { Shield, FileText, AlertTriangle } from 'lucide-react';

export const ComplianceSettings = () => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Compliance Settings</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage compliance and regulatory requirements
          </p>
        </div>
        <Shield className="h-6 w-6 text-gray-400" />
      </div>

      <div className="space-y-6">
        {/* Data Retention */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Data Retention</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                User Data Retention (months)
              </label>
              <input
                type="number"
                defaultValue={24}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Transaction History (months)
              </label>
              <input
                type="number"
                defaultValue={36}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Privacy Policy */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Privacy Policy</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Updated
              </label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Policy Version
              </label>
              <input
                type="text"
                defaultValue="1.0.0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
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