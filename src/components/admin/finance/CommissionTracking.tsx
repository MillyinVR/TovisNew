import React from 'react';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

interface Commission {
  id: string;
  professionalName: string;
  amount: number;
  bookings: number;
  period: string;
  status: 'pending' | 'paid';
}

export const CommissionTracking = () => {
  const commissions: Commission[] = [
    {
      id: 'COM-123',
      professionalName: 'Sarah Johnson',
      amount: 450,
      bookings: 15,
      period: 'March 2024',
      status: 'pending'
    },
    {
      id: 'COM-124',
      professionalName: 'Michael Chen',
      amount: 380,
      bookings: 12,
      period: 'March 2024',
      status: 'pending'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Commission Tracking</h3>
      <div className="space-y-4">
        {commissions.map((commission) => (
          <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{commission.professionalName}</p>
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {commission.period}
                </span>
                <span className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {commission.bookings} bookings
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium text-gray-900">${commission.amount}</p>
                <p className="text-sm text-gray-500">{commission.status}</p>
              </div>
              <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                <DollarSign className="h-4 w-4 mr-1" />
                Pay Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};