import React, { useState } from 'react';
import { X, Check, X as XIcon, User } from 'lucide-react';
import { ClientProfileModal } from './ClientProfileModal';

interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  service: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

// Mock data for client profiles
const mockClientData = {
  pastServices: [
    {
      id: '1',
      date: '2024-01-15',
      service: 'Hair Coloring',
      professional: 'Emma Thompson',
      notes: 'Client prefers natural looking highlights'
    },
    {
      id: '2',
      date: '2024-01-01',
      service: 'Makeup',
      professional: 'Sarah Wilson',
      notes: 'Allergic to certain brands, check notes before service'
    }
  ],
  ratings: [
    {
      id: '1',
      rating: 5,
      comment: 'Great client, always on time',
      professional: 'Emma Thompson',
      date: '2024-01-15'
    },
    {
      id: '2',
      rating: 4,
      comment: 'Pleasant to work with',
      professional: 'Sarah Wilson',
      date: '2024-01-01'
    }
  ],
  averageRating: 4.5
};

interface BookingsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  bookings: Booking[];
  type: 'today' | 'pending';
  onApprove?: (bookingId: string) => void;
  onDeny?: (bookingId: string) => void;
}

export const BookingsListModal: React.FC<BookingsListModalProps> = ({
  isOpen,
  onClose,
  title,
  bookings,
  type,
  onApprove = () => {},
  onDeny = () => {}
}) => {
  const [selectedClient, setSelectedClient] = useState<{
    id: string;
    name: string;
  } | null>(null);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between pb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mt-2 space-y-4">
              {bookings.length === 0 ? (
                <p className="text-center text-gray-500">No bookings to display</p>
              ) : (
                bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <button
                          onClick={() => setSelectedClient({ id: booking.clientId, name: booking.clientName })}
                          className="group flex items-center"
                        >
                          <h4 className="font-medium text-gray-900 group-hover:text-indigo-600 flex items-center">
                            {booking.clientName}
                            <User className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-100 text-gray-400" />
                          </h4>
                        </button>
                        <p className="text-sm text-gray-500">{booking.service}</p>
                        <p className="text-sm text-gray-500">{booking.time}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {type === 'pending' && (
                          <>
                            <button
                              onClick={() => onApprove(booking.id)}
                              className="inline-flex items-center rounded-full p-1 text-green-600 hover:bg-green-50"
                              title="Approve Request"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => onDeny(booking.id)}
                              className="inline-flex items-center rounded-full p-1 text-red-600 hover:bg-red-50"
                              title="Deny Request"
                            >
                              <XIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
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

      {/* Client Profile Modal */}
      {selectedClient && (
        <ClientProfileModal
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
          clientId={selectedClient.id}
          clientName={selectedClient.name}
          pastServices={mockClientData.pastServices}
          ratings={mockClientData.ratings}
          averageRating={mockClientData.averageRating}
        />
      )}
    </div>
  );
};
