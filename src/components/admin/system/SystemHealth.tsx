import React, { useState, useEffect } from 'react';
import { Server, Database, Globe, Shield, AlertTriangle, CheckCircle, RefreshCcw } from 'lucide-react';

interface SystemMetric {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  value: string;
  details: string;
  icon: typeof Server;
  color: string;
  lastChecked: string;
}

interface HealthCheck {
  id: string;
  component: string;
  status: 'passed' | 'failed';
  message: string;
  timestamp: string;
}

export const SystemHealth = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    {
      name: 'Server Status',
      status: 'healthy',
      value: '99.9%',
      details: 'All systems operational',
      icon: Server,
      color: 'text-green-500',
      lastChecked: new Date().toISOString()
    },
    {
      name: 'Database',
      status: 'healthy',
      value: '45ms',
      details: 'Response time optimal',
      icon: Database,
      color: 'text-green-500',
      lastChecked: new Date().toISOString()
    },
    {
      name: 'API Health',
      status: 'warning',
      value: '150ms',
      details: 'Slightly elevated response time',
      icon: Globe,
      color: 'text-yellow-500',
      lastChecked: new Date().toISOString()
    },
    {
      name: 'Security',
      status: 'healthy',
      value: '100%',
      details: 'No threats detected',
      icon: Shield,
      color: 'text-green-500',
      lastChecked: new Date().toISOString()
    }
  ]);

  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    {
      id: '1',
      component: 'Authentication Service',
      status: 'passed',
      message: 'Service responding normally',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      component: 'Payment Processing',
      status: 'passed',
      message: 'All payment methods available',
      timestamp: new Date().toISOString()
    },
    {
      id: '3',
      component: 'Storage Service',
      status: 'failed',
      message: 'High latency detected',
      timestamp: new Date().toISOString()
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshMetrics = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">System Health</h3>
            <button
              onClick={refreshMetrics}
              className={`inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isRefreshing}
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.name} className="bg-white overflow-hidden shadow rounded-lg">
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
                            <span className={`ml-2 text-sm font-medium ${
                              metric.status === 'healthy' ? 'text-green-600' :
                              metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {metric.status}
                            </span>
                          </dd>
                          <dd className="mt-1 text-sm text-gray-500">
                            {metric.details}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Health Checks */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Health Checks</h4>
          <div className="space-y-4">
            {healthChecks.map((check) => (
              <div key={check.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {check.status === 'passed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{check.component}</p>
                    <p className="text-sm text-gray-500">{check.message}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    Last checked: {new Date(check.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};