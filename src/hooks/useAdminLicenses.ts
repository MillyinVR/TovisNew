import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  onSnapshot, 
  where, 
  Timestamp,
  addDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface License {
  id: string;
  professionalId: string;
  professionalName: string;
  type: string;
  licenseNumber: string;
  state: string;
  expirationDate: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'pending_approval';
  documentUrl?: string;
  history?: LicenseHistory[];
}

export interface LicenseHistory {
  id: string;
  date: string;
  action: 'approved' | 'expired' | 'renewed' | 'downgraded';
  adminName: string;
  notes?: string;
}

export const useAdminLicenses = (statusFilter: string = 'all') => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { userProfile } = useAuth();

  useEffect(() => {
    // Only fetch if user is admin
    if (userProfile?.role !== 'admin') {
      setLoading(false);
      return;
    }

    const fetchLicenses = async () => {
      try {
        // Get fresh ID token and verify admin claim with retries
        let attempts = 0;
        const maxAttempts = 5;
        let claimsVerified = false;
        
        while (attempts < maxAttempts && !claimsVerified) {
          const tokenResult = await auth.currentUser?.getIdTokenResult(true);
          console.log(`Attempt ${attempts + 1}: Verifying admin claims:`, tokenResult?.claims);
          
          console.log('Token result:', tokenResult);
          // Check for either admin:true or role:'admin' claim
          if (tokenResult?.claims.admin || tokenResult?.claims.role === 'admin') {
            claimsVerified = true;
            console.log('Admin access verified via claims:', tokenResult?.claims);
          } else {
            attempts++;
            console.log(`Admin claims not found in useAdminLicenses, attempt ${attempts} of ${maxAttempts}`);
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        }

        if (!claimsVerified) {
          console.error('Failed to verify admin claims after multiple attempts in useAdminLicenses');
          setLoading(false);
          return;
        }

        // Create base query
        let licensesQuery = query(collection(db, 'licenses'));

        // Add status filter if not 'all'
        if (statusFilter !== 'all') {
          licensesQuery = query(licensesQuery, where('status', '==', statusFilter));
        }

        // Set up real-time listener
        const unsubscribe = onSnapshot(licensesQuery, async (snapshot) => {
          const licensesData = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const data = doc.data();
              
              // Get professional details
              const professionalDoc = await getDocs(
                query(collection(db, 'users'), where('uid', '==', data.professionalId))
              );
              const professionalData = professionalDoc.docs[0]?.data();

              // Get license history
              const historyQuery = query(
                collection(db, 'licenses', doc.id, 'history'),
                where('licenseId', '==', doc.id)
              );
              const historySnapshot = await getDocs(historyQuery);
              const history = historySnapshot.docs.map(historyDoc => {
                const historyData = historyDoc.data();
                return {
                  id: historyDoc.id,
                  date: historyData.date.toDate().toISOString(),
                  action: historyData.action,
                  adminName: historyData.adminName,
                  notes: historyData.notes
                };
              });

              // Calculate status based on expiration date
              const expirationDate = data.expirationDate.toDate();
              const now = new Date();
              const thirtyDaysFromNow = new Date();
              thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

              let status: License['status'] = 'active';
              if (data.status === 'pending_approval') {
                status = 'pending_approval';
              } else if (now > expirationDate) {
                status = 'expired';
              } else if (expirationDate < thirtyDaysFromNow) {
                status = 'expiring_soon';
              }

              return {
                id: doc.id,
                professionalId: data.professionalId,
                professionalName: professionalData?.name || 'Unknown',
                type: data.type,
                licenseNumber: data.licenseNumber,
                state: data.state,
                expirationDate: data.expirationDate.toDate().toISOString(),
                status,
                documentUrl: data.documentUrl,
                history
              } as License;
            })
          );

          setLicenses(licensesData);
          setLoading(false);
        }, (error) => {
          console.error('Error fetching licenses:', error);
          setError(error as Error);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up licenses listener:', error);
        setError(error as Error);
        setLoading(false);
      }
    };

    fetchLicenses();
  }, [statusFilter]);

  const sendReminder = async (licenseId: string) => {
    try {
      // Get the license and professional data
      const licenseDoc = await getDocs(query(collection(db, 'licenses'), where('id', '==', licenseId)));
      const licenseData = licenseDoc.docs[0]?.data();
      
      if (!licenseData) {
        throw new Error('License not found');
      }

      // Add a reminder record
      await addDoc(collection(db, 'reminders'), {
        licenseId,
        professionalId: licenseData.professionalId,
        type: 'license_expiration',
        sentAt: Timestamp.now(),
        status: 'sent'
      });

      // Add to history
      await addDoc(collection(db, 'licenses', licenseId, 'history'), {
        date: Timestamp.now(),
        action: 'reminder_sent',
        adminName: 'System',
        notes: 'Expiration reminder sent'
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw error;
    }
  };

  const approveLicense = async (licenseId: string, adminName: string) => {
    try {
      await addDoc(collection(db, 'licenses', licenseId, 'history'), {
        date: Timestamp.now(),
        action: 'approved',
        adminName,
        notes: 'License approved'
      });

      // Update license status
      await updateDoc(doc(db, 'licenses', licenseId), {
        status: 'active',
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error approving license:', error);
      throw error;
    }
  };

  const rejectLicense = async (licenseId: string, adminName: string, reason: string) => {
    try {
      await addDoc(collection(db, 'licenses', licenseId, 'history'), {
        date: Timestamp.now(),
        action: 'rejected',
        adminName,
        notes: reason
      });

      // Update license status
      await updateDoc(doc(db, 'licenses', licenseId), {
        status: 'rejected',
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error rejecting license:', error);
      throw error;
    }
  };

  return { 
    licenses, 
    loading, 
    error,
    sendReminder,
    approveLicense,
    rejectLicense
  };
};
