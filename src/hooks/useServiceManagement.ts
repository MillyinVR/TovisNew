import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Timestamp, 
  collection, 
  getDocs,
  query,
  where,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { fromFirestoreData } from '../lib/utils';
import {
  getProfessionalServices,
  getCategories
} from '../lib/api/services';
import { professionalServiceApi } from '../lib/api/professional.services';
import { 
  Service, 
  ServiceCategory, 
  AdminService, 
  ServiceData,
  ServiceMedia,
  ProfessionalService 
} from '../types/service';

// Utility function to validate price and duration
const validatePriceAndDuration = (
  baseService: Service,
  price: number,
  duration: number
) => {
  // Validate price - must be greater than or equal to base price
  if (price < baseService.basePrice) {
    throw new Error(`Price cannot be lower than the base price of $${baseService.basePrice}`);
  }

  // Validate duration - must be within reasonable bounds
  const minDuration = Math.max(15, baseService.baseDuration * 0.5);
  const maxDuration = baseService.baseDuration * 2;

  if (duration < minDuration) {
    throw new Error(`Duration cannot be less than ${minDuration} minutes (50% of base duration)`);
  }
  if (duration > maxDuration) {
    throw new Error(`Duration cannot exceed ${maxDuration} minutes (200% of base duration)`);
  }
};

// Type guard for service data
const isValidServiceData = (data: DocumentData): data is ServiceData => {
  return (
    typeof data.name === 'string' &&
    typeof data.categoryId === 'string' &&
    typeof data.price === 'number' &&
    typeof data.duration === 'number'
  );
};

export const useServiceManagement = () => {
  const { userProfile } = useAuth();
  const [serviceDefinitions, setServiceDefinitions] = useState<Service[]>([]);
  const [professionalServices, setProfessionalServices] = useState<ProfessionalService[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isFetchingServices, setIsFetchingServices] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error whenever a new operation starts
  const clearError = useCallback(() => {
    if (error) setError(null);
  }, [error]);

  // Initialize data and fetch categories/services
  useEffect(() => {
    const loadServices = async () => {
      if (!userProfile?.uid) return;

      try {
        setLoading(true);
        clearError();
        
        console.log('Loading services for professional:', userProfile.uid);
        
        const [professionalServicesData, categoriesData] = await Promise.all([
          getProfessionalServices(userProfile.uid),
          getCategories()
        ]);
        console.log('Fetched professional services:', professionalServicesData);
        console.log('Fetched categories:', categoriesData);
        
        setProfessionalServices(professionalServicesData);
        setCategories(categoriesData);
        
        setIsFetchingServices(true);
        
        // Get services from selected category or all categories
        const relevantCategories = selectedCategory
          ? [categoriesData.find(c => c.id === selectedCategory)].filter(Boolean)
          : categoriesData;
          
        console.log('Relevant categories:', relevantCategories);

        // Get services from Firestore
        const servicesRef = collection(db, 'services');
        const servicesQuery = selectedCategory 
          ? query(servicesRef, where('categoryId', '==', selectedCategory))
          : servicesRef;
        
        const servicesSnapshot = await getDocs(servicesQuery);
        
        // Convert to Service type with proper validation
        const services = servicesSnapshot.docs
          .map((doc: QueryDocumentSnapshot) => {
            try {
              const data = doc.data();
              if (!isValidServiceData(data)) {
                console.warn(`Skipping invalid service ${doc.id}: missing required fields`);
                return null;
              }

              return {
                id: doc.id,
                name: data.name || '',
                description: data.description || '',
                basePrice: Number(data.price) || 0,
                minPrice: Number(data.price) || 0,
                priceStep: Number(data.priceStep) || 0,
                baseDuration: Number(data.duration) || 0,
                minDuration: Number(data.duration) || 0,
                duration: Number(data.duration) || 0,
                durationStep: Number(data.durationStep) || 0,
                categoryId: data.categoryId || '',
                imageUrls: Array.isArray(data.media) 
                  ? data.media.map((m: ServiceMedia) => m?.url || '').filter(Boolean)
                  : [],
                isAvailable: Boolean(data.isPublished),
                isBaseService: true,
                createdBy: 'admin' as const,
                createdAt: data.createdAt || Timestamp.now(),
                updatedAt: data.updatedAt || Timestamp.now(),
                price: Number(data.price) || 0
              } as Service;
            } catch (err) {
              console.error(`Error processing service ${doc.id}:`, err);
              return null;
            }
          })
          .filter((service): service is Service => service !== null);
        
        setServiceDefinitions(services as Service[]);
        setIsFetchingServices(false);
      } catch (err) {
        console.error('Error loading services:', err);
        setError(err instanceof Error ? err.message : 'Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [userProfile?.uid, clearError, selectedCategory]);

  // Add a service to professional's offerings
  const addService = async (
    serviceId: string,
    price: number,
    baseDuration: number,
    isActive: boolean
  ) => {
    if (!userProfile?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      clearError();

      // Validate service exists and professional can add it
      const baseService = serviceDefinitions.find(s => s.id === serviceId);
      if (!baseService) {
        throw new Error('Service not found');
      }
      
      // Check if professional already offers this service
      const existingService = professionalServices.find(s => s.baseServiceId === serviceId);
      if (existingService) {
        throw new Error('You already offer this service');
      }

      // Validate price and duration
      validatePriceAndDuration(baseService, price, baseDuration);

      const newService = await professionalServiceApi.createService(userProfile.uid, {
        name: baseService.name,
        description: baseService.description,
        basePrice: price,
        price: price,
        baseDuration: baseDuration,
        duration: baseDuration,
        baseServiceId: serviceId,
        category: {
          id: baseService.categoryId,
          name: categories.find(c => c.id === baseService.categoryId)?.name || ''
        },
        imageUrls: baseService.imageUrls || [],
        isActive: true,
        professionalId: userProfile.uid,
        status: 'active',
        isPublished: true,
        bookings: 0,
        earnings: 0,
        reviews: 0,
        averageRating: 0,
        customOptions: []
      });

      // Refresh professional services after adding new one
      const updatedServices = await getProfessionalServices(userProfile.uid);
      setProfessionalServices(updatedServices);

      console.log('Service added successfully:', newService);
    } catch (err) {
      console.error('Error adding service:', err);
      setError(err instanceof Error ? err.message : 'Failed to add service');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a professional's service
  const updateService = async (
    serviceId: string,
    price: number,
    baseDuration: number
  ) => {
    if (!userProfile?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      clearError();

      // Get the base service to validate against
      const professionalService = professionalServices.find(s => s.id === serviceId);
      if (!professionalService) throw new Error('Service not found');

      const baseService = serviceDefinitions.find(s => s.id === professionalService.baseServiceId);
      if (!baseService) throw new Error('Base service not found');

      // Validate price - must be greater than or equal to base price
      if (price < baseService.basePrice) {
        throw new Error(`Price cannot be lower than the base price of $${baseService.basePrice}`);
      }

      // Validate duration - must be within reasonable bounds
      const minDuration = Math.max(15, baseService.baseDuration * 0.5);
      const maxDuration = baseService.baseDuration * 2;

      if (baseDuration < minDuration) {
        throw new Error(`Duration cannot be less than ${minDuration} minutes (50% of base duration)`);
      }
      if (baseDuration > maxDuration) {
        throw new Error(`Duration cannot exceed ${maxDuration} minutes (200% of base duration)`);
      }

      await professionalServiceApi.updateService(userProfile.uid, serviceId, {
        basePrice: price,
        price: price,
        baseDuration: baseDuration,
        duration: baseDuration,
        updatedAt: Timestamp.fromDate(new Date())
      });

      // Refresh professional services after update
      const updatedServices = await getProfessionalServices(userProfile.uid);
      setProfessionalServices(updatedServices);

    } catch (err) {
      console.error('Error updating service:', err);
      setError(err instanceof Error ? err.message : 'Failed to update service');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a service from professional's offerings
  const deleteService = async (serviceId: string) => {
    if (!userProfile?.uid) {
      throw new Error('User not authenticated');
    }

    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      setLoading(true);
      clearError();

      await professionalServiceApi.deleteService(userProfile.uid, serviceId);
      
      // Refresh professional services after deletion
      const updatedServices = await getProfessionalServices(userProfile.uid);
      setProfessionalServices(updatedServices);

    } catch (err) {
      console.error('Error deleting service:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete service');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    serviceDefinitions,
    professionalServices,
    categories,
    selectedCategory,
    setSelectedCategory,
    loading,
    isFetchingServices,
    error,
    addService,
    updateService,
    deleteProfessionalService: deleteService,
    clearError
  };
};
