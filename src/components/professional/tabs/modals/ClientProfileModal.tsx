import React from 'react';
import { X, Star, MessageSquare } from 'lucide-react';

interface PastService {
  id: string;
  date: string;
  service: string;
  professional: string;
  notes?: string;
}

interface ClientRating {
  id: string;
  rating: number;
  comment: string;
  professional: string;
  date: string;
}

interface ClientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  // Mock data - in real app would be fetched from API
  pastServices: PastService[];
  ratings: ClientRating[];
  averageRating: number;
}

export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({
  isOpen,
  onClose,
  clientName,
  pastServices,
  ratings,
  averageRating
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="text-2xl font-medium leading-6 text-gray-900">{clientName}'s Profile</h3>
                <div className="mt-2 flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.round(averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {averageRating.toFixed(1)} ({ratings.length} ratings)
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Past Services */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Past Services</h4>
                <div className="space-y-4">
                  {pastServices.map((service) => (
                    <div
                      key={service.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">{service.service}</h5>
                          <p className="text-sm text-gray-500">with {service.professional}</p>
                          <p className="text-sm text-gray-500">{service.date}</p>
                        </div>
                      </div>
                      {service.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p className="font-medium">Notes:</p>
                          <p>{service.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Ratings */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Professional Ratings</h4>
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <div
                      key={rating.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          {rating.professional}
                        </span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < rating.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{rating.comment}</p>
                      <p className="mt-1 text-xs text-gray-500">{rating.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
