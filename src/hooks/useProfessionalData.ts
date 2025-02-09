import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Review, Service } from '../types/professional';

interface ProfessionalData {
  reviews: Review[];
  services: Service[];
  profile: any;  // Will be populated with user document data
  loading: boolean;
  error: Error | null;
}

export const useProfessionalData = (professionalId: string) => {
  const [data, setData] = useState<ProfessionalData>({
    reviews: [],
    services: [],
    profile: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!professionalId) return;

    const fetchData = async () => {
      try {
        // Query for reviews
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('professionalId', '==', professionalId)
        );

        // Query for services
        const servicesQuery = query(
          collection(db, 'services'),
          where('professionalId', '==', professionalId)
        );

        // Get initial data
        const [reviewsSnapshot, servicesSnapshot, userDoc] = await Promise.all([
          getDocs(reviewsQuery),
          getDocs(servicesQuery),
          getDocs(query(collection(db, 'users'), where('uid', '==', professionalId)))
        ]);

        const reviews = reviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }) as Review);

        const services = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }) as Service);

        const profile = userDoc.docs[0]?.data() || null;

        setData({
          reviews,
          services,
          profile,
          loading: false,
          error: null
        });

        // Set up real-time listener for profile changes
        const unsubscribeProfile = onSnapshot(
          query(collection(db, 'users'), where('uid', '==', professionalId)),
          (snapshot) => {
            const updatedProfile = snapshot.docs[0]?.data() || null;
            setData(prev => ({ ...prev, profile: updatedProfile }));
          }
        );

        // Set up real-time listeners
        const unsubscribeReviews = onSnapshot(reviewsQuery, (snapshot) => {
          const updatedReviews = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }) as Review);
          setData(prev => ({ ...prev, reviews: updatedReviews }));
        });

        const unsubscribeServices = onSnapshot(servicesQuery, (snapshot) => {
          const updatedServices = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }) as Service);
          setData(prev => ({ ...prev, services: updatedServices }));
        });

        return () => {
          unsubscribeReviews();
          unsubscribeServices();
          unsubscribeProfile();
        };
      } catch (error) {
        setData({
          reviews: [],
          services: [],
          profile: null,
          loading: false,
          error: error as Error
        });
      }
    };

    fetchData();
  }, [professionalId]);

  return data;
};
