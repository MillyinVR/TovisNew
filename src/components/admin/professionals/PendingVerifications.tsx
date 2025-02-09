import React, { useState, useEffect } from 'react';
import { verificationRef, db } from '../../../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText,
  AlertTriangle,
  Clock,
  Calendar,
  Download
} from 'lucide-react';
import { ProfessionalVerification, VerificationDocument } from '../../../types/professional';

interface PendingVerificationsProps {
  compact?: boolean;
}

export const PendingVerifications: React.FC<PendingVerificationsProps> = ({ compact = false }) => {
  const [verifications, setVerifications] = useState<ProfessionalVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      verificationRef,
      where('verificationStatus', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const newVerifications: ProfessionalVerification[] = [];
        snapshot.forEach((doc) => {
          newVerifications.push(doc.data() as ProfessionalVerification);
        });
        setVerifications(newVerifications);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching verifications:', error);
        setError('Failed to load verifications');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const [selectedVerification, setSelectedVerification] = useState<ProfessionalVerification | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<VerificationDocument | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const handleViewDocument = (document: VerificationDocument) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  const handleApprove = async (userId: string) => {
    try {
      setLoading(true);
      const verificationDocRef = doc(verificationRef, userId);
      await updateDoc(verificationDocRef, {
        verificationStatus: 'verified',
        reviewDate: new Date().toISOString(),
        reviewedBy: 'admin' // TODO: Replace with actual admin ID
      });

      // Update user's profile to reflect verified status
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        'professionalProfile.verification.status': 'verified',
        'professionalProfile.verification.verifiedDate': new Date().toISOString(),
        'professionalProfile.status': 'verified',
        'role': 'professional'
      });
    } catch (error) {
      console.error('Error approving verification:', error);
      setError('Failed to approve verification');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (userId: string, reason: string) => {
    try {
      setLoading(true);
      const verificationDocRef = doc(verificationRef, userId);
      await updateDoc(verificationDocRef, {
        verificationStatus: 'rejected',
        rejectionReason: reason,
        reviewDate: new Date().toISOString(),
        reviewedBy: 'admin' // TODO: Replace with actual admin ID
      });

      // Update user's profile to reflect rejected status
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        'professionalProfile.verification.status': 'rejected',
        'professionalProfile.verification.rejectionReason': reason
      });
    } catch (error) {
      console.error('Error rejecting verification:', error);
      setError('Failed to reject verification');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2">Loading verifications...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-red-600 flex items-center justify-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Applications</h3>
        <div className="space-y-4">
          {verifications.slice(0, 3).map((verification) => (
            <div key={verification.userId} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{verification.name}</p>
                <p className="text-sm text-gray-500">{verification.professionalType.replace('_', ' ')}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedVerification(verification);
                    setShowDetailsModal(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => handleApprove(verification.userId)}
                  className="text-green-600 hover:text-green-900"
                >
                  <CheckCircle className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => handleReject(verification.userId, 'Documents incomplete')}
                  className="text-red-600 hover:text-red-900"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Pending Verifications</h2>
            <p className="text-sm text-gray-500">Review and verify professional credentials</p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            {verifications.filter(v => v.verificationStatus === 'pending').length} Pending
          </span>
        </div>

        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                  Professional Type
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Submission Date
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
              {verifications.map((verification) => (
                <tr key={verification.userId}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                    <div className="font-medium text-gray-900">{verification.name}</div>
                    <div className="text-gray-500">{verification.email}</div>
                    <div className="text-gray-500 mt-1">
                      {verification.professionalType.replace('_', ' ').toUpperCase()}
                      {verification.licenseNumber && (
                        <span className="ml-2">License: {verification.licenseNumber}</span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      {new Date(verification.submissionDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-2">
                      {verification.documents?.map((doc, index) => (
                        <button
                          key={index}
                          onClick={() => handleViewDocument(doc)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 rounded text-xs font-medium bg-white hover:bg-gray-50"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          {doc.type}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedVerification(verification);
                          setShowDetailsModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleApprove(verification.userId)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleReject(verification.userId, 'Documents incomplete')}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Details Modal */}
      {showDetailsModal && selectedVerification && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Verification Details</h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedVerification(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Professional Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-900">Professional Information</h4>
                <dl className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {selectedVerification.professionalType.replace('_', ' ').toUpperCase()}
                    </dd>
                  </div>
                  {selectedVerification.licenseNumber && (
                    <>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">License Number</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {selectedVerification.licenseNumber}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">State</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {selectedVerification.licenseState}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Expiration</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {selectedVerification.licenseExpirationDate}
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>

              {/* Document Preview */}
              <div>
                <h4 className="text-sm font-medium text-gray-900">Documents</h4>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  {selectedVerification.licenseImageUrl && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">License</p>
                      <img
                        src={selectedVerification.licenseImageUrl}
                        alt="License"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">ID</p>
                    <img
                      src={selectedVerification.identificationImageUrl}
                      alt="ID"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    handleReject(selectedVerification.userId, 'Documents incomplete');
                    setShowDetailsModal(false);
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    handleApprove(selectedVerification.userId);
                    setShowDetailsModal(false);
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="aspect-[16/9] bg-gray-100 rounded-lg flex items-center justify-center">
              {selectedDocument.url.endsWith('.pdf') ? (
                <div className="text-center">
                  <Download className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">Click to download PDF</p>
                  <a
                    href={selectedDocument.url}
                    download
                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Download Document
                  </a>
                </div>
              ) : (
                <img
                  src={selectedDocument.url}
                  alt={selectedDocument.name}
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
