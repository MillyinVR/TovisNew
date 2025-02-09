import { useEffect, useState } from 'react';
import { collection, query, getDocs, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

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

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
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
