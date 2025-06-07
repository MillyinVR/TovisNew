import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DiscoveryHeader } from './DiscoveryHeader';
import { FooterNav } from '../shared/FooterNav';
import { useDiscoveryData } from '../../hooks/useDiscoveryData';
import { useAuth } from '../../contexts/AuthContext';
import { ServiceDefinition, ProfessionalService } from '../../types/service';
import { DiscoveryCategory, UnifiedService } from '../../hooks/useDiscoveryData';
import { getProfessionalsByService } from '../../lib/api/services';

function isServiceDefinition(service: UnifiedService): service is ServiceDefinition {
  return (service as ServiceDefinition).basePrice !== undefined;
}

function isProfessionalService(service: UnifiedService): service is ProfessionalService & { isProfessionalService: true } {
  return (service as ProfessionalService).professionalId !== undefined;
}

// Custom scrollbar styles
const scrollbarStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
`;

const CategoryCard: React.FC<{
  category: DiscoveryCategory;
  onClick: () => void;
}> = ({ category, onClick }) => (
  <div 
    className="relative group cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    onClick={onClick}
  >
<img
  src={(category as any).imageUrl || '/images/default-category.jpg'}
      alt={category.name}
      className="w-full h-48 object-cover"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-colors" />
    <div className="absolute inset-0 flex items-center justify-center">
      <h3 className="text-white text-2xl font-bold text-center px-4">
        {category.name}
      </h3>
    </div>
  </div>
);

export const ProfessionalCard: React.FC<{ professional: ProfessionalService }> = ({ professional }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleProfileClick = () => {
    navigate(`/professionals/${professional.id}`);
  };

  const handleBookNow = () => {
    // Use the actual professional's user ID instead of the concatenated ID
    navigate(`/book/${professional.professionalId}/${professional.baseServiceId}`);
  };

  const handleMessage = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate(`/messages`, { 
      state: { 
        recipientId: professional.professionalId,
        serviceId: professional.baseServiceId,
        serviceName: professional.name
      } 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={handleProfileClick}
            className="text-lg font-semibold text-indigo-600 hover:text-indigo-700 text-left"
          >
            {professional.name}
          </button>
          <div className="flex items-center mt-1">
            <span className="text-yellow-400">★★★★★</span>
            <span className="text-sm text-gray-500 ml-2">
              ({professional.averageRating > 0 ? professional.averageRating.toFixed(1) : '5.0'})
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            className="bg-white border border-indigo-600 text-indigo-600 px-3 py-2 rounded-md hover:bg-indigo-50 transition-colors"
            onClick={handleMessage}
          >
            Message
          </button>
          <button 
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            onClick={handleBookNow}
          >
            Book Now
          </button>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="text-sm text-gray-600">
          <p>{professional.name}: <span className="font-medium text-indigo-600">${professional.price}</span> for {professional.duration} minutes</p>
        </div>
        {professional.customOptions?.map((option, index) => (
          <div key={index} className="text-sm text-gray-600">
            <p>{option.name}: ${option.basePrice}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ServiceCard: React.FC<{
  service: UnifiedService;
  trending?: boolean;
  onClick?: () => void;
}> = ({ service, trending, onClick }) => {
  const price = isServiceDefinition(service) ? service.basePrice : service.price;
  const duration = isServiceDefinition(service) ? service.baseDuration : service.duration;
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer ${
        trending ? 'border-2 border-indigo-100' : ''
      }`}
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{service.name}</h3>
      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description}</p>
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <span className="text-indigo-600 font-medium">
          Starting from ${price}
        </span>
        <span className="text-gray-400 text-sm mt-1 sm:mt-0">
          ({duration} min)
        </span>
      </div>
    </div>
  );
};

const LoadingCard = () => (
  <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    <div className="mt-4 flex justify-between">
      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
      <div className="h-5 bg-gray-200 rounded w-1/4"></div>
    </div>
  </div>
);

export const DiscoveryLayout = () => {
  const { categories, trendingServices, loading, error } = useDiscoveryData();
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<DiscoveryCategory | null>(null);
  const [selectedService, setSelectedService] = useState<UnifiedService | null>(null);
  const [professionals, setProfessionals] = useState<ProfessionalService[]>([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);

  // Fetch professionals when a service is selected
  useEffect(() => {
    if (selectedService && isServiceDefinition(selectedService)) {
      const fetchProfessionals = async () => {
        try {
          setLoadingProfessionals(true);
          const professionalServices = await getProfessionalsByService(selectedService.id);
          setProfessionals(professionalServices);
        } catch (error) {
          console.error('Error fetching professionals:', error);
          setProfessionals([]);
        } finally {
          setLoadingProfessionals(false);
        }
      };

      fetchProfessionals();
    } else {
      setProfessionals([]);
    }
  }, [selectedService]);

  const handleCategorySelect = (category: DiscoveryCategory) => {
    navigate(`/discovery/${category.id}/professionals`, { state: { category } });
  };

  const filteredCategories = useMemo(() => 
    categories,
    [categories]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <DiscoveryHeader searchTerm="" onSearchChange={() => {}} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((j) => (
                    <LoadingCard key={j} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <FooterNav userType={userProfile?.role === 'professional' ? 'professional' : 'client'} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <DiscoveryHeader searchTerm="" onSearchChange={() => {}} />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
        <FooterNav userType={userProfile?.role === 'professional' ? 'professional' : 'client'} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <DiscoveryHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          {/* Categories Grid */}
          {!selectedCategory && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
              <div className="relative">
                <div className="overflow-x-auto pb-4 scrollbar-hide">
                  <div className="flex gap-6 w-max">
                    {filteredCategories.map((category) => (
                      <div key={category.id} className="w-64 flex-shrink-0">
                        <CategoryCard
                          category={category}
                          onClick={() => setSelectedCategory(category)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Trending Services */}
          {trendingServices.length > 0 && !selectedCategory && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {trendingServices.map((service) => {
                  const unifiedService = isServiceDefinition(service) ? 
                    service : 
                    { 
                      ...service,
                      basePrice: service.price,
                      baseDuration: service.duration
                    };
                  
                  return (
                    <ServiceCard 
                      key={service.id} 
                      service={unifiedService} 
                      trending 
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Category Services */}
          {selectedCategory && (
            <div className="space-y-8">
              <button
                onClick={() => selectedService ? setSelectedService(null) : setSelectedCategory(null)}
                className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                {selectedService ? `Back to ${selectedCategory.name}` : 'Back to Categories'}
              </button>

              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedService ? selectedService.name : selectedCategory.name}
                </h2>

                {selectedService ? (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">Available Professionals</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {(() => {
                        try {
                          // If the selected service is a base service definition, fetch professionals who offer it
                          if (!isProfessionalService(selectedService)) {
                            // Use the professionals state to display all professionals offering this service
                            if (!professionals || professionals.length === 0) {
                              return (
                                <div className="col-span-full text-center py-8">
                                  {loadingProfessionals ? (
                                    <div className="flex justify-center">
                                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </div>
                                  ) : (
                                    <p className="text-gray-500">No professionals available for this service yet</p>
                                  )}
                                </div>
                              );
                            }
                            
                            return professionals.map(professional => (
                              <ProfessionalCard key={professional.id} professional={professional} />
                            ));
                          } else {
                            // If it's already a professional service, just show that professional
                            const professional = selectedService as ProfessionalService;
                            return <ProfessionalCard key={professional.id} professional={professional} />;
                          }
                        } catch (error) {
                          console.error('Error rendering professionals:', error);
                          return (
                            <div className="col-span-full text-center py-8">
                              <p className="text-gray-500">Unable to display professionals at this time</p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">Services</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {selectedCategory.loading ? (
                          [1, 2, 3, 4].map((i) => (
                            <LoadingCard key={i} />
                          ))
                        ) : selectedCategory.error ? (
                          <div className="bg-red-50 p-4 rounded-md">
                            <p className="text-red-600">{selectedCategory.error}</p>
                          </div>
                        ) : selectedCategory.services.length === 0 ? (
                          <div className="col-span-full text-center py-8">
                            <p className="text-gray-500">No services available in this category yet</p>
                          </div>
                        ) : (
                          selectedCategory.services.map((service) => {
                            const unifiedService = isServiceDefinition(service) ? 
                              service : 
                              { 
                                ...service,
                                basePrice: service.price,
                                baseDuration: service.duration
                              };
                            
                            return (
                              <ServiceCard 
                                key={service.id} 
                                service={unifiedService}
                                onClick={() => setSelectedService(unifiedService)}
                              />
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Trending Services */}
                    {trendingServices.length > 0 && (
                      <div className="space-y-4 mt-12">
                        <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {trendingServices.map((service) => {
                            const unifiedService = isServiceDefinition(service) ? 
                              service : 
                              { 
                                ...service,
                                basePrice: service.price,
                                baseDuration: service.duration
                              };
                            
                            return (
                              <ServiceCard 
                                key={service.id} 
                                service={unifiedService} 
                                trending 
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {filteredCategories.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No services available at the moment.</p>
            </div>
          )}
        </div>
      </div>

      <FooterNav userType={userProfile?.role === 'professional' ? 'professional' : 'client'} />
    </div>
  );
};
