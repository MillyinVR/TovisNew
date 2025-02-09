import React, { useState } from 'react';
import { DollarSign, Search, Filter, ArrowUp, ArrowDown } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  type: 'payment' | 'refund' | 'payout';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  client?: string;
  service?: string;
}

export const TransactionHistory = () => {
  const [transactions] = useState<Transaction[]>([
    {
      id: 'tx1',
      date: '2024-03-15',
      type: 'payment',
      amount: 150,
      status: 'completed',
      description: 'Bridal Makeup Service',
      client: 'Emma Wilson',
      service: 'Bridal Makeup'
    },
    {
      id: 'tx2',
      date: '2024-03-14',
      type: 'payout',
      amount: 450,
      status: 'completed',
      description: 'Weekly payout'
    },
    {
      id: 'tx3',
      date: '2024-03-13',
      type: 'refund',
      amount: 75,
      status: 'completed',
      description: 'Partial refund',
      client: 'Sarah Johnson',
      service: 'Natural Glam'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
          <p className="mt-2 text-sm text-gray-700">
            View and manage all financial transactions
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
        <div className="flex-1">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search transactions..."
            />
          </div>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">All Types</option>
            <option value="payment">Payments</option>
            <option value="refund">Refunds</option>
            <option value="payout">Payouts</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Type
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Description
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Amount
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                        {transaction.date}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'payment'
                            ? 'bg-green-100 text-green-800'
                            : transaction.type === 'refund'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {transaction.description}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="flex items-center">
                          {transaction.type === 'refund' ? (
                            <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                          ) : (
                            <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                          )}
                          <span className={transaction.type === 'refund' ? 'text-red-600' : 'text-gray-900'}>
                            ${transaction.amount}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};