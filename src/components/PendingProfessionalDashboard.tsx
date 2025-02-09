import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { verificationDocsRef, verificationRef, storage } from '../lib/firebase';
import { uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { FileUpload } from './shared/FileUpload';
import { 
  PROFESSIONAL_TYPES,
  MAKEUP_ARTIST_VERIFICATION_TYPES,
  US_STATES,
  ProfessionalType,
  MakeupArtistVerificationType,
  ProfessionalVerification,
  VerificationStatus
} from '../types/professional';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Instagram,
  LogOut,
  BookOpen,
  Sparkles,
  Share2,
  FileText,
  X,
  Maximize2
} from 'lucide-react';

export const PendingProfessionalDashboard = () => {
  const { userProfile, updateUserProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isEditingVerification, setIsEditingVerification] = useState(false);
  const [verificationData, setVerificationData] = useState<Partial<ProfessionalVerification>>({
    userId: userProfile?.uid || '',
    professionalType: userProfile?.professionalProfile?.professionalType || 'makeup_artist',
    licenseState: '',
    licenseNumber: '',
    licenseExpirationDate: '',
    verificationTypeOne: 'union_card',
    verificationTypeTwo: 'editorial_credit',
    verificationStatus: 'pending'
  });

  const [hasSubmittedDocuments, setHasSubmittedDocuments] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    displayName: userProfile?.displayName || '',
    bio: userProfile?.professionalProfile?.bio || '',
    location: userProfile?.location as string || '',
    phone: userProfile?.phoneNumber || '',
    email: userProfile?.email || '',
    website: userProfile?.professionalProfile?.website || '',
    instagram: userProfile?.professionalProfile?.socialMedia?.instagram || '',
    tiktok: userProfile?.professionalProfile?.socialMedia?.tiktok || ''
  });

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userProfile?.uid) return;

    // Check if user has already submitted documents
    const checkSubmission = async () => {
      const verificationDoc = doc(verificationRef, userProfile.uid);
      const docSnap = await getDoc(verificationDoc);
      if (docSnap.exists()) {
        const data = docSnap.data() as ProfessionalVerification;
        setVerificationData(data);
        setHasSubmittedDocuments(true);
      }
    };

    checkSubmission();
  }, [userProfile?.uid]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    
    // Common fields
    if (!verificationData.professionalType) {
      errors.professionalType = 'Professional type is required';
    }

    // License fields for non-makeup artists
    if (verificationData.professionalType !== 'makeup_artist') {
      if (!verificationData.licenseState) {
        errors.licenseState = 'License state is required';
      }
      if (!verificationData.licenseNumber) {
        errors.licenseNumber = 'License number is required';
      }
      if (!verificationData.licenseExpirationDate) {
        errors.licenseExpirationDate = 'License expiration date is required';
      }
      if (!verificationData.documents?.some(doc => doc.type === 'license')) {
        errors.license = 'License document is required';
      }
    }

    // Makeup artist verification fields
    if (verificationData.professionalType === 'makeup_artist') {
      if (!verificationData.verificationTypeOne) {
        errors.verificationTypeOne = 'First verification type is required';
      }
      if (!verificationData.verificationTypeTwo) {
        errors.verificationTypeTwo = 'Second verification type is required';
      }
      if (!verificationData.documents?.some(doc => doc.type === 'verification')) {
        errors.verification = 'Verification document is required';
      }
    }

    // Government ID is required for all
    if (!verificationData.documents?.some(doc => doc.type === 'government_id')) {
      errors.government_id = 'Government ID is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (field: string, value: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
    setVerificationData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (file: File, docType: string): Promise<string | undefined> => {
    if (!userProfile?.uid) {
      setError('User not authenticated. Please log in again.');
      return undefined;
    }
    
    try {
      setLoading(true);
      setError('');
      setFieldErrors(prev => ({ ...prev, [docType]: '' }));
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return undefined;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('File must be an image (JPEG, PNG) or PDF');
        return undefined;
      }

      // Check if user has pending role
      if (userProfile.role !== 'pending_professional' && userProfile.role !== 'professional') {
        setError('You must be registered as a professional to upload verification documents');
        return undefined;
      }

      const storageRef = verificationDocsRef(userProfile.uid, docType);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      // Show success message
      const docTypeDisplay = {
        'license': 'License',
        'government_id': 'Government ID',
        'verification_one': 'First verification document',
        'verification_two': 'Second verification document'
      }[docType] || 'Document';
      
      alert(`${docTypeDisplay} uploaded successfully`);
      
      // Update verification data with new document URL
      const updatedDocs = [...(verificationData.documents || [])];
      const existingDocIndex = updatedDocs.findIndex(doc => doc.type === docType);
      
      if (existingDocIndex !== -1) {
        updatedDocs[existingDocIndex] = {
          type: docType,
          url: downloadUrl,
          name: file.name
        };
      } else {
        updatedDocs.push({
          type: docType,
          url: downloadUrl,
          name: file.name
        });
      }
      
      setVerificationData(prev => ({
        ...prev,
        documents: updatedDocs
      }));

      return downloadUrl || undefined;
    } catch (error) {
      console.error('Failed to upload file:', error);
      if (error instanceof Error) {
        if (error.message.includes('storage/unauthorized')) {
          setError('You do not have permission to upload files. Please ensure you are logged in with the correct account.');
        } else if (error.message.includes('storage/quota-exceeded')) {
          setError('Storage quota exceeded. Please contact support.');
        } else {
          setError(`Failed to upload file: ${error.message}`);
        }
      } else {
        setError('Failed to upload file. Please try again.');
      }
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.uid) return;

    if (!validateForm()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setFieldErrors({});
      
      // Create verification document in Firestore
      const verificationDoc = {
        ...verificationData,
        userId: userProfile.uid,
        name: userProfile.displayName || '',
        email: userProfile.email || '',
        submissionDate: new Date().toISOString(),
        verificationStatus: 'pending' as const
      };

      await setDoc(doc(verificationRef, userProfile.uid), verificationDoc);

      // Update user profile
      await updateUserProfile({
        professionalProfile: {
          ...userProfile?.professionalProfile,
          professionalType: verificationData.professionalType,
          licenseState: verificationData.licenseState,
          licenseNumber: verificationData.licenseNumber,
          licenseExpirationDate: verificationData.licenseExpirationDate,
          verificationTypeOne: verificationData.verificationTypeOne,
          verificationTypeTwo: verificationData.verificationTypeTwo,
          submissionDate: new Date().toISOString()
        }
      });

      setIsEditingVerification(false);
      alert('Verification information and documents updated successfully. An admin will review your submission.');
    } catch (error) {
      console.error('Failed to update verification:', error);
      setError('Failed to update verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      await updateUserProfile({
        displayName: profileData.displayName,
        phoneNumber: profileData.phone,
        email: profileData.email,
        location: profileData.location,
        professionalProfile: {
          bio: profileData.bio,
          website: profileData.website,
          socialMedia: {
            instagram: profileData.instagram,
            tiktok: profileData.tiktok
          }
        }
      });
      setIsEditingProfile(false);
      alert('Profile updated successfully.');
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Status Card with Logout */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="sm:flex sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {hasSubmittedDocuments ? (
                      <>Verification Status: Pending</>
                    ) : (
                      <>Complete Your Registration</>
                    )}
                  </h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                    {hasSubmittedDocuments ? (
                      <p>
                        Your professional credentials are currently under review. This process typically
                        takes 2-3 business days.
                      </p>
                    ) : (
                      <p>
                        Please submit your professional credentials and verification documents to begin
                        the review process.
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 flex items-center space-x-4">
                  <Clock className="h-12 w-12 text-yellow-500" />
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {loading ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Getting Started Guide */}
          <div className="bg-white shadow sm:rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-indigo-500" />
                Getting the Most Out of Your Profile
              </h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Sparkles className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Stand Out with Your Portfolio</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Upload your best work samples and organize them by category. High-quality images and videos will help attract more clients.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Share2 className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Connect Your Social Media</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Link your Instagram and TikTok accounts to showcase your work and grow your following across platforms.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="mt-10">
            <h2 className="text-lg font-medium text-gray-900">Verification Process</h2>
            <div className="mt-5 border-t border-gray-200">
              <dl className="divide-y divide-gray-200">
                <div 
                  className={`py-4 space-y-1 ${!hasSubmittedDocuments ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                  onClick={() => !hasSubmittedDocuments && setIsEditingVerification(true)}
                >
                  <dt className="text-sm font-medium text-gray-500">Step 1: Document Submission</dt>
                  <dd className="mt-1 flex justify-between items-center text-sm text-gray-900">
                    <div>
                      <span>Professional credentials submitted</span>
                      {!hasSubmittedDocuments && (
                        <p className="text-xs text-indigo-600 mt-1">Click to submit documents</p>
                      )}
                    </div>
                    {hasSubmittedDocuments ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-300" />
                    )}
                  </dd>
                </div>
                <div className="py-4 space-y-1">
                  <dt className="text-sm font-medium text-gray-500">Step 2: Initial Review</dt>
                  <dd className="mt-1 flex justify-between items-center text-sm text-gray-900">
                    <div>
                      <span>Documents under review by our team</span>
                      {hasSubmittedDocuments && (
                        <p className="text-xs text-yellow-600 mt-1">Review in progress</p>
                      )}
                    </div>
                    {hasSubmittedDocuments ? (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-300" />
                    )}
                  </dd>
                </div>
                <div className="py-4 space-y-1">
                  <dt className="text-sm font-medium text-gray-500">Step 3: License Verification</dt>
                  <dd className="mt-1 flex justify-between items-center text-sm text-gray-900">
                    <div>
                      <span>Verification with state board</span>
                      {hasSubmittedDocuments && (
                        <p className="text-xs text-gray-500 mt-1">Pending initial review</p>
                      )}
                    </div>
                    {verificationData.verificationStatus === 'approved' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : hasSubmittedDocuments ? (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-300" />
                    )}
                  </dd>
                </div>
                <div className="py-4 space-y-1">
                  <dt className="text-sm font-medium text-gray-500">Step 4: Final Approval</dt>
                  <dd className="mt-1 flex justify-between items-center text-sm text-gray-900">
                    <div>
                      <span>Account activation</span>
                      {hasSubmittedDocuments && (
                        <p className="text-xs text-gray-500 mt-1">Pending verification</p>
                      )}
                    </div>
                    {verificationData.verificationStatus === 'approved' && hasSubmittedDocuments ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : hasSubmittedDocuments ? (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-300" />
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Profile Setup Section */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                While You Wait: Complete Your Profile
              </h3>
              <div className="mt-6 space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Basic Information</h4>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="displayName" className="block text-sm text-gray-700">Display Name</label>
                      <input
                        type="text"
                        id="displayName"
                        value={profileData.displayName}
                        onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="bio" className="block text-sm text-gray-700">Bio</label>
                      <textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Contact Information</h4>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="phone" className="block text-sm text-gray-700">Phone</label>
                      <input
                        type="tel"
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="location" className="block text-sm text-gray-700">Location</label>
                      <input
                        type="text"
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Social Media</h4>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="instagram" className="block text-sm text-gray-700">Instagram</label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                          <Instagram className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          id="instagram"
                          value={profileData.instagram}
                          onChange={(e) => setProfileData({ ...profileData, instagram: e.target.value })}
                          className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="@username"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="tiktok" className="block text-sm text-gray-700">TikTok</label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                          <Clock className="h-4 w-4" />
                        </span>
                        <input
                          type="text"
                          id="tiktok"
                          value={profileData.tiktok}
                          onChange={(e) => setProfileData({ ...profileData, tiktok: e.target.value })}
                          className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="@username"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {loading ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Modal */}
          {isEditingVerification && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Submit Verification Documents
                  </h3>
                  <button
                    onClick={() => setIsEditingVerification(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateVerification} className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Verification Information
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Review and update your submitted verification details
                  </p>
                </div>
                {!isEditingVerification && (
                  <button
                    onClick={() => setIsEditingVerification(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Update Verification
                  </button>
                )}
              </div>

                <div className="space-y-6">
                  {/* Professional Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Professional Type</label>
                    <select
                      value={verificationData.professionalType}
                      onChange={(e) => setVerificationData(prev => ({
                        ...prev,
                        professionalType: e.target.value as ProfessionalType
                      }))}
                      className={`mt-1 block w-full rounded-md ${
                        fieldErrors.professionalType 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                    >
                      {Object.entries(PROFESSIONAL_TYPES).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* License Information (for non-makeup artists) */}
                  {verificationData.professionalType !== 'makeup_artist' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">License State</label>
                        <select
                          value={verificationData.licenseState}
                          onChange={(e) => setVerificationData(prev => ({
                            ...prev,
                            licenseState: e.target.value
                          }))}
                          className={`mt-1 block w-full rounded-md ${
                            fieldErrors.licenseState 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                          }`}
                        >
                          <option value="">Select State</option>
                          {US_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>

                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">License Number</label>
                          <input
                            type="text"
                            value={verificationData.licenseNumber}
                            onChange={(e) => setVerificationData(prev => ({
                              ...prev,
                              licenseNumber: e.target.value
                            }))}
                            className={`mt-1 block w-full rounded-md ${
                              fieldErrors.licenseNumber 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                            }`}
                          />
                        </div>
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700">License Document</label>
                          <div className="mt-1">
                            <FileUpload
                              onFileUpload={(file) => handleFileUpload(file, 'license')}
                              accept="image/*,.pdf"
                            />
                          </div>
                        </div>
                      </>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">License Expiration</label>
                        <input
                          type="date"
                          value={verificationData.licenseExpirationDate}
                          onChange={(e) => setVerificationData(prev => ({
                            ...prev,
                            licenseExpirationDate: e.target.value
                          }))}
                          className={`mt-1 block w-full rounded-md ${
                            fieldErrors.licenseExpirationDate 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                          }`}
                        />
                      </div>
                    </>
                  )}

                  {/* Makeup Artist Verification */}
                  {verificationData.professionalType === 'makeup_artist' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Verification Type</label>
                        <select
                          value={verificationData.verificationTypeOne}
                          onChange={(e) => setVerificationData(prev => ({
                            ...prev,
                            verificationTypeOne: e.target.value as MakeupArtistVerificationType
                          }))}
                          className={`mt-1 block w-full rounded-md ${
                            fieldErrors.verificationTypeOne 
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                          }`}
                        >
                          {Object.entries(MAKEUP_ARTIST_VERIFICATION_TYPES).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>

                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Second Verification Type</label>
                          <select
                            value={verificationData.verificationTypeTwo}
                            onChange={(e) => setVerificationData(prev => ({
                              ...prev,
                              verificationTypeTwo: e.target.value as MakeupArtistVerificationType
                            }))}
                            className={`mt-1 block w-full rounded-md ${
                              fieldErrors.verificationTypeTwo 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                            }`}
                          >
                            {Object.entries(MAKEUP_ARTIST_VERIFICATION_TYPES).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700">Verification Document</label>
                          <div className="mt-1">
                            <FileUpload
                              onFileUpload={(file) => handleFileUpload(file, 'verification')}
                              accept="image/*,.pdf"
                            />
                            {fieldErrors.license && (
                              <p className="mt-1 text-sm text-red-600">{fieldErrors.license}</p>
                            )}
                          </div>
                        </div>
                      </>
                    </>
                  )}

                  {/* Government ID Upload */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Government ID</label>
                    <div className="mt-1">
                      <FileUpload
                        onFileUpload={(file) => handleFileUpload(file, 'government_id')}
                        accept="image/*,.pdf"
                            />
                            {fieldErrors.verification && (
                              <p className="mt-1 text-sm text-red-600">{fieldErrors.verification}</p>
                            )}
                          </div>
                  </div>

                  <div className="mt-6 border-b border-gray-200 pb-6">
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditingVerification(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        {loading ? 'Saving...' : 'Submit Documents'}
                      </button>
                    </div>
                  </div>
                </div>
                </form>
              </div>
            </div>
          )}

          {/* Verification Information */}
          <div className="bg-white shadow sm:rounded-lg mt-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Verification Status
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {hasSubmittedDocuments 
                      ? 'Your verification documents have been submitted and are under review.'
                      : 'Click on "Document Submission" above to submit your verification documents.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    {/* Document Previews */}
                    {verificationData.documents && verificationData.documents.length > 0 && (
                      <div className="col-span-2">
                        <dt className="text-sm font-medium text-gray-500 mb-2">Submitted Documents</dt>
                        <dd className="mt-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {verificationData.documents.map((doc) => (
                            <div 
                              key={doc.type}
                              onClick={() => doc.url && setSelectedImage(doc.url)}
                              className="relative cursor-pointer group"
                            >
                              {doc.url && doc.url.toLowerCase().endsWith('.pdf') ? (
                                <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200">
                                  <FileText className="h-12 w-12 text-gray-500" />
                                </div>
                              ) : (
                                <div className="relative w-full h-32">
                                  <img 
                                    src={doc.url} 
                                    alt={doc.type}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all flex items-center justify-center">
                                    <Maximize2 className="text-white opacity-0 group-hover:opacity-100 h-6 w-6" />
                                  </div>
                                </div>
                              )}
                              <p className="mt-1 text-xs text-gray-500 truncate">
                                {doc.type === 'license' ? 'License' :
                                 doc.type === 'government_id' ? 'Government ID' :
                                 doc.type === 'verification_one' ? 'First Verification' :
                                 doc.type === 'verification_two' ? 'Second Verification' :
                                 doc.type}
                              </p>
                            </div>
                          ))}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Professional Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {PROFESSIONAL_TYPES[userProfile?.professionalProfile?.professionalType || 'makeup_artist']}
                      </dd>
                    </div>
                    {userProfile?.professionalProfile?.professionalType !== 'makeup_artist' ? (
                      <>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">License State</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {userProfile?.professionalProfile?.licenseState}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">License Number</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {userProfile?.professionalProfile?.licenseNumber}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">License Expiration</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {userProfile?.professionalProfile?.licenseExpirationDate}
                          </dd>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">First Verification Type</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {MAKEUP_ARTIST_VERIFICATION_TYPES[userProfile?.professionalProfile?.verificationTypeOne || 'union_card']}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Second Verification Type</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {MAKEUP_ARTIST_VERIFICATION_TYPES[userProfile?.professionalProfile?.verificationTypeTwo || 'editorial_credit']}
                          </dd>
                        </div>
                      </>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Submission Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(userProfile?.professionalProfile?.submissionDate || '').toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    While your application is being reviewed, you can:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Update your basic profile information</li>
                    <li>Prepare your service offerings</li>
                    <li>Review our professional guidelines</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Image Preview Modal */}
          {selectedImage && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="relative max-w-4xl w-full mx-4">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 text-white hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
                <img 
                  src={selectedImage} 
                  alt="Document preview"
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                        />
                        {fieldErrors.government_id && (
                          <p className="mt-1 text-sm text-red-600">{fieldErrors.government_id}</p>
                        )}
                      </div>
            </div>
          )}

          {/* Contact Support */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@example.com" className="text-indigo-600 hover:text-indigo-500">
                support@example.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
