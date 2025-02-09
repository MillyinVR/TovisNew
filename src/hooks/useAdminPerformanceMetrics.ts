import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  onSnapshot, 
  where, 
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface ProfessionalMetrics {
  id: string;
  professionalId: string;
  professionalName: string;
  photo: string;
  metrics: {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
    responseRate: number;
    responseTime: number; // in minutes
  };
  trends: {
    bookingsGrowth: number;
    revenueGrowth: number;
    ratingTrend: number;
  };
  lastUpdated: string;
}

export const useAdminPerformanceMetrics = (timeRange: 'week' | 'month' | 'year' = 'month') => {
  const [metrics, setMetrics] = useState<ProfessionalMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Get all professionals
        const professionalsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'professional')
        );

        const unsubscribe = onSnapshot(professionalsQuery, async (snapshot) => {
          const metricsData = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const professionalData = doc.data();
              
              // Get bookings metrics
              const startDate = new Date();
              if (timeRange === 'week') startDate.setDate(startDate.getDate() - 7);
              else if (timeRange === 'month') startDate.setMonth(startDate.getMonth() - 1);
              else startDate.setFullYear(startDate.getFullYear() - 1);

              const bookingsQuery = query(
                collection(db, 'bookings'),
                where('professionalId', '==', doc.id),
                where('createdAt', '>=', startDate),
                orderBy('createdAt', 'desc')
              );
              const bookingsSnapshot = await getDocs(bookingsQuery);
              const bookings = bookingsSnapshot.docs.map(doc => doc.data());

              // Get reviews metrics
              const reviewsQuery = query(
                collection(db, 'reviews'),
                where('professionalId', '==', doc.id),
                where('createdAt', '>=', startDate)
              );
              const reviewsSnapshot = await getDocs(reviewsQuery);
              const reviews = reviewsSnapshot.docs.map(doc => doc.data());

              // Calculate metrics
              const totalBookings = bookings.length;
              const completedBookings = bookings.filter(b => b.status === 'completed').length;
              const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
              const totalRevenue = bookings
                .filter(b => b.status === 'completed')
                .reduce((sum, b) => sum + (b.amount || 0), 0);
              
              const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
              const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

              // Calculate response metrics
              const messages = await getDocs(
                query(
                  collection(db, 'messages'),
                  where('professionalId', '==', doc.id),
                  where('createdAt', '>=', startDate)
                )
              );
              const responseTimes = messages.docs
                .filter(m => m.data().responseTime)
                .map(m => m.data().responseTime);
              const averageResponseTime = responseTimes.length > 0
                ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
                : 0;
              const responseRate = messages.docs.length > 0
                ? responseTimes.length / messages.docs.length * 100
                : 0;

              // Calculate trends
              const previousStartDate = new Date(startDate);
              if (timeRange === 'week') previousStartDate.setDate(previousStartDate.getDate() - 7);
              else if (timeRange === 'month') previousStartDate.setMonth(previousStartDate.getMonth() - 1);
              else previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);

              const previousBookings = (await getDocs(query(
                collection(db, 'bookings'),
                where('professionalId', '==', doc.id),
                where('createdAt', '>=', previousStartDate),
                where('createdAt', '<', startDate)
              ))).docs.length;

              const previousRevenue = (await getDocs(query(
                collection(db, 'bookings'),
                where('professionalId', '==', doc.id),
                where('createdAt', '>=', previousStartDate),
                where('createdAt', '<', startDate),
                where('status', '==', 'completed')
              ))).docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

              const previousReviews = (await getDocs(query(
                collection(db, 'reviews'),
                where('professionalId', '==', doc.id),
                where('createdAt', '>=', previousStartDate),
                where('createdAt', '<', startDate)
              ))).docs;

              const previousRating = previousReviews.length > 0
                ? previousReviews.reduce((sum, doc) => sum + (doc.data().rating || 0), 0) / previousReviews.length
                : 0;

              const bookingsGrowth = previousBookings > 0
                ? ((totalBookings - previousBookings) / previousBookings) * 100
                : 0;
              
              const revenueGrowth = previousRevenue > 0
                ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
                : 0;

              const ratingTrend = previousRating > 0
                ? ((averageRating - previousRating) / previousRating) * 100
                : 0;

              return {
                id: doc.id,
                professionalId: doc.id,
                professionalName: professionalData.name || 'Unknown',
                photo: professionalData.photoURL || '',
                metrics: {
                  totalBookings,
                  completedBookings,
                  cancelledBookings,
                  totalRevenue,
                  averageRating,
                  totalReviews: reviews.length,
                  responseRate,
                  responseTime: averageResponseTime
                },
                trends: {
                  bookingsGrowth,
                  revenueGrowth,
                  ratingTrend
                },
                lastUpdated: new Date().toISOString()
              } as ProfessionalMetrics;
            })
          );

          setMetrics(metricsData);
          setLoading(false);
        }, (error) => {
          console.error('Error fetching performance metrics:', error);
          setError(error as Error);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up performance metrics listener:', error);
        setError(error as Error);
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [timeRange]);

  return { metrics, loading, error };
};
