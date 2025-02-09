import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export const PerformanceMetrics = () => {
  // Mock data - In production, fetch from your backend
  const data = [
    { date: '2024-01-01', bookings: 4, rating: 4.8, retention: 75 },
    { date: '2024-02-01', bookings: 6, rating: 4.9, retention: 80 },
    { date: '2024-03-01', bookings: 8, rating: 4.7, retention: 85 },
    { date: '2024-04-01', bookings: 7, rating: 4.8, retention: 82 },
    { date: '2024-05-01', bookings: 9, rating: 4.9, retention: 88 },
    { date: '2024-06-01', bookings: 11, rating: 5.0, retention: 90 },
  ].map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM yyyy')
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Most Booked Service</h3>
          <p className="mt-1 text-lg font-semibold text-gray-900">Soft Glam Makeup</p>
          <p className="text-sm text-gray-500">32 bookings this month</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Top Selling Product</h3>
          <p className="mt-1 text-lg font-semibold text-gray-900">Setting Spray</p>
          <p className="text-sm text-gray-500">48 units sold</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500">Client Satisfaction</h3>
          <p className="mt-1 text-lg font-semibold text-gray-900">96%</p>
          <p className="text-sm text-gray-500">Based on recent reviews</p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#8884d8" name="Bookings" />
            <Line yAxisId="right" type="monotone" dataKey="retention" stroke="#82ca9d" name="Retention %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};