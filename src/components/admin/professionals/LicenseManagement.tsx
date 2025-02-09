import React, { useState } from 'react';
import { 
  FileCheck, 
  AlertTriangle, 
  Calendar, 
  Eye, 
  Bell, 
  History, 
  Download, 
  CheckCircle, 
  XCircle, 
  Mail,
  Clock,
  Loader2
} from 'lucide-react';
import { format, isBefore } from 'date-fns';
import { useAdminLicenses, License, LicenseHistory } from '../../../hooks/useAdminLicenses';

interface LicenseManagementProps {
  compact?: boolean;
}

export const LicenseManagement: React.FC<LicenseManagementProps> = ({ compact = false }) => {
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const { licenses, loading, error, sendReminder, approveLicense, rejectLicense } = useAdminLicenses();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600">Error loading licenses: {error.message}</div>
      </div>
    );
  }

  const handleSendReminder = async (licenseId: string) => {
    try {
      await sendReminder(licenseId);
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  };

  const handleApproveLicense = async (licenseId: string) => {
    try {
      await approveLicense(licenseId, 'Admin User'); // TODO: Get actual admin name
    } catch (error) {
      console.error('Error approving license:', error);
    }
  };

  const handleRejectLicense = async (licenseId: string) => {
    try {
      await rejectLicense(licenseId, 'Admin User', 'License requirements not met'); // TODO: Add rejection reason input
    } catch (error) {
      console.error('Error rejecting license:', error);
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Expiring Licenses</h3>
        <div className="space-y-4">
          {licenses
            .filter(license => license.status === 'expiring_soon')
            .slice(0, 3)
            .map(license => (
              <div key={license.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{license.professionalName}</p>
                  <p className="text-sm text-gray-500">
                    Expires {format(new Date(license.expirationDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSendReminder(license.id)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Bell className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedLicense(license)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h3 className="text-lg font-medium text-gray-900">License Management</h3>
            <p className="mt-2 text-sm text-gray-700">
              Monitor and manage professional licenses
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <div className="flex space-x-3">
              <button
                onClick={() => setShowHistory(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <History className="h-4 w-4 mr-2" />
                View History
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                  Professional
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  License Type
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  License Number
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  State
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Expiration
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {licenses.map(license => (
                <tr key={license.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3">
                    <div className="font-medium text-gray-900">{license.professionalName}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {license.type}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {license.licenseNumber}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {license.state}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      license.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : license.status === 'expiring_soon'
                        ? 'bg-yellow-100 text-yellow-800'
                        : license.status === 'expired'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {license.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {license.status === 'expiring_soon' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {license.status === 'expired' && <XCircle className="h-3 w-3 mr-1" />}
                      {license.status === 'pending_approval' && <Clock className="h-3 w-3 mr-1" />}
                      {license.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isBefore(new Date(license.expirationDate), new Date())
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(license.expirationDate), 'MMM d, yyyy')}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-2">
                      {license.status === 'expiring_soon' && (
                        <button
                          onClick={() => handleSendReminder(license.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Send Reminder"
                        >
                          <Bell className="h-5 w-5" />
                        </button>
                      )}
                      {license.status === 'pending_approval' && (
                        <>
                          <button
                            onClick={() => handleApproveLicense(license.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleRejectLicense(license.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setSelectedLicense(license);
                          setShowDocumentModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                        title="View Document"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* License History Modal */}
      {showHistory && selectedLicense && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">License History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {selectedLicense.history?.map((entry: LicenseHistory) => (
                <div key={entry.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    entry.action === 'approved' ? 'bg-green-100' :
                    entry.action === 'expired' ? 'bg-red-100' :
                    entry.action === 'renewed' ? 'bg-blue-100' :
                    'bg-yellow-100'
                  }`}>
                    {entry.action === 'approved' && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {entry.action === 'expired' && <XCircle className="h-5 w-5 text-red-600" />}
                    {entry.action === 'renewed' && <History className="h-5 w-5 text-blue-600" />}
                    {entry.action === 'downgraded' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)} by {entry.adminName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(entry.date), 'MMM d, yyyy h:mm a')}
                    </p>
                    {entry.notes && (
                      <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Document View Modal */}
      {showDocumentModal && selectedLicense && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">License Document</h3>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            {selectedLicense.documentUrl ? (
              <iframe
                src={selectedLicense.documentUrl}
                className="w-full h-[600px] rounded-lg"
                title="License Document"
              />
            ) : (
              <div className="aspect-[16/9] bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Download className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">No document available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
