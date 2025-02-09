import React from 'react';
import { DollarSign, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  method: string;
  date: string;
  customer: string;
}

export const PaymentManagement = () => {
  const payments: Payment[] = [
    {
      id: 'PAY-123',
      amount: 150,
      status: 'completed',
      method: 'Credit Card',
      date: '2024-03-15',
      customer: 'Emma Wilson'
    },
    {
      id: 'PAY-124',
      amount: 85,
      status: 'pending',
      method: 'PayPal',
      date: '2024-03-14',
      customer: 'James Brown'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Recent Payments</h3>
      <div className="space-y-4">
        {payments.map((payment) => (
          <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-full ${
                payment.status === 'completed' ? 'bg-green-100' :
                payment.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <DollarSign className={`h-5 w-5 ${
                  payment.status === 'completed' ? 'text-green-600' :
                  payment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">${payment.amount}</p>
                <p className="text-sm text-gray-500">{payment.customer}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">{payment.method}</p>
                <p className="text-sm text-gray-500">{payment.date}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
              }`}>
                {payment.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                {payment.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                {payment.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                {payment.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};