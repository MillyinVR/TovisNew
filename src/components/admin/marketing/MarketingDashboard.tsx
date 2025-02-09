import React from 'react';
import { MarketingAnalytics } from './MarketingAnalytics';
import { PromotionCreation } from './PromotionCreation';
import { SocialIntegration } from './SocialIntegration';

export const MarketingDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Marketing Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketingAnalytics />
        <PromotionCreation />
      </div>

      <SocialIntegration />
    </div>
  );
};