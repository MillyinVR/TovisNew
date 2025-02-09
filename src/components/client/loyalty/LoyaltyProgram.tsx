import React, { useState } from 'react';
import { 
  Award, 
  Gift, 
  Star, 
  Crown, 
  TrendingUp, 
  Clock,
  Calendar,
  DollarSign
} from 'lucide-react';

interface LoyaltyTier {
  name: string;
  icon: React.ElementType;
  points: number;
  color: string;
  benefits: string[];
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  expiresAt: string;
  image?: string;
}

export const LoyaltyProgram: React.FC = () => {
  const currentPoints = 750;
  const pointsToNextTier = 1000 - currentPoints;
  const currentTier = 'silver';

  const tiers: LoyaltyTier[] = [
    {
      name: 'Bronze',
      icon: Star,
      points: 0,
      color: 'text-amber-600',
      benefits: [
        'Earn 1 point per $1 spent',
        'Birthday reward',
        'Member-only promotions'
      ]
    },
    {
      name: 'Silver',
      icon: Award,
      points: 500,
      color: 'text-gray-400',
      benefits: [
        'Earn 1.5 points per $1 spent',
        'Free birthday service',
        'Priority booking',
        'Exclusive events access'
      ]
    },
    {
      name: 'Gold',
      icon: Crown,
      points: 1000,
      color: 'text-yellow-400',
      benefits: [
        'Earn 2 points per $1 spent',
        'VIP treatment',
        'Dedicated concierge',
        'Free monthly service',
        'Early access to new services'
      ]
    }
  ];

  const availableRewards: Reward[] = [
    {
      id: '1',
      name: '$25 Service Credit',
      description: 'Get $25 off your next service',
      pointsCost: 500,
      expiresAt: '2024-12-31',
      image: '/api/placeholder/400/320'
    },
    {
      id: '2',
      name: 'Free Add-on Service',
      description: 'Add a complimentary service to your next booking',
      pointsCost: 750,
      expiresAt: '2024-12-31',
      image: '/api/placeholder/400/320'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Points Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Current Points</h3>
            <div className="mt-2 flex items-center">
              <Star className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-3xl font-bold">{currentPoints}</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Current Tier</h3>
            <div className="mt-2 flex items-center">
              <Award className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-3xl font-bold capitalize">{currentTier}</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Next Tier</h3>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-5 w-5 text-indigo-500 mr-2" />
              <span className="text-lg">{pointsToNextTier} points needed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Progress */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Tier Progress</h3>
        <div className="relative">
          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
            <div
              style={{ width: `${(currentPoints / 1000) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
            />
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span>0 points</span>
            <span>500 points</span>
            <span>1000 points</span>
          </div>
        </div>
      </div>

      {/* Membership Tiers */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Membership Tiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={`rounded-lg border p-6 ${
                  currentTier === tier.name.toLowerCase()
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">{tier.name}</h4>
                  <Icon className={`h-6 w-6 ${tier.color}`} />
                </div>
                <p className="mt-2 text-sm text-gray-500">{tier.points}+ points</p>
                <ul className="mt-4 space-y-2">
                  {tier.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-400 mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Rewards */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Available Rewards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {availableRewards.map((reward) => (
            <div key={reward.id} className="flex bg-gray-50 rounded-lg overflow-hidden">
              {reward.image && (
                <div className="flex-shrink-0 w-32">
                  <img
                    src={reward.image}
                    alt={reward.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 p-4">
                <div className="flex justify-between">
                  <h4 className="text-lg font-medium text-gray-900">{reward.name}</h4>
                  <span className="flex items-center text-sm font-medium text-indigo-600">
                    <Star className="h-4 w-4 mr-1" />
                    {reward.pointsCost}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{reward.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    Expires: {new Date(reward.expiresAt).toLocaleDateString()}
                  </div>
                  <button
                    disabled={currentPoints < reward.pointsCost}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md ${
                      currentPoints >= reward.pointsCost
                        ? 'text-white bg-indigo-600 hover:bg-indigo-700'
                        : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    }`}
                  >
                    Redeem
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};