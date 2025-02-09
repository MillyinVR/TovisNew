import React, { useState } from 'react';
import { Star, Image as ImageIcon, Send, ThumbsUp, MessageSquare, Edit2, Trash2, X } from 'lucide-react';

interface Review {
  id: string;
  userId: string;
  professionalId: string;
  professionalName: string;
  serviceId: string;
  serviceName: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  likes: number;
  response?: {
    text: string;
    createdAt: string;
  };
}

export const ReviewSystem = () => {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      userId: 'user1',
      professionalId: 'prof1',
      professionalName: 'Sarah Johnson',
      serviceId: 'service1',
      serviceName: 'Bridal Makeup',
      rating: 5,
      comment: 'Amazing service! Sarah was professional and made me feel beautiful on my special day.',
      images: [
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f',
        'https://images.unsplash.com/photo-1503236823255-94609f598e71'
      ],
      createdAt: '2024-03-15T10:00:00Z',
      likes: 12,
      response: {
        text: 'Thank you so much for your kind words! It was a pleasure working with you.',
        createdAt: '2024-03-15T12:00:00Z'
      }
    }
  ]);

  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingReview) {
      setReviews(reviews.map(review =>
        review.id === editingReview.id
          ? {
              ...review,
              rating: selectedRating,
              comment: reviewText
            }
          : review
      ));
    } else {
      const newReview: Review = {
        id: Date.now().toString(),
        userId: 'currentUserId',
        professionalId: 'professionalId',
        professionalName: 'Professional Name',
        serviceId: 'serviceId',
        serviceName: 'Service Name',
        rating: selectedRating,
        comment: reviewText,
        createdAt: new Date().toISOString(),
        likes: 0
      };
      setReviews([...reviews, newReview]);
    }

    setSelectedRating(0);
    setReviewText('');
    setSelectedImages([]);
    setEditingReview(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  const handleLikeReview = (reviewId: string) => {
    setReviews(reviews.map(review =>
      review.id === reviewId
        ? { ...review, likes: review.likes + 1 }
        : review
    ));
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews(reviews.filter(review => review.id !== reviewId));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Review Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {editingReview ? 'Edit Review' : 'Write a Review'}
        </h3>
        <form onSubmit={handleSubmitReview} className="space-y-4">
          {/* Rating Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setSelectedRating(rating)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      rating <= selectedRating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              id="review"
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Share your experience..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Photos
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="images" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Upload images</span>
                    <input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            {editingReview && (
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {editingReview ? 'Update Review' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  {review.serviceName}
                </h4>
                <p className="text-sm text-gray-500">
                  by {review.professionalName}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingReview(review);
                    setSelectedRating(review.rating);
                    setReviewText(review.comment);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteReview(review.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-2 flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= review.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>

            <p className="mt-4 text-gray-600">{review.comment}</p>

            {review.images && review.images.length > 0 && (
              <div className="mt-4 flex space-x-2">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review ${index + 1}`}
                    className="h-24 w-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center space-x-4">
              <button
                onClick={() => handleLikeReview(review.id)}
                className="flex items-center text-gray-400 hover:text-gray-500"
              >
                <ThumbsUp className="h-5 w-5 mr-1" />
                <span className="text-sm">{review.likes}</span>
              </button>
              <button className="flex items-center text-gray-400 hover:text-gray-500">
                <MessageSquare className="h-5 w-5 mr-1" />
                <span className="text-sm">Reply</span>
              </button>
            </div>

            {review.response && (
              <div className="mt-4 pl-4 border-l-4 border-gray-200">
                <p className="text-sm text-gray-600">{review.response.text}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Responded on {new Date(review.response.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};