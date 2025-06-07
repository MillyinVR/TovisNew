import { adminServiceApi } from './admin.services';
import { professionalServiceApi } from './professional.services';
import { clientServiceApi } from './client.services';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  ServiceCategory, 
  ServiceDefinition, 
  ProfessionalService,
  Service
} from '../../types/service';
import { fromFirestoreData } from '../utils';

const serviceCategoriesRef = collection(db, 'serviceCategories');
const servicesRef = collection(db, 'services');
const serviceProvidersRef = collection(db, 'serviceProviders');

export const serviceApi = {
  admin: adminServiceApi,
  professional: professionalServiceApi,
  client: clientServiceApi,

  // Shared functionality for categories
  async getCategories(): Promise<ServiceCategory[]> {
    try {
      const snapshot = await getDocs(serviceCategoriesRef);
      return snapshot.docs.map(doc => ({
        ...fromFirestoreData(doc.data()),
        id: doc.id
      })) as ServiceCategory[];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch service categories');
    }
  },

  async getCategoryById(categoryId: string): Promise<ServiceCategory> {
    try {
      const q = query(serviceCategoriesRef, where('id', '==', categoryId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error('Category not found');
      }

      const doc = snapshot.docs[0];
      return {
        ...fromFirestoreData(doc.data()),
        id: doc.id
      } as ServiceCategory;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw new Error('Failed to fetch service category');
    }
  },

  async getCategoriesByIds(categoryIds: string[]): Promise<ServiceCategory[]> {
    try {
      if (!categoryIds.length) return [];

      const q = query(serviceCategoriesRef, where('id', 'in', categoryIds));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        ...fromFirestoreData(doc.data()),
        id: doc.id
      })) as ServiceCategory[];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch service categories');
    }
  }
};

// Re-export individual APIs for direct imports
export { adminServiceApi } from './admin.services';
export { professionalServiceApi } from './professional.services';
export { clientServiceApi } from './client.services';

// Re-export commonly used functions
export const createCategory = adminServiceApi.createCategory;
export const createService = adminServiceApi.createService;
export const deleteProfessionalService = professionalServiceApi.deleteService;
export const getCategories = serviceApi.getCategories;
export const getProfessionalServices = professionalServiceApi.getServices;
export const updateProfessionalService = professionalServiceApi.updateService;
export const saveService = professionalServiceApi.createService;
export const subscribeToServicesUpdates = professionalServiceApi.subscribeToServices;

// New functions for discovery
export async function getServicesByCategory(categoryId: string): Promise<ServiceDefinition[]> {
  try {
    const q = query(servicesRef, where('categoryId', '==', categoryId), where('isPublished', '==', true));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      ...fromFirestoreData(doc.data()),
      id: doc.id
    })) as ServiceDefinition[];
  } catch (error) {
    console.error('Error fetching services by category:', error);
    // Return empty array instead of throwing to prevent UI errors
    return [];
  }
}

// Function to create/update a service provider entry
export async function createOrUpdateServiceProvider(
  professionalId: string,
  professionalName: string,
  professionalImageUrl: string | null,
  service: ProfessionalService,
  categoryId: string
): Promise<void> {
  try {
    // Create a unique ID for the service provider entry
    const serviceProviderId = `${service.baseServiceId}_${professionalId}`;
    
    // Create or update the service provider entry
    await setDoc(doc(serviceProvidersRef, serviceProviderId), {
      serviceId: service.baseServiceId,
      professionalId,
      professionalName,
      professionalImageUrl,
      price: service.price,
      duration: service.duration,
      isActive: service.isActive,
      categoryId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating/updating service provider:', error);
    throw new Error('Failed to create/update service provider');
  }
}

// Function to delete a service provider entry
export async function deleteServiceProvider(
  professionalId: string,
  serviceId: string
): Promise<void> {
  try {
    const serviceProviderId = `${serviceId}_${professionalId}`;
    await deleteDoc(doc(serviceProvidersRef, serviceProviderId));
  } catch (error) {
    console.error('Error deleting service provider:', error);
    throw new Error('Failed to delete service provider');
  }
}

export async function getProfessionalsByService(serviceId: string): Promise<ProfessionalService[]> {
  try {
    // Query the serviceProviders collection for this service
    const q = query(
      serviceProvidersRef, 
      where('serviceId', '==', serviceId),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log(`No professionals found for service: ${serviceId}`);
      return [];
    }
    
    // Map the results to ProfessionalService objects
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        baseServiceId: data.serviceId,
        professionalId: data.professionalId,
        name: data.professionalName,
        price: data.price,
        duration: data.duration,
        isActive: data.isActive,
        // Add other required fields with default values
        description: '',
        category: { id: data.categoryId || '', name: '' },
        basePrice: data.price,
        baseDuration: data.duration,
        imageUrls: data.professionalImageUrl ? [data.professionalImageUrl] : [],
        bookings: 0,
        earnings: 0,
        reviews: 0,
        averageRating: 5.0,
        status: 'active'
      } as ProfessionalService;
    });
  } catch (error) {
    console.error('Error fetching professionals by service:', error);
    // Return empty array instead of throwing to prevent UI errors
    return [];
  }
}

export async function getProfessionalServicesByProfessional(professionalId: string): Promise<ProfessionalService[]> {
  try {
    return await professionalServiceApi.getServices(professionalId, { status: 'active' });
  } catch (error) {
    console.error('Error fetching professional services:', error);
    throw new Error('Failed to fetch professional services');
  }
}

export async function getProfessionalServicesByCategory(categoryId: string): Promise<ProfessionalService[]> {
  try {
    // First, get all services in this category
    const baseServices = await getServicesByCategory(categoryId);
    
    if (!baseServices.length) {
      return [];
    }
    
    // Get all the service IDs in this category
    const serviceIds = baseServices.map(service => service.id);
    
    // Get all users with the professional role
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    // For each professional, check if they offer services in this category
    const professionalServicesPromises = usersSnapshot.docs
      .filter(doc => doc.data().role === 'professional')
      .map(async (userDoc) => {
        const professionalId = userDoc.id;
        const servicesRef = collection(db, 'users', professionalId, 'services');
        
        try {
          // We can't use 'in' queries with security rules limitations, so we'll get all services
          // and filter them in memory
          const servicesSnapshot = await getDocs(servicesRef);
          
          return servicesSnapshot.docs
            .map(doc => ({
              ...fromFirestoreData(doc.data()),
              id: doc.id
            }))
            .filter(service => {
              // Type assertion to access properties
              const professionalService = service as any;
              return serviceIds.includes(professionalService.baseServiceId) && 
                     professionalService.isActive === true;
            }) as ProfessionalService[];
        } catch (error) {
          console.error(`Error fetching services for professional ${professionalId}:`, error);
          return [] as ProfessionalService[];
        }
      });
    
    const results = await Promise.all(professionalServicesPromises);
    const allProfessionalServices = results.flat();
    
    // Filter out duplicates based on id
    const uniqueProfessionalServices = allProfessionalServices.filter(
      (service, index, self) => 
        index === self.findIndex(s => s.id === service.id)
    );
    
    return uniqueProfessionalServices;
  } catch (error) {
    console.error('Error fetching professional services by category:', error);
    // Return empty array instead of throwing to prevent UI errors
    return [];
  }
}
