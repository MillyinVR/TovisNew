import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface PastService {
  id: string;
  date: string;
  service: string;
  professional: string;
  professionalId: string;
  notes?: string;
}

interface ClientRating {
  id: string;
  rating: number;
  comment: string;
  professional: string;
  professionalId: string;
  date: string;
}

interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  pastServices: PastService[];
  ratings: ClientRating[];
  averageRating: number;
}

export const useClientData = () => {
  const { currentUser } = useAuth();
  const [clientProfiles, setClientProfiles] = useState<Record<string, ClientProfile>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Get client profile
  const getClientProfile = useCallback(async (clientId: string): Promise<ClientProfile> => {
    // Check if we already have this client's profile
    if (clientProfiles[clientId]) {
      return clientProfiles[clientId];
    }

    if (!currentUser?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);

      // Get past services for this client with this professional
      const servicesRef = collection(db, 'appointments');
      const servicesQuery = query(
        servicesRef,
        where('clientId', '==', clientId),
        where('professionalId', '==', currentUser.uid)
      );
      
      const servicesSnapshot = await getDocs(servicesQuery);
      
      // Extract client name from appointments
      let clientName = 'Client';
      let clientEmail = '';
      
      // Get past services (completed appointments)
      const pastServices = servicesSnapshot.docs
        .filter(doc => doc.data().status === 'COMPLETED')
        .map(doc => {
          const data = doc.data();
          // Update client name if available in appointment data
          if (data.clientName) {
            clientName = data.clientName;
          }
          return {
            id: doc.id,
            date: data.date || new Date(data.startTime).toLocaleDateString(),
            service: data.serviceName || 'Service',
            professional: data.professionalName || 'Professional',
            professionalId: data.professionalId,
            notes: data.notes
          };
        });
      
      // Try to get client info from appointments if we don't have it yet
      if (servicesSnapshot.docs.length > 0) {
        const firstAppointment = servicesSnapshot.docs[0].data();
        if (firstAppointment.clientName) {
          clientName = firstAppointment.clientName;
        }
        if (firstAppointment.clientEmail) {
          clientEmail = firstAppointment.clientEmail;
        }
      }
      
      // Get ratings for this client from professionals
      const ratingsRef = collection(db, 'clientRatings');
      const ratingsQuery = query(
        ratingsRef,
        where('clientId', '==', clientId)
      );
      
      const ratingsSnapshot = await getDocs(ratingsQuery);
      const ratings = ratingsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          rating: data.rating || 5,
          comment: data.comment || '',
          professional: data.professionalName || 'Professional',
          professionalId: data.professionalId,
          date: data.date || new Date(data.createdAt?.toDate()).toLocaleDateString()
        };
      });
      
      // Calculate average rating
      const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;
      
      // Try to get client basic info as a fallback, but handle permission errors gracefully
      let phone = '';
      try {
        const clientRef = doc(db, 'users', clientId);
        const clientDoc = await getDoc(clientRef);
        
        if (clientDoc.exists()) {
          const clientData = clientDoc.data();
          clientName = clientData.displayName || clientData.name || clientName;
          clientEmail = clientData.email || clientEmail;
          phone = clientData.phone || '';
        }
      } catch (err) {
        console.log('Could not access client document directly, using appointment data instead');
        // Continue with the data we have from appointments
      }
      
      const clientProfile: ClientProfile = {
        id: clientId,
        name: clientName,
        email: clientEmail,
        phone: phone,
        pastServices,
        ratings,
        averageRating
      };
      
      // Update state
      setClientProfiles(prev => ({
        ...prev,
        [clientId]: clientProfile
      }));
      
      return clientProfile;
    } catch (err) {
      console.error('Error fetching client profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch client profile'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, clientProfiles]);

  // Clear client profiles cache
  const clearClientProfiles = useCallback(() => {
    setClientProfiles({});
  }, []);

  return {
    getClientProfile,
    clearClientProfiles,
    loading,
    error
  };
};
