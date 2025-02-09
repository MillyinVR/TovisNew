import React, { useState } from 'react';
import { 
  AlertTriangle, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowUp, 
  Eye, 
  FileText,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';

interface Complaint {
  id: string;
  clientName: string;
  professionalName: string;
  service: string;
  bookingId: string;
  date: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated';
  priority: 'low' | 'medium' | 'high';
  description: string;
  category: string;
  resolution?: string;
  notes?: string[];
  attachments?: string[];
}

interface ComplaintNote {
  id: string;
  text: string;
  adminName: string;
  date: string;
}

export const ComplaintsManagement = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: '1',
      clientName: 'Emma Wilson',
      professionalName: 'Sarah Johnson',
      service: 'Bridal Makeup',
      bookingId: 'BK-12345',
      date: '2024-03-15T10:30:00Z',
      status: 'pending',
      priority: 'high',
      description: 'Service not as described, requesting refund',
      category: 'Service Quality',
      notes: [
        'Initial contact made with client',
        'Professional response requested'
      ],
      attachments: ['photo1.jpg', 'receipt.pdf']
    },
    {
      id: '2',
      clientName: 'James Brown',
      professionalName: 'Michael Chen',
      service: 'Haircut',
      bookingId: 'BK-12346',
      date: '2024-03-14T15:45:00Z',
      status: 'in_progress',
      priority: 'medium',
      description: 'Appointment started 30 minutes late',
      category: 'Scheduling',
      notes: ['Professional provided explanation for delay']
    }
  ]);

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [resolution, setResolution] = useState('');

  const handleStatusChange = (complaintId: string, newStatus: Complaint['status']) => {
    setComplaints(complaints.map(complaint => 
      complaint.id === complaintId 
        ? { ...complaint, status: newStatus }
        : complaint
    ));
  };

  const handleAddNote = () => {
    if (!selectedComplaint || !newNote.trim()) return;

    const updatedComplaints = complaints.map(complaint =>
      complaint.id === selectedComplaint.id
        ? {
            ...complaint,
            notes: [...(complaint.notes || []), newNote.trim()]
          }
        : complaint
    );

    setComplaints(updatedComplaints);
    setNewNote('');
  };

  const handleResolveComplaint = () => {
    if (!selectedComplaint || !resolution.trim()) return;

    const updatedComplaints = complaints.map(complaint =>
      complaint.id === selectedComplaint.id
        ? {
            ...complaint,
            status: 'resolved',
            resolution: resolution.trim()
          }
        : complaint
    );

    setComplaints(updatedComplaints);
    setShowDetailsModal(false);
    setResolution('');
  };

  const getStatusIcon = (status: Complaint['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'in_progress':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'escalated':
        return <ArrowUp className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h3 className="text-lg font-medium text-gray-900">Complaints Management</h3>
            <p className="mt-2 text-sm text-gray-700">
              Handle and resolve customer complaints efficiently
            </p>
          </div>
        </div>

        {/* Complaints List */}
        <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                  Details
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Service
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Category
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Priority
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {complaints.map((complaint) => (
                <tr key={complaint.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {complaint.clientName} → {complaint.professionalName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(complaint.date), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div>
                      <div>{complaint.service}</div>
                      <div className="text-xs text-gray-400">#{complaint.bookingId}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {complaint.category}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      complaint.status === 'resolved'
                        ? 'bg-green-100 text-green-800'
                        : complaint.status === 'escalated'
                        ? 'bg-red-100 text-red-800'
                        : complaint.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getStatusIcon(complaint.status)}
                      <span className="ml-1 capitalize">{complaint.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      complaint.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : complaint.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {complaint.priority}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setShowDetailsModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {complaint.status !== 'resolved' && (
                        <button
                          onClick={() => handleStatusChange(complaint.id, 'escalated')}
                          className="text-red-600 hover:text-red-900"
                        >
                          <ArrowUp className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Complaint Details Modal */}
        {showDetailsModal && selectedComplaint && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Complaint Details</h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedComplaint(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Complaint Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedComplaint.description}</p>
                </div>

                {/* Attachments */}
                {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments</h4>
                    <div className="flex space-x-2">
                      {selectedComplaint.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center px-3 py-2 bg-gray-100 rounded-lg"
                        >
                          <FileText className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-600">{attachment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                  <div className="space-y-2">
                    {selectedComplaint.notes?.map((note, index) => (
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

                {/* Resolution */}
                {selectedComplaint.status !== 'resolved' && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Resolution</h4>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Enter resolution details..."
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      rows={3}
                    />
                    <div className="mt-4 flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                          setSelectedComplaint(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleResolveComplaint}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        Resolve Complaint
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};