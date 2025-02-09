import React, { useState } from 'react';
import { TrendingUp, Star, Users, Clock, Plus, X } from 'lucide-react';

interface TrendingService {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  growth: number;
  views: string;
}

const trendingServices: TrendingService[] = [
  {
    id: "chrome-girl-nails",
    title: "Chrome Girl Nails",
    description: "3D chrome powder with iridescent finish, trending on social media",
    category: "Nails",
    difficulty: "Intermediate",
    growth: 92,
    views: "4.2M"
  },
  {
    id: "velvet-glazed-nails",
    title: "Velvet Glazed Nails",
    description: "Soft matte finish with velvet-like texture and glazed overlay",
    category: "Nails",
    difficulty: "Advanced",
    growth: 78,
    views: "3.1M"
  },
  {
    id: "butterfly-bob-haircut",
    title: "Butterfly Bob Haircut",
    description: "Layered bob with face-framing pieces, inspired by butterfly wings",
    category: "Hair Cut",
    difficulty: "Intermediate",
    growth: 65,
    views: "2.8M"
  },
  {
    id: "glazed-donut-skin",
    title: "Glazed Donut Skin",
    description: "Dewy, glossy skin finish with a radiant glow",
    category: "Makeup",
    difficulty: "Beginner",
    growth: 88,
    views: "5.6M"
  },
  {
    id: "korean-cloud-skin",
    title: "Korean Cloud Skin",
    description: "Soft, diffused complexion with a matte-meets-dewy finish",
    category: "Makeup",
    difficulty: "Intermediate",
    growth: 72,
    views: "3.9M"
  }
];

export const TrendingServicesTab = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [addedServices, setAddedServices] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedService, setSelectedService] = useState<TrendingService | null>(null);

  const filteredServices = activeCategory === 'all'
    ? trendingServices
    : trendingServices.filter(service => service.category.toLowerCase() === activeCategory.toLowerCase());

  const handleAddService = (service: TrendingService) => {
    setSelectedService(service);
    setShowAddModal(true);
  };

  const confirmAddService = () => {
    if (selectedService) {
      setAddedServices(prev => [...prev, selectedService.id]);
      setShowAddModal(false);
      setSelectedService(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['all', 'nails', 'hair cut', 'makeup', 'skincare'].map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              activeCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  service.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                  service.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {service.difficulty}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +{service.growth}%
                  </span>
                  <span className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    {service.views}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => handleAddService(service)}
                  disabled={addedServices.includes(service.id)}
                  className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                    addedServices.includes(service.id)
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {addedServices.includes(service.id) ? (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Added to Services
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Services
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Service Modal */}
      {showAddModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Add Service</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedService(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to add {selectedService.title} to your services?
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Market Growth</span>
                <span className="text-green-600 font-medium">+{selectedService.growth}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Current Views</span>
                <span className="text-gray-900 font-medium">{selectedService.views}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedService(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddService}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};