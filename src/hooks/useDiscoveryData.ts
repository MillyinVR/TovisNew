import { useState, useEffect } from 'react';
import { 
  getCategories, 
  getServicesByCategory, 
  getProfessionalsByService,
  getProfessionalServicesByProfessional,
  getProfessionalServicesByCategory
} from '../lib/api/services';
import { ServiceCategory, ServiceDefinition, ProfessionalService } from '../types/service';

export type UnifiedService = (ServiceDefinition & { isProfessionalService?: false }) | 
  (ProfessionalService & { isProfessionalService: true });

export interface DiscoveryCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  services: UnifiedService[];
  loading?: boolean;
  error?: string | null;
}

export interface DiscoveryData {
  categories: DiscoveryCategory[];
  trendingServices: UnifiedService[];
  loading: boolean;
  error: string | null;
}

export const useDiscoveryData = (): DiscoveryData => {
  const [categories, setCategories] = useState<DiscoveryCategory[]>([]);
  const [trendingServices, setTrendingServices] = useState<UnifiedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all categories first
        const fetchedCategories = await getCategories();
        
        // Initialize categories with loading states
        const initialCategories = fetchedCategories.map(category => ({
          ...category,
          services: [],
          loading: true,
          error: null
        }));
        
        setCategories(initialCategories);

        // Fetch services for each category
        const categoriesWithServices = await Promise.all(
          fetchedCategories.map(async (category) => {
            try {
              // Get base services for this category
              const baseServices = await getServicesByCategory(category.id);
              const baseServicesWithFlag = baseServices.map(service => ({
                ...service,
                isProfessionalService: false as const
              }));
              
              // Get professional services for this category
              const professionalServices = await getProfessionalServicesByCategory(category.id);
              const professionalServicesWithFlag = professionalServices.map(service => ({
                ...service,
                isProfessionalService: true as const
              }));
              
              // Combine both types of services
              const allServices = [...baseServicesWithFlag, ...professionalServicesWithFlag];
              
              return {
                ...category,
                services: allServices,
                loading: false,
                error: null
              };
            } catch (err) {
              console.error(`Error fetching services for category ${category.id}:`, err);
              return {
                ...category,
                services: [],
                loading: false,
                error: err instanceof Error ? err.message : 'Failed to fetch services'
              };
            }
          })
        );
        
        setCategories(categoriesWithServices);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching discovery data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Update trending services whenever categories change
  useEffect(() => {
    if (categories.length > 0) {
      const allServices = categories.flatMap(cat => cat.services);
      
      const trending = allServices
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 4);

      setTrendingServices(trending);
    }
  }, [categories]);

  return {
    categories,
    trendingServices,
    loading,
    error
  };
};
