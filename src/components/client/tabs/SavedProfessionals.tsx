import React from 'react';
import { Star, MapPin, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SavedProfessional {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  rating: number;
  location: string;
  specialties: string[];
}

export const SavedProfessionals = () => {
  const navigate = useNavigate();
  const professionals: SavedProfessional[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      handle: '@sarahnailart',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      rating: 4.9,
      location: 'New York, NY',
      specialties: ['Nails', 'Nail Art', 'Manicure']
    },
    {
      id: '2',
      name: 'Mike Thompson',
      handle: '@mikethestylist',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      rating: 4.8,
      location: 'Los Angeles, CA',
      specialties: ['Hair', 'Color', 'Style']
    }
  ];

  const handleRemoveProfessional = (professionalId: string) => {
    // Implement remove professional logic
    console.log('Remove professional:', professionalId);
  };

  const handleViewProfile = (professionalId: string) => {
    navigate(`/professional/${professionalId}`);
  };

  return (
    <div className="space-y-4">
      {professionals.map((professional) => (
        <div
          key={professional.id}
          className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={professional.avatar}
                  alt={professional.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {professional.name}
                  </h3>
                  <p className="text-sm text-gray-500">{professional.handle}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveProfessional(professional.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                {professional.location}
                <span className="mx-2">•</span>
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                {professional.rating}
              </div>
              
              <div className="mt-2 flex flex-wrap gap-2">
                {professional.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => handleViewProfile(professional.id)}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};