import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export const CustomerRetentionChart = () => {
  // Mock data - In production, fetch from your backend
  const data = [
    { name: 'New Non-Request (NNR)', value: 30, color: '#60A5FA' },
    { name: 'New Request (NR)', value: 25, color: '#34D399' },
    { name: 'Return Request (RR)', value: 35, color: '#A78BFA' },
    { name: 'No Rebook (NRB)', value: 10, color: '#F87171' },
  ];

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};