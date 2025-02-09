import React from 'react';
import { RevenueAnalytics } from './RevenueAnalytics';
import { PaymentManagement } from './PaymentManagement';
import { CommissionTracking } from './CommissionTracking';
import { TransactionHistory } from './TransactionHistory';
import { DollarSign, CreditCard, TrendingUp, Calendar } from 'lucide-react';

export const FinanceDashboard = () => {
  const stats = {
    revenue: 15780,
    pending: 450,
    nextPayout: 1250,
    payoutDate: '2024-03-20'
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    ${stats.revenue}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Payments
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    ${stats.pending}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Next Payout
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    ${stats.nextPayout}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Next Payout Date
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {new Date(stats.payoutDate).toLocaleDateString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics and Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueAnalytics />
        <PaymentManagement />
      </div>

      {/* Commission Tracking */}
      <CommissionTracking />

      {/* Transaction History */}
      <TransactionHistory />
    </div>
  );
};