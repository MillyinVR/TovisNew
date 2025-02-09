import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const RevenueReport = () => {
  // Mock data - In production, fetch from your backend
  const data = [
    {
      name: 'Jan',
      services: 4000,
      products: 2400,
    },
    {
      name: 'Feb',
      services: 3000,
      products: 1398,
    },
    {
      name: 'Mar',
      services: 2000,
      products: 9800,
    },
    {
      name: 'Apr',
      services: 2780,
      products: 3908,
    },
    {
      name: 'May',
      services: 1890,
      products: 4800,
    },
    {
      name: 'Jun',
      services: 2390,
      products: 3800,
    },
  ];

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="services" fill="#8884d8" name="Services Revenue" />
          <Bar dataKey="products" fill="#82ca9d" name="Products Revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};