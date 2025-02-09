import React, { useState } from 'react';
import { useServiceManagement } from '@/hooks/useServiceManagement';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Clock, DollarSign, Edit2, Trash2 } from 'lucide-react';
import type { ProfessionalService } from '@/types/service';
import { ServiceSetupModal } from '@/components/professional/services/ServiceSetupModal';

const ServiceCard = ({ 
  service,
  permissions,
  onEdit,
  onDelete 
}: { 
  service: ProfessionalService;
  permissions: { canEdit: boolean };
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div className="p-6 border rounded-lg mb-4 bg-white shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{service.category.name}</p>
        <p className="mt-2 text-gray-700">{service.description}</p>
        
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center text-gray-700">
            <Clock className="h-5 w-5 mr-2 text-indigo-600" />
            {service.baseDuration} minutes
          </div>
          <div className="flex items-center text-gray-700">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            ${service.basePrice}
          </div>
        </div>

        {service.customOptions && service.customOptions.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Options:</h4>
            <div className="space-y-2">
              {service.customOptions.map(option => (
                <div key={option.id} className="flex items-center justify-between text-sm">
                  <span>{option.name}</span>
                  <span className="text-gray-600">+${option.basePrice}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {service.imageUrls?.[0] && (
        <img 
          src={service.imageUrls[0]} 
          alt={service.name}
          className="w-24 h-24 rounded-lg object-cover ml-4"
        />
      )}
    </div>

    {permissions.canEdit && (
      <div className="mt-4 flex gap-3 pt-4 border-t">
        <button 
          onClick={onEdit}
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <Edit2 className="h-4 w-4 mr-1" />
          Edit
        </button>
        <button 
          onClick={onDelete}
          className="flex items-center text-red-600 hover:text-red-800"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </button>
      </div>
    )}
  </div>
);

const ServicesSkeletonLoader = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-24 bg-gray-100 rounded-lg" />
    <div className="h-24 bg-gray-100 rounded-lg" />
  </div>
);

const ServicesError = ({ error }: { error: Error | string }) => (
  <div className="text-red-500 p-4 border border-red-200 rounded-lg">
    Error loading services: {typeof error === 'string' ? error : error.message}
  </div>
);

interface ServicesSectionProps {
  profileId: string;
  permissions: {
    canEdit: boolean;
  };
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  profileId,
  permissions
}) => {
  const [showServiceSetup, setShowServiceSetup] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<ProfessionalService | null>(null);

  const { 
    professionalServices = [],
    loading,
    error,
    deleteProfessionalService
  } = useServiceManagement();

  const activeServices = professionalServices.filter(service => 
    service.isActive && service.category
  );

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await deleteProfessionalService(serviceId);
    } catch (err) {
      console.error('Error deleting service:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete service');
    }
  };

  if (loading) return <ServicesSkeletonLoader />;
  if (error) return <ServicesError error={error} />;

  return (
    <div className="space-y-4">
      {permissions.canEdit && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowServiceSetup(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-full"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Service
          </button>
        </div>
      )}

      {activeServices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No services available</p>
          {permissions.canEdit && (
            <button
              onClick={() => setShowServiceSetup(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-full"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Your First Service
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {activeServices.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              permissions={permissions}
              onEdit={() => setServiceToEdit(service)}
              onDelete={() => handleDeleteService(service.id)}
            />
          ))}
        </div>
      )}

      {/* Service Setup Modal */}
      {showServiceSetup && (
        <ServiceSetupModal onClose={() => setShowServiceSetup(false)} mode="add" />
      )}

      {/* Edit Service Modal */}
      {serviceToEdit && (
        <ServiceSetupModal 
          onClose={() => setServiceToEdit(null)} 
          mode="edit" 
          serviceId={serviceToEdit.baseServiceId} 
        />
      )}
    </div>
  );
};
