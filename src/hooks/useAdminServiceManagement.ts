import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { serviceApi } from '../lib/api/services';
import type { ServiceCategory, AdminService } from '../types/service';
import { Timestamp } from 'firebase/firestore';

export const useAdminServiceManagement = () => {
  const { userProfile } = useAuth();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (userProfile?.role !== 'admin') {
        setError('Unauthorized access');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedCategories = await serviceApi.getCategories();
        setCategories(fetchedCategories);

        // Fetch all services grouped by category
        const servicesByCategory = await Promise.all(
          fetchedCategories.map(async cat => {
            const services = await serviceApi.admin.getServices({ category: cat.id });
            return services;
          })
        );
        setServices(servicesByCategory.flat());
      } catch (err) {
        console.error('Failed to fetch service data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch service data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userProfile]);

  const addCategory = async (name: string, description: string) => {
    if (userProfile?.role !== 'admin') {
      throw new Error('Unauthorized access');
    }

    try {
      setLoading(true);
      setError(null);
      const categoryId = await serviceApi.admin.createCategory({ 
        name, 
        description,
        services: [] 
      });
      const newCategory: ServiceCategory = {
        id: categoryId,
        name,
        description,
        services: [],
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      };
      setCategories(prev => [...prev, newCategory]);
      return categoryId;
    } catch (err) {
      console.error('Failed to create category:', err);
      setError(err instanceof Error ? err.message : 'Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editCategory = async (categoryId: string, updates: Partial<ServiceCategory>) => {
    if (userProfile?.role !== 'admin') {
      throw new Error('Unauthorized access');
    }

    try {
      setLoading(true);
      setError(null);
      await serviceApi.admin.updateCategory(categoryId, updates);
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, ...updates, updatedAt: Timestamp.fromDate(new Date()) }
          : cat
      ));
    } catch (err) {
      console.error('Failed to update category:', err);
      setError(err instanceof Error ? err.message : 'Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeCategory = async (categoryId: string) => {
    if (userProfile?.role !== 'admin') {
      throw new Error('Unauthorized access');
    }

    try {
      setLoading(true);
      setError(null);
      await serviceApi.admin.deleteCategory(categoryId);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    } catch (err) {
      console.error('Failed to delete category:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addService = async (serviceData: Omit<AdminService, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (userProfile?.role !== 'admin') {
      throw new Error('Unauthorized access');
    }

    try {
      setLoading(true);
      setError(null);

      // Log incoming service data
      console.log('Creating service with data:', serviceData);

      // Ensure required fields are present
      if (!serviceData.name?.trim()) {
        throw new Error('Service name is required');
      }
      if (!serviceData.description?.trim()) {
        throw new Error('Service description is required');
      }
      if (!serviceData.categoryId) {
        throw new Error('Category ID is required');
      }
      if (!serviceData.price || serviceData.price <= 0) {
        throw new Error('Price must be greater than 0');
      }
      if (!serviceData.duration || serviceData.duration < 15) {
        throw new Error('Duration must be at least 15 minutes');
      }

      // Create the service
      const newService = await serviceApi.admin.createService(serviceData);
      console.log('Service created successfully:', newService);

      setServices(prev => [...prev, newService]);
      return newService.id;
    } catch (err) {
      console.error('Failed to create service:', err);
      setError(err instanceof Error ? err.message : 'Failed to create service');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editService = async (serviceId: string, updates: Partial<AdminService>) => {
    if (userProfile?.role !== 'admin') {
      throw new Error('Unauthorized access');
    }

    try {
      setLoading(true);
      setError(null);
      await serviceApi.admin.updateService(serviceId, updates);
      setServices(prev => prev.map(service => {
        if (service.id === serviceId) {
          return {
            ...service,
            ...updates,
            updatedAt: Timestamp.now()
          };
        }
        return service;
      }));
    } catch (err) {
      console.error('Failed to update service:', err);
      setError(err instanceof Error ? err.message : 'Failed to update service');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeService = async (serviceId: string) => {
    if (userProfile?.role !== 'admin') {
      throw new Error('Unauthorized access');
    }

    try {
      setLoading(true);
      setError(null);
      await serviceApi.admin.deleteService(serviceId);
      setServices(prev => prev.filter(service => service.id !== serviceId));
    } catch (err) {
      console.error('Failed to delete service:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete service');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    services,
    loading,
    error,
    addCategory,
    editCategory,
    removeCategory,
    addService,
    editService,
    removeService
  };
};
