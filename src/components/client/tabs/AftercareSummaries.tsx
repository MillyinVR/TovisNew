import React, { useState } from 'react';
import { AftercareSummary } from '../../../types/aftercare';
import { Appointment } from '../../../types/appointment';
import { Clock, Star, ShoppingCart, Calendar, ChevronRight, Check, AlertCircle, Loader } from 'lucide-react';
import { format } from 'date-fns';
import { useAftercare } from '../../../hooks/useAftercare';
import { useOrders } from '../../../hooks/useOrders';
import { createAppointment } from '../../../lib/api/appointments';
import { createReview } from '../../../lib/api/reviews';
import { useAuth } from '../../../contexts/AuthContext';
import { Review } from '../../../types/professional';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { ReviewModal } from './ReviewModal';

export const AftercareSummaries = () => {
  const { userProfile } = useAuth();
  const { summaries, loading: summariesLoading, error: summariesError } = useAftercare('client');
  const { placeOrder } = useOrders('client');
  const [error, setError] = useState<string | null>(null);

  const [selectedSummary, setSelectedSummary] = useState<AftercareSummary | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleCheckout = async () => {
    if (!selectedSummary || !userProfile) return;

    try {
      setError(null);
      
      const products = selectedSummary.recommendedProducts
        .filter(product => selectedProducts.includes(product.id))
        .map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        }));

      await placeOrder({
        professionalId: selectedSummary.professionalId,
        products,
        aftercareSummaryId: selectedSummary.id
      });

      setSelectedSummary(null);
      setSelectedProducts([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process checkout');
    }
  };

  const getUserData = async (userId: string) => {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    return userDoc.data();
  };

  const handleBookAppointment = async (summary: AftercareSummary) => {
    if (!userProfile) return;

    try {
      setError(null);
      
      const service = summary.services[0]; // Book for first service
      if (!service) throw new Error('No service found');

      const startTime = new Date();
      startTime.setDate(startTime.getDate() + (service.nextAppointmentRecommendation.timeframe * 7));

      // Get professional's data
      const professionalData = await getUserData(summary.professionalId);

      await createAppointment({
        clientId: userProfile.id,
        clientName: userProfile.displayName || 'Client',
        professionalId: summary.professionalId,
        professionalName: professionalData.displayName || 'Professional',
        service: service.name,
        price: service.price,
        startTime: startTime.toISOString(),
        endTime: (() => {
          const end = new Date(startTime);
          end.setHours(end.getHours() + 1); // Default 1 hour
          return end.toISOString();
        })(),
        notes: `Follow-up appointment for ${service.name} (Aftercare Summary: ${summary.id})`
      });

      setSelectedSummary(prev => prev ? { ...prev, nextAppointmentBooked: true } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment');
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!selectedSummary || !userProfile) return;

    try {
      setError(null);
      
      await createReview({
        clientId: userProfile.id,
        clientName: userProfile.displayName || 'Client',
        clientPhoto: userProfile.photoURL || undefined,
        rating,
        comment,
        service: selectedSummary.services[0]?.name || 'Service',
        images: [selectedSummary.beforeImages[0], selectedSummary.afterImages[0]],
        likes: 0,
        verified: true
      });

      setSelectedSummary(prev => prev ? { ...prev, reviewSubmitted: true } : null);
      setShowReviewModal(false);
    } catch (err) {
      throw err;
    }
  };

  if (summariesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (summariesError) {
    return (
      <div className="p-4 bg-red-50 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{summariesError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedSummary ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-semibold">Aftercare Summary</h2>
              <button
                onClick={() => setSelectedSummary(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Before & After Images */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Before</h3>
                {selectedSummary.beforeImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt="Before"
                    className="rounded-lg w-full h-48 object-cover"
                  />
                ))}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">After</h3>
                {selectedSummary.afterImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt="After"
                    className="rounded-lg w-full h-48 object-cover"
                  />
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Services Received</h3>
              {selectedSummary.services.map((service) => (
                <div key={service.id} className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-gray-500">
                      Next appointment recommended in {service.nextAppointmentRecommendation.timeframe} weeks
                    </p>
                  </div>
                  <p className="font-medium">${service.price}</p>
                </div>
              ))}
            </div>

            {/* Recommended Products */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Recommended Products</h3>
              <div className="space-y-4">
                {selectedSummary.recommendedProducts.map((product) => (
                  <div key={product.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-500">{product.description}</p>
                        </div>
                        <p className="font-medium">${product.price}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{product.usage}</p>
                      <div className="mt-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleProductSelect(product.id)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-600">Add to cart</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aftercare Instructions */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Aftercare Instructions</h3>
              <ul className="list-disc list-inside space-y-2">
                {selectedSummary.aftercareInstructions.map((instruction, index) => (
                  <li key={index} className="text-gray-600">{instruction}</li>
                ))}
              </ul>
            </div>

            {/* Professional Notes */}
            {selectedSummary.notes && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Professional Notes</h3>
                <p className="text-gray-600">{selectedSummary.notes}</p>
              </div>
            )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8">
              <div className="space-x-4">
                {selectedProducts.length > 0 && (
                  <button
                    onClick={handleCheckout}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Checkout ({selectedProducts.length})
                  </button>
                )}
                {!selectedSummary.nextAppointmentBooked && (
                  <button
                    onClick={() => handleBookAppointment(selectedSummary)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Next Appointment
                  </button>
                )}
              </div>
              {!selectedSummary.reviewSubmitted && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Leave Review
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {summaries.map((summary) => (
            <div
              key={summary.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedSummary(summary)}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">
                      {summary.services.map(s => s.name).join(', ')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(summary.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {summary.status === 'sent' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Clock className="h-3 w-3 mr-1" />
                        New
                      </span>
                    )}
                    {summary.nextAppointmentBooked && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Booked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedSummary && (
        <ReviewModal
          summary={selectedSummary}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
};
