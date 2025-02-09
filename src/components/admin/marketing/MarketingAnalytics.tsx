import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Share2 } from 'lucide-react';

export const MarketingAnalytics = () => {
  const data = [
    { month: 'Jan', engagement: 4000, reach: 2400, conversions: 1200 },
    { month: 'Feb', engagement: 3000, reach: 1398, conversions: 900 },
    { month: 'Mar', engagement: 2000, reach: 9800, conversions: 1600 },
    { month: 'Apr', engagement: 2780, reach: 3908, conversions: 1400 },
    { month: 'May', engagement: 1890, reach: 4800, conversions: 1000 },
    { month: 'Jun', engagement: 2390, reach: 3800, conversions: 1300 }
  ];

  const metrics = [
    {
      name: 'Total Reach',
      value: '45.2K',
      change: '+12.5%',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      name: 'Engagement Rate',
      value: '8.4%',
      change: '+3.2%',
      icon: TrendingUp,
      color: 'text-green-500'
    },
    {
      name: 'Conversion Rate',
      value: '2.8%',
      change: '+0.5%',
      icon: DollarSign,
      color: 'text-purple-500'
    },
    {
      name: 'Social Shares',
      value: '1.2K',
      change: '+15.3%',
      icon: Share2,
      color: 'text-pink-500'
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Marketing Analytics</h3>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.name} className="bg-white overflow-hidden rounded-lg border">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {metric.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {metric.value}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="engagement" fill="#8884d8" name="Engagement" />
            <Bar dataKey="reach" fill="#82ca9d" name="Reach" />
            <Bar dataKey="conversions" fill="#ffc658" name="Conversions" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};