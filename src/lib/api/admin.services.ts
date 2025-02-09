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
  arrayUnion,
  arrayRemove,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { AdminService, ServiceCategory, ServiceFilter, ServiceSort } from '../../types/service';
import { toFirestoreData, fromFirestoreData } from '../utils';

const servicesRef = collection(db, 'services');
const serviceCategoriesRef = collection(db, 'serviceCategories');

export const adminServiceApi = {
  // Service Management
  async createService(service: Omit<AdminService, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminService> {
    try {
      const serviceData = {
        ...service,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        totalBookings: 0,
        revenue: 0,
        rating: 0
      };

      const docRef = await addDoc(servicesRef, toFirestoreData(serviceData));
      
      if (service.categoryId) {
        const categoryRef = doc(serviceCategoriesRef, service.categoryId);
        await updateDoc(categoryRef, {
          services: arrayUnion(docRef.id),
          updatedAt: serverTimestamp()
        });
      }

      return {
        ...serviceData,
        id: docRef.id
      } as AdminService;
    } catch (error) {
      console.error('Error creating service:', error);
      throw new Error('Failed to create service');
    }
  },

  async updateService(serviceId: string, updates: Partial<AdminService>): Promise<void> {
    try {
      const serviceRef = doc(servicesRef, serviceId);
      await updateDoc(serviceRef, {
        ...toFirestoreData(updates),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating service:', error);
      throw new Error('Failed to update service');
    }
  },

  async deleteService(serviceId: string): Promise<void> {
    try {
      const serviceRef = doc(servicesRef, serviceId);
      const serviceSnap = await getDoc(serviceRef);

      if (!serviceSnap.exists()) {
        throw new Error('Service not found');
      }

      const serviceData = serviceSnap.data();

      if (serviceData.categoryId) {
        const categoryRef = doc(serviceCategoriesRef, serviceData.categoryId);
        await updateDoc(categoryRef, {
          services: arrayRemove(serviceId),
          updatedAt: serverTimestamp()
        });
      }

      await deleteDoc(serviceRef);
    } catch (error) {
      console.error('Error deleting service:', error);
      throw new Error('Failed to delete service');
    }
  },

  async getServices(filter?: ServiceFilter, sort?: ServiceSort): Promise<AdminService[]> {
    try {
      let q = query(servicesRef);

      if (filter) {
        if (filter.category) {
          q = query(q, where('categoryId', '==', filter.category));
        }
        if (filter.status) {
          q = query(q, where('status', '==', filter.status));
        }
      }

      const snapshot = await getDocs(q);
      let services = snapshot.docs.map(doc => ({
        ...fromFirestoreData(doc.data()),
        id: doc.id
      })) as AdminService[];

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
      console.error('Error fetching services:', error);
      throw new Error('Failed to fetch services');
    }
  },

  // Category Management
  async createCategory(category: Omit<ServiceCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(serviceCategoriesRef, {
        ...category,
        services: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }
  },

  async updateCategory(categoryId: string, updates: Partial<ServiceCategory>): Promise<void> {
    try {
      const categoryRef = doc(serviceCategoriesRef, categoryId);
      await updateDoc(categoryRef, {
        ...toFirestoreData(updates),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }
  },

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      const categoryRef = doc(serviceCategoriesRef, categoryId);
      const categorySnap = await getDoc(categoryRef);

      if (!categorySnap.exists()) {
        throw new Error('Category not found');
      }

      const categoryData = categorySnap.data();
      if (categoryData.services?.length > 0) {
        throw new Error('Cannot delete category with existing services');
      }

      await deleteDoc(categoryRef);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }
  },

  async getCategory(categoryId: string): Promise<ServiceCategory> {
    try {
      const categoryRef = doc(serviceCategoriesRef, categoryId);
      const categorySnap = await getDoc(categoryRef);

      if (!categorySnap.exists()) {
        throw new Error('Category not found');
      }

      return {
        ...fromFirestoreData(categorySnap.data()),
        id: categorySnap.id
      } as ServiceCategory;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw new Error('Failed to fetch category');
    }
  },

  subscribeToServices(
    callback: (services: AdminService[]) => void,
    filter?: ServiceFilter
  ): () => void {
    let q = query(servicesRef);

    if (filter) {
      if (filter.category) {
        q = query(q, where('categoryId', '==', filter.category));
      }
      if (filter.status) {
        q = query(q, where('status', '==', filter.status));
      }
    }

    return onSnapshot(q, (snapshot) => {
      const services = snapshot.docs.map(doc => ({
        ...fromFirestoreData(doc.data()),
        id: doc.id
      })) as AdminService[];
      callback(services);
    });
  }
};
