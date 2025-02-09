import React, { useState } from 'react';
import { ClipboardList, Search, Plus, Calendar, User } from 'lucide-react';
import { AftercareSummaryCreator } from '../aftercare/AftercareSummaryCreator';
import { AftercareSummary } from '../../../types/aftercare';

interface Client {
  id: string;
  name: string;
  appointmentTime: string;
  service: string;
}

export const AftercareSummaries = () => {
  const [showCreator, setShowCreator] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - In production, fetch from your backend
  const todaysClients: Client[] = [
    {
      id: '1',
      name: 'Emma Wilson',
      appointmentTime: '10:00 AM',
      service: 'Bridal Makeup'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      appointmentTime: '2:30 PM',
      service: 'Hair Styling'
    }
  ];

  const handleSaveSummary = async (summary: AftercareSummary) => {
    try {
      // In production, send to backend
      console.log('Saving summary:', summary);
      setShowCreator(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Failed to save summary:', error);
    }
  };

  const filteredClients = todaysClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {!showCreator ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Aftercare Summaries</h2>
              <p className="text-sm text-gray-500">
                Create and manage aftercare instructions for your clients
              </p>
            </div>
            <button
              onClick={() => setShowCreator(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Summary
            </button>
          </div>

          {/* Client Selection */}
          {showCreator && !selectedClient && (
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search clients..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>

              <div className="mt-4 space-y-2">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{client.name}</p>
                        <p className="text-sm text-gray-500">{client.service}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {client.appointmentTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Summaries */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Recent Summaries</h3>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-center text-gray-500 py-8">
                No recent summaries to display
              </p>
            </div>
          </div>
        </div>
      ) : (
        <AftercareSummaryCreator
          appointmentId={selectedClient?.id || ''}
          clientId={selectedClient?.id || ''}
          onSave={handleSaveSummary}
          onCancel={() => {
            setShowCreator(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
};