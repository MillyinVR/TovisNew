import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, Star, TrendingUp, Calendar, Package } from 'lucide-react';

export const BusinessAnalytics = () => {
  // Mock data - In production, fetch from your backend
  const revenueData = [
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
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      label: 'Total Clients',
      value: '339',
      change: '+8.2%',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      label: 'Average Rating',
      value: '4.9',
      change: '+0.2',
      icon: Star,
      color: 'text-yellow-500'
    },
    {
      label: 'Retention Rate',
      value: '85%',
      change: '+3%',
      icon: TrendingUp,
      color: 'text-purple-500'
    }
  ];

  const popularServices = [
    { name: 'Bridal Makeup', bookings: 28, revenue: 5600 },
    { name: 'Natural Glam', bookings: 45, revenue: 4500 },
    { name: 'Editorial', bookings: 15, revenue: 3750 }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {metric.label}
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

      {/* Revenue Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Revenue Overview</h3>
          <div className="flex items-center space-x-4">
            <select className="rounded-md border-gray-300 py-1 pl-2 pr-8 text-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option>Last 6 months</option>
              <option>Last year</option>
              <option>All time</option>
            </select>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
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

      {/* Popular Services */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Services</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {popularServices.map((service) => (
            <div key={service.name} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-indigo-500" />
                  <h4 className="ml-2 text-sm font-medium text-gray-900">{service.name}</h4>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {service.bookings} bookings
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-semibold text-gray-900">${service.revenue}</p>
                <p className="text-sm text-gray-500">Total revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Trends */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Booking Trends</h3>
          <div className="flex items-center space-x-4">
            <select className="rounded-md border-gray-300 py-1 pl-2 pr-8 text-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option>By Service</option>
              <option>By Time</option>
              <option>By Location</option>
            </select>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#8884d8" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};