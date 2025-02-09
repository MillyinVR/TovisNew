import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Star, Users, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { useAdminPerformanceMetrics } from '../../../hooks/useAdminPerformanceMetrics';

export const PerformanceMetrics = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const { metrics, loading, error } = useAdminPerformanceMetrics(timeRange);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600">Error loading metrics: {error.message}</div>
      </div>
    );
  }

  // Calculate aggregate metrics
  const averageRating = metrics.reduce((sum, m) => sum + m.metrics.averageRating, 0) / metrics.length;
  const totalProfessionals = metrics.length;
  const totalBookings = metrics.reduce((sum, m) => sum + m.metrics.totalBookings, 0);
  const averageResponseRate = metrics.reduce((sum, m) => sum + m.metrics.responseRate, 0) / metrics.length;

  // Calculate average trends
  const avgBookingsGrowth = metrics.reduce((sum, m) => sum + m.trends.bookingsGrowth, 0) / metrics.length;
  const avgRevenueGrowth = metrics.reduce((sum, m) => sum + m.trends.revenueGrowth, 0) / metrics.length;
  const avgRatingTrend = metrics.reduce((sum, m) => sum + m.trends.ratingTrend, 0) / metrics.length;

  const summaryMetrics = [
    {
      label: 'Average Rating',
      value: averageRating.toFixed(1),
      change: `${avgRatingTrend >= 0 ? '+' : ''}${avgRatingTrend.toFixed(1)}%`,
      icon: Star,
      color: 'text-yellow-500'
    },
    {
      label: 'Active Professionals',
      value: totalProfessionals.toString(),
      change: `${metrics.filter(m => m.metrics.totalBookings > 0).length} active`,
      icon: Users,
      color: 'text-blue-500'
    },
    {
      label: 'Monthly Bookings',
      value: totalBookings.toLocaleString(),
      change: `${avgBookingsGrowth >= 0 ? '+' : ''}${avgBookingsGrowth.toFixed(1)}%`,
      icon: Calendar,
      color: 'text-green-500'
    },
    {
      label: 'Response Rate',
      value: `${averageResponseRate.toFixed(0)}%`,
      change: `${avgRevenueGrowth >= 0 ? '+' : ''}${avgRevenueGrowth.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-purple-500'
    }
  ];

  // Prepare chart data
  const chartData = metrics.reduce((acc, professional) => {
    const month = new Date(professional.lastUpdated).toLocaleString('default', { month: 'short' });
    const existingMonth = acc.find(d => d.month === month);
    
    if (existingMonth) {
      existingMonth.bookings += professional.metrics.totalBookings;
      existingMonth.retention = (existingMonth.retention + professional.metrics.responseRate) / 2;
    } else {
      acc.push({
        month,
        bookings: professional.metrics.totalBookings,
        retention: professional.metrics.responseRate
      });
    }
    return acc;
  }, [] as Array<{ month: string; bookings: number; retention: number }>);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Performance Metrics</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {summaryMetrics.map((metric) => {
            const Icon = metric.icon;
            const isPositiveChange = !metric.change.includes('-');
            return (
              <div key={metric.label} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                  <span className={`text-xs font-medium ${
                    isPositiveChange ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-gray-900">{metric.value}</p>
                <p className="text-sm text-gray-500">{metric.label}</p>
              </div>
            );
          })}
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="bookings"
                stroke="#8884d8"
                name="Bookings"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="retention"
                stroke="#82ca9d"
                name="Response Rate %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
