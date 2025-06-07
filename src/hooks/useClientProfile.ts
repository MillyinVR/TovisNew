import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ClientProfile, ServiceRecord, ProfessionalNote, ClientReview } from '../types/client';
import { Product } from '../types/aftercare';

interface UseClientProfileReturn {
  clientProfile: ClientProfile | null;
  loading: boolean;
  error: Error | null;
  hasAccess: boolean;
  refreshProfile: (clientId: string) => Promise<void>;
}

export const useClientProfile = (clientId: string): UseClientProfileReturn => {
  const { currentUser, userProfile } = useAuth();
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  const checkAccess = useCallback(async (clientId: string): Promise<boolean> => {
    if (!currentUser?.uid) return false;

    try {
      // Admins always have access
      if (userProfile?.role === 'admin') {
        console.log('Admin access granted');
        return true;
      }

      // For professionals, check if they have appointments with this client
      if (userProfile?.role === 'professional') {
        console.log('Checking professional access for', currentUser.uid, 'to client', clientId);
        
        const appointmentsRef = collection(db, 'appointments');
        const appointmentsQuery = query(
          appointmentsRef,
          where('professionalId', '==', currentUser.uid),
          where('clientId', '==', clientId)
        );
        
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const hasAppointments = !appointmentsSnapshot.empty;
        
        console.log('Professional has appointments with client:', hasAppointments, 
                    'Count:', appointmentsSnapshot.size);
        
        // If no appointments found, try checking with any status
        if (!hasAppointments) {
          console.log('No appointments found, checking all appointment statuses');
          
          // Try with any status
          const allAppointmentsQuery = query(
            appointmentsRef,
            where('professionalId', '==', currentUser.uid),
            where('clientId', '==', clientId)
          );
          
          const allAppointmentsSnapshot = await getDocs(allAppointmentsQuery);
          const hasAnyAppointments = !allAppointmentsSnapshot.empty;
          
          console.log('Professional has any appointments with client:', hasAnyAppointments, 
                      'Count:', allAppointmentsSnapshot.size);
          
          return hasAnyAppointments;
        }
        
        return hasAppointments;
      }

      // Clients can only access their own profile
      const isOwnProfile = currentUser.uid === clientId;
      console.log('Client accessing own profile:', isOwnProfile);
      return isOwnProfile;
    } catch (err) {
      console.error('Error checking access:', err);
      return false;
    }
  }, [currentUser?.uid, userProfile?.role]);

  const fetchClientProfile = useCallback(async (clientId: string): Promise<void> => {
    console.log('fetchClientProfile called for clientId:', clientId);
    console.log('Current user:', currentUser?.uid);
    console.log('User role:', userProfile?.role);
    
    if (!currentUser?.uid) {
      console.error('No current user');
      setError(new Error('User not authenticated'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if user has access to this client's profile
      console.log('Checking access for client:', clientId);
      const accessGranted = await checkAccess(clientId);
      console.log('Access granted:', accessGranted);
      setHasAccess(accessGranted);

      if (!accessGranted) {
        console.error('Access denied for client:', clientId);
        setError(new Error('You do not have permission to view this client profile'));
        setLoading(false);
        return;
      }
      
      console.log('Access granted, fetching client data');

      // Get client basic info - try both collections due to migration
      let clientDoc;
      
      // First try the clients collection (new structure)
      const clientRef = doc(db, 'clients', clientId);
      clientDoc = await getDoc(clientRef);
      
      // If not found, try the users collection (old structure)
      if (!clientDoc.exists()) {
        console.log('Client not found in clients collection, trying users collection');
        const userRef = doc(db, 'users', clientId);
        clientDoc = await getDoc(userRef);
        
        if (!clientDoc.exists()) {
          console.error('Client not found in either collection:', clientId);
          setError(new Error('Client not found'));
          setLoading(false);
          return;
        }
      }

      const clientData = clientDoc.data() || {};
      
      // Get service history (completed appointments)
      const appointmentsRef = collection(db, 'appointments');
      const appointmentsQuery = query(
        appointmentsRef,
        where('clientId', '==', clientId),
        where('status', '==', 'COMPLETED')
      );
      
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const serviceRecords: ServiceRecord[] = appointmentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date || new Date(data.startTime).toLocaleDateString(),
          serviceName: data.serviceName || 'Service',
          professionalId: data.professionalId,
          professionalName: data.professionalName || 'Professional',
          notes: data.notes,
          products: data.products || [],
          images: data.images || [],
          followUpRequired: data.followUpRequired || false
        };
      });

      // Get professional notes
      const notesRef = collection(db, 'professionalNotes');
      let notesQuery;
      
      // If user is admin, get all notes
      if (userProfile?.role === 'admin') {
        notesQuery = query(
          notesRef,
          where('clientId', '==', clientId)
        );
      } else {
        // For professionals, only get shared notes or their own notes
        notesQuery = query(
          notesRef,
          where('clientId', '==', clientId),
          where('visibility', '==', 'shared')
        );
      }
      
      const notesSnapshot = await getDocs(notesQuery);
      const professionalNotes: ProfessionalNote[] = notesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          professionalId: data.professionalId,
          professionalName: data.professionalName || 'Professional',
          date: data.date || new Date(data.createdAt?.toDate()).toLocaleDateString(),
          note: data.note,
          type: data.type || 'general',
          visibility: data.visibility || 'shared'
        };
      });

      // Get client reviews
      const reviewsRef = collection(db, 'reviews');
      const reviewsQuery = query(
        reviewsRef,
        where('clientId', '==', clientId)
      );
      
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const clientReviews: ClientReview[] = reviewsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          professionalId: data.professionalId,
          professionalName: data.professionalName || 'Professional',
          date: data.date || new Date(data.createdAt?.toDate()).toLocaleDateString(),
          rating: data.rating || 5,
          comment: data.comment || '',
          serviceId: data.serviceId || '',
          serviceName: data.serviceName || 'Service',
          images: data.images || [],
          response: data.response
        };
      });

      // Get aftercare summaries to extract product purchases
      const aftercareRef = collection(db, 'aftercareSummaries');
      const aftercareQuery = query(
        aftercareRef,
        where('clientId', '==', clientId)
      );
      
      const aftercareSnapshot = await getDocs(aftercareQuery);
      
      // Extract purchased products
      const purchasedProductIds: string[] = [];
      aftercareSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.productsOrdered && Array.isArray(data.productsOrdered)) {
          purchasedProductIds.push(...data.productsOrdered);
        }
      });
      
      // Get product details for purchased products
      const purchasedProducts: Product[] = [];
      if (purchasedProductIds.length > 0) {
        const productPromises = purchasedProductIds.map(async (productId) => {
          const productRef = doc(db, 'products', productId);
          const productDoc = await getDoc(productRef);
          if (productDoc.exists()) {
            return { id: productDoc.id, ...productDoc.data() } as Product;
          }
          return null;
        });
        
        const products = await Promise.all(productPromises);
        products.forEach(product => {
          if (product) purchasedProducts.push(product);
        });
      }

      // Get aftercare images
      const aftercareImages: string[] = [];
      aftercareSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.afterImages && Array.isArray(data.afterImages)) {
          data.afterImages.forEach((image: any) => {
            if (typeof image === 'string') {
              aftercareImages.push(image);
            } else if (image && image.url) {
              aftercareImages.push(image.url);
            }
          });
        }
        if (data.beforeImages && Array.isArray(data.beforeImages)) {
          data.beforeImages.forEach((image: any) => {
            if (typeof image === 'string') {
              aftercareImages.push(image);
            } else if (image && image.url) {
              aftercareImages.push(image.url);
            }
          });
        }
      });

      // Construct the client profile
      const profile: ClientProfile = {
        id: clientId,
        displayName: clientData.displayName || clientData.name || 'Client',
        photoURL: clientData.photoURL || null,
        email: clientData.email || '',
        phoneNumber: clientData.phoneNumber || clientData.phone || null,
        preferences: clientData.preferences || {
          communicationPreferences: {
            reminders: true,
            method: 'email',
            frequency: 'day_before'
          }
        },
        serviceHistory: serviceRecords,
        professionalNotes: professionalNotes,
        reviews: clientReviews,
        purchasedProducts: purchasedProducts,
        aftercareImages: aftercareImages,
        lastUpdated: new Date().toISOString()
      };

      setClientProfile(profile);
    } catch (err) {
      console.error('Error fetching client profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch client profile'));
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, checkAccess]);

  useEffect(() => {
    if (clientId) {
      fetchClientProfile(clientId);
    }
  }, [clientId, fetchClientProfile]);

  return {
    clientProfile,
    loading,
    error,
    hasAccess,
    refreshProfile: fetchClientProfile
  };
};
