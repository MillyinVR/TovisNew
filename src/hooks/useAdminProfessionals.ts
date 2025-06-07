import { useEffect, useState } from 'react';
import { collection, query, getDocs, onSnapshot, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface Professional {
  id: string;
  name: string;
  photo: string;
  type: string;
  rating: number;
  location: string;
  status: 'active' | 'suspended' | 'inactive';
  totalBookings: number;
  joinDate: string;
  email: string;
  phone: string;
}

export const useAdminProfessionals = (statusFilter: string = 'all') => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { userProfile } = useAuth();

  useEffect(() => {
    // Only fetch if user is admin
    if (userProfile?.role !== 'admin') {
      setLoading(false);
      return;
    }

    const fetchProfessionals = async () => {
      try {
        // Get fresh ID token and verify admin claim with retries
        let attempts = 0;
        const maxAttempts = 5;
        let claimsVerified = false;
        
        while (attempts < maxAttempts && !claimsVerified) {
          const tokenResult = await auth.currentUser?.getIdTokenResult(true);
          console.log(`Attempt ${attempts + 1}: Verifying admin claims:`, tokenResult?.claims);
          
          if (tokenResult?.claims.admin || tokenResult?.claims.role === 'admin') {
            claimsVerified = true;
            console.log('Admin access verified via claims:', tokenResult?.claims);
          } else {
            attempts++;
            console.log(`Admin claims not found in useAdminProfessionals, attempt ${attempts} of ${maxAttempts}`);
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        }

        if (!claimsVerified) {
          console.error('Failed to verify admin claims after multiple attempts in useAdminProfessionals');
          setLoading(false);
          return;
        }

        // Create base query
        let professionalQuery = query(
          collection(db, 'users'),
          where('role', '==', 'professional')
        );

        // Add status filter if not 'all'
        if (statusFilter !== 'all') {
          professionalQuery = query(
            professionalQuery,
            where('status', '==', statusFilter)
          );
        }

        // Set up real-time listener
        const unsubscribe = onSnapshot(professionalQuery, async (snapshot) => {
          const professionalsData = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const data = doc.data();
              
              // Get bookings count
              const bookingsQuery = query(
                collection(db, 'bookings'),
                where('professionalId', '==', doc.id)
              );
              const bookingsSnapshot = await getDocs(bookingsQuery);
              
              // Get average rating
              const reviewsQuery = query(
                collection(db, 'reviews'),
                where('professionalId', '==', doc.id)
              );
              const reviewsSnapshot = await getDocs(reviewsQuery);
              const reviews = reviewsSnapshot.docs.map(doc => doc.data());
              const averageRating = reviews.length > 0
                ? reviews.reduce((acc, review) => acc + (review.rating || 0), 0) / reviews.length
                : 0;

              return {
                id: doc.id,
                name: data.name || 'Unknown',
                photo: data.photoURL || '',
                type: data.specialization || 'Beauty Professional',
                rating: averageRating,
                location: data.location || 'Location not set',
                status: data.status || 'inactive',
                totalBookings: bookingsSnapshot.size,
                joinDate: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                email: data.email || '',
                phone: data.phone || ''
              } as Professional;
            })
          );

          setProfessionals(professionalsData);
          setLoading(false);
        }, (error) => {
          console.error('Error fetching professionals:', error);
          setError(error as Error);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up professionals listener:', error);
        setError(error as Error);
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, [statusFilter]);

  return { professionals, loading, error };
};
