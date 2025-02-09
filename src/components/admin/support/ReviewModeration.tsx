import React, { useState } from 'react';
import { Star, Flag, CheckCircle, XCircle } from 'lucide-react';

interface Review {
  id: string;
  clientName: string;
  professionalName: string;
  service: string;
  rating: number;
  content: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  flagged: boolean;
  flagReason?: string;
}

export const ReviewModeration = () => {
  const [reviews] = useState<Review[]>([
    {
      id: '1',
      clientName: 'Emma Wilson',
      professionalName: 'Sarah Johnson',
      service: 'Bridal Makeup',
      rating: 4,
      content: 'Great service, very professional!',
      date: '2024-03-15T10:30:00Z',
      status: 'pending',
      flagged: false
    },
    {
      id: '2',
      clientName: 'James Brown',
      professionalName: 'Michael Chen',
      service: 'Haircut',
      rating: 2,
      content: 'Not satisfied with the service.',
      date: '2024-03-14T15:45:00Z',
      status: 'pending',
      flagged: true,
      flagReason: 'Inappropriate content'
    }
  ]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Review Moderation</h3>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{review.clientName}</h4>
                <p className="text-sm text-gray-500">{review.service}</p>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {review.flagged && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <Flag className="h-3 w-3 mr-1" />
                  Flagged
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-600">{review.content}</p>
            {review.flagReason && (
              <p className="mt-2 text-sm text-red-600">
                Flag reason: {review.flagReason}
              </p>
            )}
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {new Date(review.date).toLocaleDateString()}
              </span>
              <div className="flex space-x-2">
                <button className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </button>
                <button className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700">
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};