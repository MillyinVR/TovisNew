import React, { useState } from 'react';
import { Tag, Calendar, DollarSign, Users, Plus } from 'lucide-react';

interface Promotion {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  status: 'active' | 'scheduled' | 'expired';
}

export const PromotionCreation = () => {
  const [promotions] = useState<Promotion[]>([
    {
      id: '1',
      code: 'SPRING2024',
      type: 'percentage',
      value: 20,
      startDate: '2024-03-15',
      endDate: '2024-03-30',
      usageLimit: 100,
      usedCount: 45,
      status: 'active'
    },
    {
      id: '2',
      code: 'WELCOME50',
      type: 'fixed',
      value: 50,
      startDate: '2024-04-01',
      endDate: '2024-04-15',
      usageLimit: 50,
      usedCount: 0,
      status: 'scheduled'
    }
  ]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Promotions</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage promotional offers
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          New Promotion
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {promotions.map((promo) => (
          <div key={promo.id} className="border rounded-lg p-4 hover:border-indigo-500 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-indigo-500" />
                  <h4 className="text-lg font-medium text-gray-900">{promo.code}</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    promo.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : promo.status === 'scheduled'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {promo.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {promo.type === 'percentage' ? `${promo.value}% off` : `$${promo.value} off`}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {promo.usedCount}/{promo.usageLimit} used
                  </div>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div className="flex items-center justify-end">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                </div>
                <div className="mt-2">
                  <div className="bg-gray-200 rounded-full h-2 w-32">
                    <div
                      className="bg-indigo-600 rounded-full h-2"
                      style={{ width: `${(promo.usedCount / promo.usageLimit) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};