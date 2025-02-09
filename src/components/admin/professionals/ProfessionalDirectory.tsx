import React, { useState } from 'react';
import { 
  Search, 
  Filter,
  Star,
  MapPin,
  Calendar,
  Mail,
  Phone,
  MoreVertical,
  Shield,
  Ban,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { useAdminProfessionals, Professional } from '../../../hooks/useAdminProfessionals';

export const ProfessionalDirectory = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { professionals, loading, error } = useAdminProfessionals(filterStatus);

  // Filter professionals based on search term
  const filteredProfessionals = professionals.filter(professional => 
    professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-700">Error loading professionals: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Professional Directory</h2>
            <p className="text-sm text-gray-500">Manage and monitor professional accounts</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-6">
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
                placeholder="Search professionals..."
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
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Professionals List */}
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                  Professional
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Location
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Rating
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Bookings
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredProfessionals.map((professional) => (
                <tr key={professional.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={professional.photo}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{professional.name}</div>
                        <div className="text-gray-500">{professional.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      {professional.location}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span>{professional.rating}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      professional.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : professional.status === 'suspended'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {professional.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {professional.totalBookings}
                    </div>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      onClick={() => {
                        setSelectedProfessional(professional);
                        setShowDetailsModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Professional Details Modal */}
      {showDetailsModal && selectedProfessional && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Professional Details</h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedProfessional(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic Information */}
              <div className="flex items-center space-x-4">
                <img
                  src={selectedProfessional.photo}
                  alt=""
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {selectedProfessional.name}
                  </h4>
                  <p className="text-sm text-gray-500">{selectedProfessional.type}</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Mail className="h-4 w-4 mr-2" />
                    {selectedProfessional.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <Phone className="h-4 w-4 mr-2" />
                    {selectedProfessional.phone}
                  </div>
                </div>
                <div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    Joined: {new Date(selectedProfessional.joinDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    {selectedProfessional.location}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </button>
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <Shield className="h-4 w-4 mr-2" />
                  Verify
                </button>
                <button className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                  <Ban className="h-4 w-4 mr-2" />
                  Suspend
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
