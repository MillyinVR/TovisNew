import React from 'react';
import { AlertTriangle, MessageSquare, Clock, CheckCircle } from 'lucide-react';

interface ComplaintsOverviewProps {
  compact?: boolean;
}

export const ComplaintsOverview: React.FC<ComplaintsOverviewProps> = ({ compact = false }) => {
  const complaints = [
    {
      id: '1',
      clientName: 'Emma Wilson',
      professionalName: 'Sarah Johnson',
      service: 'Makeup Session',
      date: '2024-03-15T10:30:00Z',
      status: 'pending',
      priority: 'high',
      description: 'Service not as described, requesting refund'
    },
    {
      id: '2',
      clientName: 'James Brown',
      professionalName: 'Michael Chen',
      service: 'Haircut',
      date: '2024-03-14T15:45:00Z',
      status: 'in_progress',
      priority: 'medium',
      description: 'Appointment started 30 minutes late'
    }
  ];

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Complaints</h3>
        <div className="space-y-4">
          {complaints.slice(0, 3).map((complaint) => (
            <div key={complaint.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {complaint.clientName} → {complaint.professionalName}
                </p>
                <p className="text-sm text-gray-500">{complaint.description}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                complaint.priority === 'high' 
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {complaint.priority}
              </span>
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
            <h3 className="text-lg font-medium text-gray-900">Complaints Overview</h3>
            <p className="mt-2 text-sm text-gray-700">
              Manage and resolve customer complaints
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                  Details
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Service
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Date
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Priority
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {complaints.map((complaint) => (
                <tr key={complaint.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {complaint.clientName} → {complaint.professionalName}
                      </div>
                      <div className="text-sm text-gray-500">{complaint.description}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {complaint.service}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(complaint.date).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      complaint.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {complaint.status === 'pending' ? (
                        <Clock className="h-3 w-3 mr-1" />
                      ) : (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      )}
                      {complaint.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      complaint.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {complaint.priority}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button className="text-indigo-600 hover:text-indigo-900">
                      <MessageSquare className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};