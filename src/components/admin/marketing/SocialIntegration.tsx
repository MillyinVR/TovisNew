import React from 'react';
import { Instagram, Facebook, Twitter, Youtube, Link2, Settings } from 'lucide-react';

interface SocialAccount {
  platform: string;
  username: string;
  followers: number;
  connected: boolean;
  icon: typeof Instagram;
}

export const SocialIntegration = () => {
  const socialAccounts: SocialAccount[] = [
    {
      platform: 'Instagram',
      username: '@beautyapp',
      followers: 15000,
      connected: true,
      icon: Instagram
    },
    {
      platform: 'Facebook',
      username: 'Beauty App',
      followers: 25000,
      connected: true,
      icon: Facebook
    },
    {
      platform: 'Twitter',
      username: '@beautyapp',
      followers: 10000,
      connected: false,
      icon: Twitter
    },
    {
      platform: 'YouTube',
      username: 'Beauty App Official',
      followers: 5000,
      connected: true,
      icon: Youtube
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Social Media Integration</h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage connected social media accounts
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
          <Link2 className="h-4 w-4 mr-2" />
          Connect Account
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {socialAccounts.map((account) => {
          const Icon = account.icon;
          return (
            <div key={account.platform} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Icon className="h-8 w-8 text-gray-400" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">{account.platform}</h4>
                    <p className="text-sm text-gray-500">{account.username}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-500">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {account.followers.toLocaleString()} followers
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  account.connected
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {account.connected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};