import React, { useState } from 'react';
import { AlertTriangle, DollarSign, MessageSquare, Clock } from 'lucide-react';

interface Dispute {
  id: string;
  clientName: string;
  professionalName: string;
  service: string;
  amount: number;
  date: string;
  status: 'open' | 'mediation' | 'resolved';
  reason: string;
}

export const DisputeResolution = () => {
  const [disputes] = useState<Dispute[]>([
    {
      id: '1',
      clientName: 'Emma Wilson',
      professionalName: 'Sarah Johnson',
      service: 'Bridal Makeup',
      amount: 250,
      date: '2024-03-15T10:30:00Z',
      status: 'open',
      reason: 'Service quality issues'
    },
    {
      id: '2',
      clientName: 'James Brown',
      professionalName: 'Michael Chen',
      service: 'Haircut',
      amount: 85,
      date: '2024-03-14T15:45:00Z',
      status: 'mediation',
      reason: 'Pricing dispute'
    }
  ]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Active Disputes</h3>
      <div className="space-y-4">
        {disputes.map((dispute) => (
          <div key={dispute.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{dispute.clientName}</h4>
                <p className="text-sm text-gray-500">{dispute.service}</p>
              </div>
              <div className="flex items-center text-gray-900">
                <DollarSign className="h-4 w-4 mr-1" />
                {dispute.amount}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">{dispute.reason}</p>
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <span className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(dispute.date).toLocaleDateString()}
                </span>
                <span className={`flex items-center text-sm ${
                  dispute.status === 'resolved'
                    ? 'text-green-600'
                    : dispute.status === 'mediation'
                    ? 'text-blue-600'
                    : 'text-yellow-600'
                }`}>
                  {dispute.status === 'mediation' && <MessageSquare className="h-4 w-4 mr-1" />}
                  {dispute.status === 'open' && <AlertTriangle className="h-4 w-4 mr-1" />}
                  {dispute.status}
                </span>
              </div>
              <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                Review Case
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};