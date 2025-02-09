import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  DollarSign,
  Eye,
  MessageSquare,
  Filter,
  Search
} from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  id: string;
  clientName: string;
  clientId: string;
  professionalName: string;
  professionalId: string;
  service: string;
  price: number;
  date: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'refunded' | 'disputed';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  notes?: string[];
  refundReason?: string;
  disputeReason?: string;
}

export const BookingsManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'BK-12345',
      clientName: 'Emma Wilson',
      clientId: 'client1',
      professionalName: 'Sarah Johnson',
      professionalId: 'prof1',
      service: 'Bridal Makeup',
      price: 250,
      date: '2024-03-15T10:30:00Z',
      status: 'confirmed',
      paymentStatus: 'paid'
    },
    {
      id: 'BK-12346',
      clientName: 'James Brown',
      clientId: 'client2',
      professionalName: 'Michael Chen',
      professionalId: 'prof2',
      service: 'Haircut & Style',
      price: 85,
      date: '2024-03-14T15:45:00Z',
      status: 'disputed',
      paymentStatus: 'paid',
      disputeReason: 'Service not as described'
    },
    {
      id: 'BK-12347',
      clientName: 'Sophie Taylor',
      clientId: 'client3',
      professionalName: 'Lisa Anderson',
      professionalId: 'prof3',
      service: 'Makeup Session',
      price: 150,
      date: '2024-03-16T14:00:00Z',
      status: 'cancelled',
      paymentStatus: 'refunded',
      refundReason: 'Professional cancelled'
    }
  ]);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddNote = () => {
    if (!selectedBooking || !newNote.trim()) return;

    const updatedBookings = bookings.map(booking =>
      booking.id === selectedBooking.id
        ? {
            ...booking,
            notes: [...(booking.notes || []), newNote.trim()]
          }
        : booking
    );

    setBookings(updatedBookings);
    setNewNote('');
  };

  const handleStatusChange = (bookingId: string, newStatus: Booking['status']) => {
    setBookings(bookings.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: newStatus }
        : booking
    ));
  };

  const handleRefund = (bookingId: string) => {
    setBookings(bookings.map(booking =>
      booking.id === bookingId
        ? { 
            ...booking, 
            status: 'refunded',
            paymentStatus: 'refunded'
          }
        : booking
    ));
  };

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'no_show':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'refunded':
        return <DollarSign className="h-5 w-5 text-purple-500" />;
      case 'disputed':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.professionalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h3 className="text-lg font-medium text-gray-900">Bookings Management</h3>
            <p className="mt-2 text-sm text-gray-700">
              Monitor and manage all bookings across the platform
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <div className="flex-1">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search bookings..."
              />
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
                <option value="refunded">Refunded</option>
                <option value="disputed">Disputed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                  Booking Details
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Service
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Date & Time
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Payment
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3">
                    <div>
                      <div className="font-medium text-gray-900">#{booking.id}</div>
                      <div className="text-sm text-gray-500">
                        {booking.clientName} → {booking.professionalName}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div>
                      <div>{booking.service}</div>
                      <div className="text-sm font-medium text-gray-900">
                        ${booking.price}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {format(new Date(booking.date), 'MMM d, yyyy')}
                      <Clock className="h-4 w-4 ml-2 mr-1 text-gray-400" />
                      {format(new Date(booking.date), 'h:mm a')}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : booking.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : booking.status === 'no_show'
                        ? 'bg-yellow-100 text-yellow-800'
                        : booking.status === 'refunded'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1 capitalize">{booking.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : booking.paymentStatus === 'refunded'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      <DollarSign className="h-3 w-3 mr-1" />
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDetailsModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {booking.status === 'disputed' && (
                        <button
                          onClick={() => handleRefund(booking.id)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <DollarSign className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Booking Details Modal */}
        {showDetailsModal && selectedBooking && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Booking Details</h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedBooking(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Booking ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">#{selectedBooking.id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Service</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedBooking.service}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Client</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedBooking.clientName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Professional</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedBooking.professionalName}</dd>
                    </div>
                  </dl>
                </div>

                {/* Status Information */}
                {(selectedBooking.status === 'disputed' || selectedBooking.status === 'cancelled') && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                      {selectedBooking.status === 'disputed' ? 'Dispute Reason' : 'Cancellation Reason'}
                    </h4>
                    <p className="text-sm text-red-700">
                      {selectedBooking.disputeReason || selectedBooking.refundReason}
                    </p>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Admin Notes</h4>
                  <div className="space-y-2">
                    {selectedBooking.notes?.map((note, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">{note}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      rows={2}
                    />
                    <button
                      onClick={handleAddNote}
                      className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Add Note
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end space-x-3">
                  {selectedBooking.status === 'disputed' && (
                    <button
                      onClick={() => handleRefund(selectedBooking.id)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Process Refund
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedBooking(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};