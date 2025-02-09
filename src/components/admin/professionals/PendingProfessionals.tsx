import React, { useState } from 'react';
import { Check, X, Eye, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Document {
  type: string;
  url: string;
  name: string;
}

interface Professional {
  id: string;
  name: string;
  email: string;
  type: string;
  submittedAt: string;
  documents: Document[];
  status: 'pending';
  licenseExpiration?: string;
}

interface PendingProfessionalsProps {
  compact?: boolean;
}

export const PendingProfessionals: React.FC<PendingProfessionalsProps> = ({ compact = false }) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Mock data - In production, fetch from your backend
  const professionals: Professional[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      type: 'Makeup Artist',
      submittedAt: '2024-03-15T10:30:00Z',
      licenseExpiration: '2025-03-15',
      documents: [
        {
          type: 'ID',
          url: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
          name: 'Government ID'
        },
        {
          type: 'Portfolio',
          url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f',
          name: 'Portfolio Sample'
        },
        {
          type: 'Certification',
          url: 'https://images.unsplash.com/photo-1503236823255-94609f598e71',
          name: 'Professional Certificate'
        }
      ],
      status: 'pending'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.c@example.com',
      type: 'Cosmetologist',
      submittedAt: '2024-03-14T15:45:00Z',
      licenseExpiration: '2025-06-20',
      documents: [
        {
          type: 'License',
          url: 'https://images.unsplash.com/photo-1512314889357-e157c22f938d',
          name: 'Professional License'
        },
        {
          type: 'ID',
          url: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
          name: 'Government ID'
        },
        {
          type: 'Insurance',
          url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c',
          name: 'Insurance Document'
        }
      ],
      status: 'pending'
    }
  ];

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  const handleApprove = (professionalId: string) => {
    // In production, implement approval logic
    console.log('Approving professional:', professionalId);
  };

  const handleReject = (professionalId: string) => {
    // In production, implement rejection logic
    console.log('Rejecting professional:', professionalId);
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Professional Applications</h3>
        <div className="space-y-4">
          {professionals.slice(0, 3).map((professional) => (
            <div key={professional.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{professional.name}</p>
                <p className="text-sm text-gray-500">{professional.type}</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleApprove(professional.id)}
                  className="p-1 text-green-600 hover:text-green-700"
                >
                  <Check className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => handleReject(professional.id)}
                  className="p-1 text-red-600 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h3 className="text-lg font-medium text-gray-900">Pending Professional Applications</h3>
            <p className="mt-2 text-sm text-gray-700">
              Review and approve professional applications
            </p>
          </div>
        </div>
        
        <div className="mt-6 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                  Professional
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Type
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Submitted
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  License Expiration
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Documents
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {professionals.map((professional) => (
                <tr key={professional.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3">
                    <div>
                      <div className="font-medium text-gray-900">{professional.name}</div>
                      <div className="text-gray-500">{professional.email}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {professional.type}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {format(new Date(professional.submittedAt), 'MMM d, yyyy')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {professional.licenseExpiration && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(professional.licenseExpiration), 'MMM d, yyyy')}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex space-x-2">
                      {professional.documents.map((doc, index) => (
                        <button
                          key={index}
                          onClick={() => handleViewDocument(doc)}
                          className="inline-flex items-center px-2.5 py-1.5 rounded text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          {doc.type}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleApprove(professional.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleReject(professional.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Preview Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedDocument.name}
              </h3>
              <button
                onClick={() => {
                  setShowDocumentModal(false);
                  setSelectedDocument(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative aspect-[16/9]">
              <img
                src={selectedDocument.url}
                alt={selectedDocument.name}
                className="absolute inset-0 w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};