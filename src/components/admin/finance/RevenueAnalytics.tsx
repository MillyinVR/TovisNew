import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';

export const RevenueAnalytics = () => {
  const data = [
    { month: 'Jan', revenue: 4500, bookings: 45 },
    { month: 'Feb', revenue: 5200, bookings: 52 },
    { month: 'Mar', revenue: 6100, bookings: 58 },
    { month: 'Apr', revenue: 5800, bookings: 54 },
    { month: 'May', revenue: 6500, bookings: 62 },
    { month: 'Jun', revenue: 7200, bookings: 68 }
  ];

  const metrics = [
    {
      label: 'Total Revenue',
      value: '$35,300',
      change: '+12.5%',
      trend: 'up'
    },
    {
      label: 'Average Order Value',
      value: '$125',
      change: '+8.2%',
      trend: 'up'
    },
    {
      label: 'Conversion Rate',
      value: '3.2%',
      change: '-0.4%',
      trend: 'down'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Revenue Overview</h3>
        <select className="rounded-md border-gray-300 py-1 pl-2 pr-8 text-sm focus:border-indigo-500 focus:ring-indigo-500">
          <option>Last 6 months</option>
          <option>Last year</option>
          <option>All time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{metric.label}</p>
                <p className="mt-1 text-xl font-semibold">{metric.value}</p>
              </div>
              <div className={`flex items-center ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.trend === 'up' ? (
                  <ArrowUp className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm font-medium">{metric.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              name="Revenue ($)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="bookings"
              stroke="#82ca9d"
              name="Bookings"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};