import React, { useState } from 'react';
import { MessageSquare, Clock, User, CheckCircle } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  clientName: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  lastUpdated: string;
}

export const SupportTickets = () => {
  const [tickets] = useState<Ticket[]>([
    {
      id: '1',
      subject: 'Cannot access booking system',
      clientName: 'Emma Wilson',
      category: 'Technical',
      priority: 'high',
      status: 'open',
      createdAt: '2024-03-15T10:30:00Z',
      lastUpdated: '2024-03-15T10:30:00Z'
    },
    {
      id: '2',
      subject: 'Payment issue',
      clientName: 'James Brown',
      category: 'Billing',
      priority: 'medium',
      status: 'in_progress',
      createdAt: '2024-03-14T15:45:00Z',
      lastUpdated: '2024-03-14T16:30:00Z'
    }
  ]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Support Tickets</h3>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                <div className="flex items-center mt-1">
                  <User className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-500">{ticket.clientName}</span>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                ticket.priority === 'high'
                  ? 'bg-red-100 text-red-800'
                  : ticket.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {ticket.priority}
              </span>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <span className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(ticket.lastUpdated).toLocaleDateString()}
                </span>
                <span className={`flex items-center text-sm ${
                  ticket.status === 'resolved'
                    ? 'text-green-600'
                    : ticket.status === 'in_progress'
                    ? 'text-blue-600'
                    : 'text-yellow-600'
                }`}>
                  {ticket.status === 'resolved' && <CheckCircle className="h-4 w-4 mr-1" />}
                  {ticket.status === 'in_progress' && <MessageSquare className="h-4 w-4 mr-1" />}
                  {ticket.status}
                </span>
              </div>
              <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                View Ticket
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};