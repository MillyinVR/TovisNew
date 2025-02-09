import { useState, useEffect } from 'react';
import { 
  getCategories, 
  getServicesByCategory, 
  getProfessionalsByService,
  getProfessionalServicesByProfessional,
  getProfessionalServicesByCategory,
  subscribeToServicesUpdates
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
        setCategories(fetchedCategories.map(category => ({
          ...category,
          services: [],
          professionalServices: [],
          loading: true,
          error: null
        })));

        // Set up real-time listeners for each category
        const unsubscribeCallbacks = fetchedCategories.map(category => {
          return subscribeToServicesUpdates(category.id, (newServices) => {
            setCategories(prev => prev.map(cat => {
              if (cat.id === category.id) {
                return {
                  ...cat,
                  services: newServices,
                  loading: false,
                  error: null
                };
              }
              return cat;
            }));
          });
        });

        // Cleanup function
        return () => {
          unsubscribeCallbacks.forEach(unsubscribe => unsubscribe());
        };
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
      setLoading(false);
    }
  }, [categories]);

  return {
    categories,
    trendingServices,
    loading,
    error
  };
};
