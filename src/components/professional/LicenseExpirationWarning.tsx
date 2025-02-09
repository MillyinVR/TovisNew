import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AlertTriangle, X } from 'lucide-react';
import { checkLicenseExpiration } from '@/lib/utils/licenseUtils';
import { LicenseUpdateForm } from './LicenseUpdateForm';

interface LicenseExpirationWarningProps {
  licenseExpirationDate?: string;
  userId: string;
}

export const LicenseExpirationWarning: React.FC<LicenseExpirationWarningProps> = ({
  licenseExpirationDate,
  userId
}) => {
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { isExpiring, daysUntilExpiration } = checkLicenseExpiration(licenseExpirationDate);

  // Also hide warning if status is update_pending
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const verificationDoc = await getDoc(doc(db, 'verifications', userId));
        if (verificationDoc.exists()) {
          setVerificationStatus(verificationDoc.data().verificationStatus);
        }
      } catch (error) {
        console.error('Error fetching verification status:', error);
      }
    };

    fetchVerificationStatus();
  }, [userId]);

  if (!isExpiring || !daysUntilExpiration || isDismissed || verificationStatus === 'update_pending') {
    return null;
  }

  return (
    <>
      <div 
        className="bg-yellow-50 border-l-4 border-yellow-400 p-2 flex items-center justify-between cursor-pointer hover:bg-yellow-100 transition-colors"
        onClick={() => setShowUpdateForm(true)}
      >
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
          <p className="text-sm text-yellow-700">
            License expires in {daysUntilExpiration} day{daysUntilExpiration !== 1 ? 's' : ''} - Click to update
          </p>
        </div>
        <button 
          className="text-yellow-400 hover:text-yellow-500"
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {showUpdateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-lg w-full mx-4">
            <LicenseUpdateForm 
              onClose={() => setShowUpdateForm(false)}
              userId={userId}
            />
          </div>
        </div>
      )}
    </>
  );
};
