import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  QueryDocumentSnapshot,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../firebase';
import { ClientService, ServiceFilter, ServiceSort } from '../../types/service';
import { fromFirestoreData } from '../utils';

const servicesRef = collection(db, 'services');

export const clientServiceApi = {
  async getServices(
    filter?: ServiceFilter,
    sort?: ServiceSort,
    pageSize: number = 20,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ): Promise<{ services: ClientService[]; lastDoc: QueryDocumentSnapshot<DocumentData> | undefined }> {
    try {
      const queryConstraints: QueryConstraint[] = [where('isPublished', '==', true)];

      if (filter) {
        if (filter.category) {
          queryConstraints.push(where('categoryId', '==', filter.category));
        }
        if (filter.status) {
          queryConstraints.push(where('status', '==', filter.status));
        }
        if (filter.rating) {
          queryConstraints.push(where('rating', '>=', filter.rating));
        }
      }

      if (sort?.field && sort?.direction) {
        queryConstraints.push(orderBy(sort.field, sort.direction));
      }

      if (lastDoc) {
        queryConstraints.push(startAfter(lastDoc));
      }

      queryConstraints.push(limit(pageSize));

      const q = query(servicesRef, ...queryConstraints);
      const snapshot = await getDocs(q);
      
      const services = snapshot.docs.map(doc => ({
        ...fromFirestoreData(doc.data()),
        id: doc.id
      })) as ClientService[];

      return {
        services,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };
    } catch (error) {
      console.error('Error fetching services:', error);
      throw new Error('Failed to fetch services');
    }
  },

  async getServiceById(serviceId: string): Promise<ClientService> {
    try {
      const serviceRef = doc(servicesRef, serviceId);
      const serviceSnap = await getDoc(serviceRef);

      if (!serviceSnap.exists()) {
        throw new Error('Service not found');
      }

      return {
        ...fromFirestoreData(serviceSnap.data()),
        id: serviceSnap.id
      } as ClientService;
    } catch (error) {
      console.error('Error fetching service:', error);
      throw new Error('Failed to fetch service');
    }
  },

  async getRecommendedServices(
    maxResults: number = 10
  ): Promise<ClientService[]> {
    try {
      const queryConstraints: QueryConstraint[] = [
        where('isPublished', '==', true),
        orderBy('rating', 'desc'),
        limit(maxResults)
      ];

      const q = query(servicesRef, ...queryConstraints);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        ...fromFirestoreData(doc.data()),
        id: doc.id
      })) as ClientService[];
    } catch (error) {
      console.error('Error fetching recommended services:', error);
      throw new Error('Failed to fetch recommended services');
    }
  },

  subscribeToServices(
    callback: (services: ClientService[]) => void,
    filter?: ServiceFilter
  ): () => void {
    const queryConstraints: QueryConstraint[] = [where('isPublished', '==', true)];

    if (filter) {
      if (filter.category) {
        queryConstraints.push(where('categoryId', '==', filter.category));
      }
      if (filter.status) {
        queryConstraints.push(where('status', '==', filter.status));
      }
      if (filter.rating) {
        queryConstraints.push(where('rating', '>=', filter.rating));
      }
    }

    const q = query(servicesRef, ...queryConstraints);

    return onSnapshot(q, (snapshot) => {
      const services = snapshot.docs.map(doc => ({
        ...fromFirestoreData(doc.data()),
        id: doc.id
      })) as ClientService[];
      callback(services);
    });
  },

  async toggleBookmark(
    userId: string,
    serviceId: string,
    isBookmarked: boolean
  ): Promise<void> {
    try {
      const bookmarkRef = doc(db, 'users', userId, 'bookmarks', serviceId);
      
      if (isBookmarked) {
        await setDoc(bookmarkRef, {
          serviceId,
          createdAt: new Date()
        });
      } else {
        await deleteDoc(bookmarkRef);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw new Error('Failed to toggle bookmark');
    }
  },

  async getBookmarkedServices(userId: string): Promise<ClientService[]> {
    try {
      const bookmarksRef = collection(db, 'users', userId, 'bookmarks');
      const snapshot = await getDocs(bookmarksRef);
      
      const serviceIds = snapshot.docs.map(doc => doc.id);
      const services = await Promise.all(
        serviceIds.map(id => this.getServiceById(id))
      );

      return services.map(service => ({
        ...service,
        isBookmarked: true
      }));
    } catch (error) {
      console.error('Error fetching bookmarked services:', error);
      throw new Error('Failed to fetch bookmarked services');
    }
  }
};
