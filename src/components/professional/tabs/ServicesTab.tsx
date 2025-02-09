import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { ServicesSection } from '../profile/sections/ServicesSections';

export const ServicesTab = () => {
  const { userProfile } = useAuth();

  if (!userProfile?.uid) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <ServicesSection 
        profileId={userProfile.uid} 
        permissions={{ canEdit: true }} 
      />
    </div>
  );
};
