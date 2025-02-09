import React, { useState, useEffect } from 'react';
import { Clock, DollarSign } from 'lucide-react';
import { useServiceManagement } from '../../../hooks/useServiceManagement';
import { useAuth } from '../../../contexts/AuthContext';
import { Service, ServiceCategory, ProfessionalService } from '../../../types/service';
import { ErrorBoundary } from '../../ErrorBoundary';

interface ServiceSetupProps {
  onClose?: () => void;
  mode?: 'add' | 'edit';
  serviceId?: string;
}

const ServiceSetupContent: React.FC<ServiceSetupProps> = ({
  onClose,
  mode = 'add',
  serviceId
}) => {
  console.log('ServiceSetupContent: Rendering');

  const { userProfile } = useAuth();
  console.log('ServiceSetupContent: User profile:', userProfile);

  if (!userProfile) {
    console.error('ServiceSetupContent: No user profile found');
    throw new Error('User profile is required');
  }

  // Skip role check for now since role might not be in the user profile
  // We can assume they're a professional if they have access to this component

  const serviceManagement = useServiceManagement();
  
  if (!serviceManagement) {
    console.error('ServiceSetupContent: useServiceManagement returned null');
    return <div>Error: Service management not available</div>;
  }

  const {
    categories,
    serviceDefinitions: services,
    professionalServices,
    loading,
    error,
    isFetchingServices,
    selectedCategory,
    setSelectedCategory,
    addService,
    clearError
  } = serviceManagement;

  // Debug logging
  console.log('ServiceSetupContent: Service management data:', {
    categoriesLength: categories?.length,
    servicesLength: services?.length,
    categories,
    services,
    selectedCategory,
    loading,
    isFetchingServices
  });

  const [formData, setFormData] = useState({
    serviceId: serviceId || '',
    price: '',
    duration: '',
    bufferTime: '15'
  });

  useEffect(() => {
    if (mode === 'edit' && serviceId && services && services.length > 0) {
      const service = services.find((s: Service) => s.id === serviceId);
      const professionalService = professionalServices?.find(
        (ps: ProfessionalService) => ps.baseServiceId === serviceId
      );

      if (service && professionalService) {
        setFormData({
          serviceId,
          price: professionalService.price.toString(),
          duration: professionalService.duration.toString(),
          bufferTime: '15'
        });
      }
    }
  }, [mode, serviceId, services, professionalServices]);

  // Check if a service is already added by the professional
  const isServiceAdded = (serviceId: string) => {
    return professionalServices?.some((ps: ProfessionalService) => ps.baseServiceId === serviceId) || false;
  };

  // Get professional service details if service is already added
  const getProfessionalService = (serviceId: string) => {
    return professionalServices?.find((ps: ProfessionalService) => ps.baseServiceId === serviceId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('ServiceSetupContent: Submitting form:', formData);

    if (!userProfile?.uid) {
      console.error('ServiceSetupContent: No user profile found during submit');
      return;
    }

    try {
      clearError?.();
      const selectedService = services?.find((s: Service) => s.id === formData.serviceId);
      if (!selectedService) {
        throw new Error('Service not found');
      }

      // Validate price - must be greater than or equal to base price
      const price = Number(formData.price);
      if (price < selectedService.basePrice) {
        throw new Error(`Price must be at least $${selectedService.basePrice} (base price)`);
      }

      // Validate duration - must be within reasonable bounds
      const duration = Number(formData.duration);
      const minDuration = Math.max(15, selectedService.baseDuration * 0.5); // Can't be less than 50% of base duration or 15 mins
      const maxDuration = selectedService.baseDuration * 2; // Can't be more than double the base duration
      
      if (!duration || duration < minDuration) {
        throw new Error(`Duration must be at least ${minDuration} minutes`);
      }
      if (duration > maxDuration) {
        throw new Error(`Duration cannot exceed ${maxDuration} minutes`);
      }

      if (addService) {
        await addService(
          formData.serviceId,
          price,
          duration,
          true
        );
      }

      onClose?.();
    } catch (err) {
      console.error('ServiceSetupContent: Error adding service:', err);
    }
  };

  const handleServiceSelect = (service: Service | undefined) => {
    if (!service || !service.id) {
      console.error('ServiceSetupContent: Invalid service selected');
      return;
    }

    console.log('ServiceSetupContent: Selected service:', service);
    const existingService = getProfessionalService(service.id);
    setFormData({
      ...formData,
      serviceId: service.id,
      price: existingService ? existingService.price.toString() : service.basePrice.toString(),
      duration: existingService ? existingService.duration.toString() : service.baseDuration.toString()
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('ServiceSetupContent: Category change:', e.target.value);
    setSelectedCategory?.(e.target.value);
  };

  if (loading && !categories?.length) {
    console.log('ServiceSetupContent: Showing initial loading state');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    console.log('ServiceSetupContent: Showing error state:', error);
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!categories?.length) {
    console.log('ServiceSetupContent: No categories available');
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No service categories available. Please contact an administrator.</p>
      </div>
    );
  }

  console.log('ServiceSetupContent: Rendering main UI');
  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="mt-4">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Filter by Category
        </label>
        <select
          id="category"
          value={selectedCategory || ''}
          onChange={handleCategoryChange}
          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={loading || isFetchingServices}
        >
          <option value="">All Categories</option>
          {categories.map((category: ServiceCategory) => (
            category && category.id ? (
              <option key={category.id} value={category.id}>{category.name}</option>
            ) : null
          ))}
        </select>
      </div>

      {/* Services List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isFetchingServices ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : !services?.length ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No services available in this category.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {services.map((service: Service) => {
              if (!service || !service.id) return null;
              const addedService = getProfessionalService(service.id);
              const isSelected = service.id === formData.serviceId;
              return (
                <li 
                  key={service.id} 
                  className={`px-4 py-4 sm:px-6 cursor-pointer hover:bg-gray-50 ${
                    isSelected ? 'bg-indigo-50' : ''
                  }`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-500">{service.description}</p>
                      {addedService && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Added to My Services
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {addedService ? (
                          `${addedService.duration} min`
                        ) : (
                          `Base: ${service.baseDuration} min`
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {addedService ? (
                          `$${addedService.price}`
                        ) : (
                          `From $${service.basePrice}`
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Service Form */}
      {formData.serviceId && services && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Your Price ($)
            </label>
            <input
              type="number"
              id="price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              min={services.find((s: Service) => s.id === formData.serviceId)?.basePrice || 0}
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">
              Base price: ${services.find((s: Service) => s.id === formData.serviceId)?.basePrice} (You can only increase the price)
            </p>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
              Your Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              required
              min={formData.serviceId ? 
                Math.max(15, (services.find((s: Service) => s.id === formData.serviceId)?.baseDuration || 0) * 0.5) : 15}
              max={formData.serviceId ? 
                (services.find((s: Service) => s.id === formData.serviceId)?.baseDuration || 0) * 2 : undefined}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">
              Base duration: {services.find((s: Service) => s.id === formData.serviceId)?.baseDuration} minutes
              (Can be adjusted between 50% and 200% of base duration)
            </p>
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {mode === 'edit' ? 'Save Changes' : 'Add Service'}
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

// Wrap the component with ErrorBoundary
export const ServiceSetup: React.FC<ServiceSetupProps> = (props) => {
  console.log('ServiceSetup: Rendering with ErrorBoundary');
  return (
    <ErrorBoundary>
      <ServiceSetupContent {...props} />
    </ErrorBoundary>
  );
};
