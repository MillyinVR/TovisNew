import React from 'react';
import { Trash2, Star } from 'lucide-react';

interface SavedService {
  id: string;
  title: string;
  image: string;
  provider: string;
  price: number;
  rating: number;
  duration: string;
}

export const SavedServices = () => {
  const services: SavedService[] = [
    {
      id: '1',
      title: 'Glazed Donut Nails',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371',
      provider: 'Sarah Johnson',
      price: 75,
      rating: 4.9,
      duration: '60 min'
    },
    {
      id: '2',
      title: 'Wolf Cut',
      image: 'https://images.unsplash.com/photo-1595499229753-11de491fee71',
      provider: 'Mike Thompson',
      price: 120,
      rating: 4.8,
      duration: '90 min'
    },
    {
      id: '3',
      title: 'Siren Eyes',
      image: 'https://images.unsplash.com/photo-1588367667816-ecc8f6694fe6',
      provider: 'Emma Davis',
      price: 90,
      rating: 4.7,
      duration: '45 min'
    }
  ];

  const handleRemoveService = (serviceId: string) => {
    // Implement remove service logic
    console.log('Remove service:', serviceId);
  };

  const handleBookService = (serviceId: string) => {
    // Implement booking logic
    console.log('Book service:', serviceId);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div 
            key={service.id}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-w-16 aspect-h-9 relative">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{service.title}</h3>
                  <p className="text-sm text-gray-500">by {service.provider}</p>
                </div>
                <button
                  onClick={() => handleRemoveService(service.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span>{service.rating}</span>
                <span className="mx-2">•</span>
                <span>{service.duration}</span>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  ${service.price}
                </span>
                <button
                  onClick={() => handleBookService(service.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};