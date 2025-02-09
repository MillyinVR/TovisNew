import { adminServiceApi } from './admin.services';
import { professionalServiceApi } from './professional.services';
import { clientServiceApi } from './client.services';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { ServiceCategory } from '../../types/service';
import { fromFirestoreData } from '../utils';

const serviceCategoriesRef = collection(db, 'serviceCategories');

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
