import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminLicenses } from '@/hooks/useAdminLicenses';

export const ExpiringLicenses = () => {
  const { licenses, loading } = useAdminLicenses('expiring_soon');

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Expiring Licenses</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (licenses.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Expiring Licenses</h2>
        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {licenses.length} Alert{licenses.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="space-y-3">
        {licenses.map((license) => {
          const expirationDate = new Date(license.expirationDate);
          const daysUntilExpiration = Math.ceil((expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <div key={license.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">{license.professionalName}</h3>
                <p className="text-sm text-gray-500">
                  License expires in {daysUntilExpiration} day{daysUntilExpiration !== 1 ? 's' : ''}
                </p>
              </div>
              <Link
                to={`/admin/professionals/${license.professionalId}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View Details
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
