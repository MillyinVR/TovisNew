import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { ProfessionalService, ServiceFilter, ServiceSort, Service } from '../../types/service';
import { toFirestoreData, fromFirestoreData } from '../utils';
import { createOrUpdateServiceProvider, deleteServiceProvider } from './services';

const getServicesRef = (professionalId: string) => 
  collection(db, 'users', professionalId, 'services');

export const professionalServiceApi = {
  async createService(
    professionalId: string, 
    service: Omit<ProfessionalService, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ProfessionalService> {
    try {
      // Get base service to validate against
      const baseServiceRef = doc(db, 'services', service.baseServiceId);
      const baseServiceSnap = await getDoc(baseServiceRef);
      
      if (!baseServiceSnap.exists()) {
        throw new Error('Base service not found');
      }
      
      const baseServiceData = baseServiceSnap.data();
      if (!baseServiceData || !baseServiceData.price || !baseServiceData.duration) {
        throw new Error('Invalid base service data');
      }
      
      // Validate price
      const basePrice = Number(baseServiceData.price);
      if (service.price < basePrice) {
        throw new Error(`Price cannot be lower than the base price of $${basePrice}`);
      }
      
      // Validate duration
      const baseDuration = Number(baseServiceData.duration);
      const minDuration = Math.max(15, baseDuration * 0.5);
      const maxDuration = baseDuration * 2;
      
      if (service.duration < minDuration) {
        throw new Error(`Duration cannot be less than ${minDuration} minutes (50% of base duration)`);
      }
      if (service.duration > maxDuration) {
        throw new Error(`Duration cannot exceed ${maxDuration} minutes (200% of base duration)`);
      }

      const serviceData = {
        ...service,
        professionalId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        bookings: 0,
        earnings: 0,
        reviews: 0,
        averageRating: 0,
        isActive: true
      };

      const servicesRef = getServicesRef(professionalId);
      const docRef = await addDoc(servicesRef, toFirestoreData(serviceData));

      // Get professional info for the serviceProviders collection
      const userRef = doc(db, 'users', professionalId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const professionalName = userData.displayName || userData.name || 'Professional';
        const professionalImageUrl = userData.photoURL || userData.profileImageUrl || null;
        
        // Add to serviceProviders collection
        await createOrUpdateServiceProvider(
          professionalId,
          professionalName,
          professionalImageUrl,
          {
            ...serviceData,
            id: docRef.id
          } as ProfessionalService,
          service.category.id
        );
      }

      return {
        ...serviceData,
        id: docRef.id
      } as ProfessionalService;
    } catch (error) {
      console.error('Error creating professional service:', error);
      throw new Error('Failed to create professional service');
    }
  },

  async updateService(
    professionalId: string,
    serviceId: string,
    updates: Partial<ProfessionalService>
  ): Promise<void> {
    try {
      // Get current service to get base service ID
      const serviceRef = doc(getServicesRef(professionalId), serviceId);
      const serviceSnap = await getDoc(serviceRef);
      
      if (!serviceSnap.exists()) {
        throw new Error('Service not found');
      }
      
      const currentServiceData = serviceSnap.data();
      if (!currentServiceData || !currentServiceData.baseServiceId) {
        throw new Error('Invalid service data');
      }
      
      // Get base service to validate against
      const baseServiceRef = doc(db, 'services', currentServiceData.baseServiceId);
      const baseServiceSnap = await getDoc(baseServiceRef);
      
      if (!baseServiceSnap.exists()) {
        throw new Error('Base service not found');
      }
      
      const baseServiceData = baseServiceSnap.data();
      if (!baseServiceData || !baseServiceData.price || !baseServiceData.duration) {
        throw new Error('Invalid base service data');
      }
      
      // Validate price if it's being updated
      if (updates.price !== undefined) {
        const basePrice = Number(baseServiceData.price);
        if (updates.price < basePrice) {
          throw new Error(`Price cannot be lower than the base price of $${basePrice}`);
        }
      }
      
      // Validate duration if it's being updated
      if (updates.duration !== undefined) {
        const baseDuration = Number(baseServiceData.duration);
        const minDuration = Math.max(15, baseDuration * 0.5);
        const maxDuration = baseDuration * 2;
        
        if (updates.duration < minDuration) {
          throw new Error(`Duration cannot be less than ${minDuration} minutes (50% of base duration)`);
        }
        if (updates.duration > maxDuration) {
          throw new Error(`Duration cannot exceed ${maxDuration} minutes (200% of base duration)`);
        }
      }

      // Update the service in the professional's services collection
      await updateDoc(serviceRef, {
        ...toFirestoreData(updates),
        updatedAt: serverTimestamp()
      });
      
      // If price, duration, or isActive is being updated, update the serviceProviders collection
      if (updates.price !== undefined || updates.duration !== undefined || updates.isActive !== undefined) {
        // Get the updated service
        const updatedServiceSnap = await getDoc(serviceRef);
        if (updatedServiceSnap.exists()) {
          const updatedServiceData = updatedServiceSnap.data();
          
          // Get professional info
          const userRef = doc(db, 'users', professionalId);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const professionalName = userData.displayName || userData.name || 'Professional';
            const professionalImageUrl = userData.photoURL || userData.profileImageUrl || null;
            
            // Update the serviceProviders collection
            await createOrUpdateServiceProvider(
              professionalId,
              professionalName,
              professionalImageUrl,
              {
                ...fromFirestoreData(updatedServiceData),
                id: serviceId
              } as ProfessionalService,
              updatedServiceData.category?.id || ''
            );
          }
        }
      }
    } catch (error) {
      console.error('Error updating professional service:', error);
      throw new Error('Failed to update professional service');
    }
  },

  async deleteService(professionalId: string, serviceId: string): Promise<void> {
    try {
      // Get the service to get the baseServiceId before deleting
      const serviceRef = doc(getServicesRef(professionalId), serviceId);
      const serviceSnap = await getDoc(serviceRef);
      
      if (serviceSnap.exists()) {
        const serviceData = serviceSnap.data();
        const baseServiceId = serviceData.baseServiceId;
        
        // Delete from the professional's services collection
        await deleteDoc(serviceRef);
        
        // Delete from the serviceProviders collection
        if (baseServiceId) {
          await deleteServiceProvider(professionalId, baseServiceId);
        }
      } else {
        // If the service doesn't exist, just delete from the professional's services collection
        await deleteDoc(serviceRef);
      }
    } catch (error) {
      console.error('Error deleting professional service:', error);
      throw new Error('Failed to delete professional service');
    }
  },

  async getServices(
    professionalId: string,
    filter?: ServiceFilter,
    sort?: ServiceSort
  ): Promise<ProfessionalService[]> {
    try {
      const servicesRef = getServicesRef(professionalId);
      let q = query(servicesRef);

      if (filter) {
        if (filter.category) {
          q = query(q, where('category.id', '==', filter.category));
        }
        if (filter.status) {
          q = query(q, where('status', '==', filter.status));
        }
      }

      const snapshot = await getDocs(q);
      let services = snapshot.docs.map(doc => {
        try {
          const data = doc.data();
          if (!data) {
            console.warn(`Empty data for service ${doc.id}`);
            return null;
          }
          return {
            ...fromFirestoreData(data),
            id: doc.id
          } as ProfessionalService;
        } catch (err) {
          console.error(`Error processing service ${doc.id}:`, err);
          return null;
        }
      }).filter((service): service is ProfessionalService => service !== null);

      if (sort?.field && sort?.direction) {
        services = services.sort((a, b) => {
          const aValue = (a as any)[sort.field];
          const bValue = (b as any)[sort.field];
          
          if (aValue === undefined || bValue === undefined) {
            return 0;
          }
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sort.direction === 'asc' ? 
              aValue.localeCompare(bValue) : 
              bValue.localeCompare(aValue);
          }
          
          return sort.direction === 'asc' ? 
            (aValue > bValue ? 1 : -1) : 
            (aValue < bValue ? 1 : -1);
        });
      }

      return services;
    } catch (error) {
      console.error('Error fetching professional services:', error);
      throw new Error('Failed to fetch professional services');
    }
  },

  async getServiceById(
    professionalId: string,
    serviceId: string
  ): Promise<ProfessionalService> {
    try {
      const serviceRef = doc(getServicesRef(professionalId), serviceId);
      const serviceSnap = await getDoc(serviceRef);

      if (!serviceSnap.exists()) {
        throw new Error('Service not found');
      }

      return {
        ...fromFirestoreData(serviceSnap.data()),
        id: serviceSnap.id
      } as ProfessionalService;
    } catch (error) {
      console.error('Error fetching professional service:', error);
      throw new Error('Failed to fetch professional service');
    }
  },

  subscribeToServices(
    professionalId: string,
    callback: (services: ProfessionalService[]) => void,
    filter?: ServiceFilter
  ): () => void {
    const servicesRef = getServicesRef(professionalId);
    let q = query(servicesRef);

    if (filter) {
      if (filter.category) {
        q = query(q, where('category.id', '==', filter.category));
      }
      if (filter.status) {
        q = query(q, where('status', '==', filter.status));
      }
    }

    return onSnapshot(q, (snapshot) => {
      const services = snapshot.docs.map(doc => ({
        ...fromFirestoreData(doc.data()),
        id: doc.id
      })) as ProfessionalService[];
      callback(services);
    });
  },

  async toggleServiceStatus(
    professionalId: string,
    serviceId: string,
    isActive: boolean
  ): Promise<void> {
    try {
      const serviceRef = doc(getServicesRef(professionalId), serviceId);
      
      // Update the service in the professional's services collection
      await updateDoc(serviceRef, {
        isActive,
        updatedAt: serverTimestamp()
      });
      
      // Update the serviceProviders collection
      const serviceSnap = await getDoc(serviceRef);
      if (serviceSnap.exists()) {
        const serviceData = serviceSnap.data();
        
        // Get professional info
        const userRef = doc(db, 'users', professionalId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const professionalName = userData.displayName || userData.name || 'Professional';
          const professionalImageUrl = userData.photoURL || userData.profileImageUrl || null;
          
          // Update the serviceProviders collection
          await createOrUpdateServiceProvider(
            professionalId,
            professionalName,
            professionalImageUrl,
            {
              ...fromFirestoreData(serviceData),
              id: serviceId,
              isActive
            } as ProfessionalService,
            serviceData.category?.id || ''
          );
        }
      }
    } catch (error) {
      console.error('Error toggling service status:', error);
      throw new Error('Failed to toggle service status');
    }
  },

  async updateServiceMetrics(
    professionalId: string,
    serviceId: string,
    metrics: {
      bookings?: number;
      earnings?: number;
      reviews?: number;
      averageRating?: number;
    }
  ): Promise<void> {
    try {
      const serviceRef = doc(getServicesRef(professionalId), serviceId);
      await updateDoc(serviceRef, {
        ...metrics,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating service metrics:', error);
      throw new Error('Failed to update service metrics');
    }
  }
};

export async function getServices(professionalId: string): Promise<Service[]> {
  try {
    console.log(`Fetching services for professional: ${professionalId}`);
    
    if (!professionalId) {
      console.error('Invalid professionalId provided:', professionalId);
      return [];
    }
    
    const servicesRef = collection(db, 'users', professionalId, 'services');
    
    try {
      const servicesSnapshot = await getDocs(servicesRef);
      
      if (servicesSnapshot.empty) {
        console.log(`No services found for professional: ${professionalId}`);
        return [];
      }

      const services = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Service));
      
      console.log(`Successfully fetched ${services.length} services for professional: ${professionalId}`);
      return services;
    } catch (error: any) {
      console.error('Error in getDocs operation:', error);
      
      // Check if it's a permission error
      if (error.toString().includes('permission-denied') || 
          error.toString().includes('Missing or insufficient permissions')) {
        console.warn('Permission issue detected. This may be due to missing authentication claims.');
        console.warn('Returning empty services array as fallback.');
        return [];
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error fetching professional services:', error);
    throw new Error('Failed to fetch professional services');
  }
}
