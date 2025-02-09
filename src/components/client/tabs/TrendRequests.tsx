import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface TrendRequest {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export const TrendRequests = () => {
  const [requests, setRequests] = useState<TrendRequest[]>([
    {
      id: '1',
      title: 'Cloud Skin',
      status: 'pending',
      submittedAt: '2024-03-15T10:00:00Z'
    }
  ]);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [newRequestTitle, setNewRequestTitle] = useState('');

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: TrendRequest = {
      id: Date.now().toString(),
      title: newRequestTitle,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    setRequests([...requests, newRequest]);
    setNewRequestTitle('');
    setShowNewRequestModal(false);
  };

  const handleCancelRequest = (requestId: string) => {
    setRequests(requests.filter(request => request.id !== requestId));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Your Trend Requests</h2>
        <button
          onClick={() => setShowNewRequestModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {requests.map((request) => (
            <li key={request.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{request.title}</p>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : request.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancelRequest(request.id)}
                    className="ml-2 flex-shrink-0 text-gray-400 hover:text-red-500"
                  >
                    Cancel Request
                  </button>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Submitted on {new Date(request.submittedAt).toLocaleDateString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">New Trend Request</h3>
              <button
                onClick={() => setShowNewRequestModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitRequest}>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Trend Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newRequestTitle}
                  onChange={(e) => setNewRequestTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., Glass Skin Makeup"
                  required
                />
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewRequestModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};