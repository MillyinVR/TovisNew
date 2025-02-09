import React from 'react';
import { Star, Heart, MessageSquare } from 'lucide-react';

export const ReviewsTab = () => {
  // Mock data - In production, fetch from your backend
  const reviews = [
    {
      id: '1',
      clientName: 'Sarah Johnson',
      clientPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      rating: 5,
      comment: 'Amazing work! Exactly what I wanted for my wedding day.',
      service: 'Bridal Makeup',
      date: '2024-03-15',
      likes: 24,
      replies: 2,
      images: [
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f'
      ]
    },
    // Add more reviews as needed
  ];

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Client Reviews</h2>
            <p className="text-sm text-gray-500">Manage and respond to your client reviews</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">Overall Rating:</div>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="ml-1 font-medium text-gray-900">4.9</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start space-x-4">
              <img
                src={review.clientPhoto}
                alt={review.clientName}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{review.clientName}</h3>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-500">{review.service}</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-gray-600">{review.comment}</p>
                {review.images && review.images.length > 0 && (
                  <div className="mt-3 flex space-x-2">
                    {review.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Review ${index + 1}`}
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
                <div className="mt-4 flex items-center space-x-4">
                  <button className="flex items-center text-gray-500 hover:text-gray-700">
                    <Heart className="h-4 w-4 mr-1" />
                    <span className="text-sm">{review.likes}</span>
                  </button>
                  <button className="flex items-center text-gray-500 hover:text-gray-700">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span className="text-sm">{review.replies} replies</span>
                  </button>
                  <button className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};