import React from 'react';
import { Trash2 } from 'lucide-react';

interface SavedTrend {
  id: string;
  title: string;
  image: string;
}

export const SavedTrends = () => {
  const trends: SavedTrend[] = [
    {
      id: '1',
      title: 'Glazed Donut Nails',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371',
    },
    {
      id: '2',
      title: 'Wolf Cut',
      image: 'https://images.unsplash.com/photo-1595499229753-11de491fee71',
    },
    {
      id: '3',
      title: 'Siren Eyes',
      image: 'https://images.unsplash.com/photo-1588367667816-ecc8f6694fe6',
    }
  ];

  const handleRemoveTrend = (trendId: string) => {
    // Implement remove trend logic
    console.log('Remove trend:', trendId);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {trends.map((trend) => (
          <div 
            key={trend.id}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-w-16 aspect-h-9 relative">
              <img
                src={trend.image}
                alt={trend.title}
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="p-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">{trend.title}</h3>
              <button
                onClick={() => handleRemoveTrend(trend.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};