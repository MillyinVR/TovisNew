import React, { useState } from 'react';
import { Calendar, Users, TrendingUp, Mail, Edit2, Trash2 } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push';
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  audience: string;
  startDate: string;
  endDate: string;
  metrics: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
}

export const CampaignManagement = () => {
  const [campaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Spring Beauty Sale',
      type: 'email',
      status: 'active',
      audience: 'All Clients',
      startDate: '2024-03-15',
      endDate: '2024-03-30',
      metrics: {
        sent: 1500,
        opened: 750,
        clicked: 300,
        converted: 75
      }
    },
    {
      id: '2',
      name: 'New Client Welcome',
      type: 'email',
      status: 'scheduled',
      audience: 'New Clients',
      startDate: '2024-04-01',
      endDate: '2024-04-15',
      metrics: {
        sent: 0,
        opened: 0,
        clicked: 0,
        converted: 0
      }
    }
  ]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Campaign Management</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage marketing campaigns
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
          <Mail className="h-4 w-4 mr-2" />
          New Campaign
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Audience
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                  <div className="text-sm text-gray-500 capitalize">{campaign.type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    campaign.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : campaign.status === 'scheduled'
                      ? 'bg-yellow-100 text-yellow-800'
                      : campaign.status === 'completed'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{campaign.audience}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span>{((campaign.metrics.converted / campaign.metrics.sent) * 100 || 0).toFixed(1)}% conv.</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {new Date(campaign.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};