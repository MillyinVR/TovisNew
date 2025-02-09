import { User, Edit, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { FileUpload } from '../../../components/shared/FileUpload';
import { LocationAutocomplete } from '../../../components/shared/LocationAutocomplete';
import { ProfessionalService } from '../../../types/service';
import { doc, getDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { LicenseUpdateForm } from '../LicenseUpdateForm';
import { ProfileUpdateData, LocationData } from '../../../types/user';
import { Service } from '../../../types/service';

interface ProfileFormData {
  name: string;
  bio?: string;
  location?: string | LocationData;
  profilePhotoUrl?: string;
  verification?: {
    status: 'pending' | 'verified' | 'rejected' | 'update_pending';
    documentType?: string;
    documentId?: string;
    expirationDate?: string;
    verifiedDate?: string;
    licenseImageUrl?: string;
  };
}

interface ProfileManagementProps {
  profileData: {
    uid: string;
    name: string;
    bio?: string;
    location: string | LocationData;
    profilePhotoUrl?: string;
    verification?: {
      status: 'pending' | 'verified' | 'rejected' | 'update_pending';
      documentType?: string;
      documentId?: string;
      expirationDate?: string;
      verifiedDate?: string;
      licenseImageUrl?: string;
    };
  };
  updateProfile: (data: ProfileUpdateData, profileImage?: File | null) => Promise<void>;
}

export const ProfileManagement = ({ profileData, updateProfile }: ProfileManagementProps) => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [profileDataState, setProfileData] = useState<{
    name: string;
    bio?: string;
    location: string | LocationData;
    profilePhotoUrl: string;
    verification?: {
      status: 'pending' | 'verified' | 'rejected' | 'update_pending';
      documentType?: string;
      documentId?: string;
      expirationDate?: string;
      verifiedDate?: string;
      licenseImageUrl?: string;
    };
  }>({
    name: profileData?.name || '',
    bio: profileData?.bio || '',
    location: profileData?.location || '',
    profilePhotoUrl: profileData?.profilePhotoUrl || '',
    verification: profileData?.verification
  });

  // Fetch current verification status
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const verificationDoc = await getDoc(doc(db, 'verifications', profileData.uid));
        if (verificationDoc.exists()) {
          const verificationData = verificationDoc.data();
          setProfileData(prev => ({
            ...prev,
            verification: {
              ...prev.verification,
              status: verificationData.verificationStatus,
              documentId: verificationData.licenseNumber,
              expirationDate: verificationData.licenseExpirationDate,
              documentType: verificationData.professionalType,
              licenseImageUrl: verificationData.licenseImageUrl
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching verification status:', error);
      }
    };

    fetchVerificationStatus();
  }, [profileData.uid]);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ProfileFormData>({
    defaultValues: {
      name: profileDataState.name || '',
      bio: profileDataState.bio || '',
      location: profileDataState.location || '',
      profilePhotoUrl: profileDataState.profilePhotoUrl || '',
      verification: profileDataState.verification
    }
  });

  // Update form values when profileDataState changes
  useEffect(() => {
    setValue('name', profileDataState.name);
    setValue('bio', profileDataState.bio || '');
    setValue('location', profileDataState.location);
    setValue('profilePhotoUrl', profileDataState.profilePhotoUrl);
    setValue('verification', profileDataState.verification);
  }, [profileDataState, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      // Ensure we're using the location data from state
      const submissionData: ProfileUpdateData = {
        displayName: data.name,
        location: profileDataState.location,
        professionalProfile: {
          bio: data.bio,
          location: profileDataState.location,
          services: undefined
        }
      };

      // Convert base64 URL to File object if needed
      let profileImage: File | null = null;
      if (data.profilePhotoUrl && data.profilePhotoUrl !== profileData.profilePhotoUrl) {
        try {
          const response = await fetch(data.profilePhotoUrl);
          const blob = await response.blob();
          profileImage = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
        } catch (error) {
          console.error('Error converting profile photo URL to File:', error);
        }
      }

      await updateProfile(submissionData, profileImage);
      setProfileData(prev => ({
        ...prev,
        name: data.name,
        bio: data.bio,
        location: profileDataState.location,
        profilePhotoUrl: data.profilePhotoUrl || prev.profilePhotoUrl
      }));
      alert('Profile updated successfully');
    } catch (error) {
      alert(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600';
      case 'pending':
      case 'update_pending':
        return 'text-yellow-600';
      default:
        return 'text-red-600';
    }
  };

  const formatStatus = (status: string) => {
    if (status === 'update_pending') return 'Update Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleLicenseUpdate = () => {
    const verificationRef = doc(db, 'verifications', profileData.uid);
    getDoc(verificationRef).then((doc) => {
      if (doc.exists()) {
        setProfileData(prev => ({
          ...prev,
          verification: {
            ...prev.verification,
            status: doc.data().verificationStatus,
            documentId: doc.data().licenseNumber,
            expirationDate: doc.data().licenseExpirationDate,
            documentType: doc.data().professionalType,
            licenseImageUrl: doc.data().licenseImageUrl
          }
        }));
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Profile Information
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                type="text"
                id="name"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Salon Location
              </label>
              <LocationAutocomplete
                initialValue={typeof profileData.location === 'string' ? profileData.location : profileData.location.address}
                onLocationSelect={(location) => {
                  setProfileData(prev => ({
                    ...prev,
                    location: {
                      address: location.address,
                      coordinates: location.coordinates
                    }
                  }));
                  setValue('location', {
                    address: location.address,
                    coordinates: location.coordinates
                  });
                }}
                className={errors.location ? 'border-red-500' : 'border-gray-300'}
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
              )}
              {profileDataState.location && typeof profileDataState.location !== 'string' && (
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{profileDataState.location.address}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio (Optional)
            </label>
            <textarea
              {...register('bio', {
                maxLength: {
                  value: 500,
                  message: 'Bio must be less than 500 characters'
                }
              })}
              id="bio"
              rows={4}
              placeholder="Tell us about yourself and your expertise..."
              className={`w-full px-3 py-2 border rounded-md ${
                errors.bio ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.bio && (
              <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Photo
            </label>
            <FileUpload
              onFileUpload={async (file: File) => {
                try {
                  const formData = new FormData();
                  formData.append('file', file);
                  
                  // Upload to Firebase Storage
                  const storageRef = ref(storage, `profiles/${profileData.uid}/${file.name}`);
                  await uploadBytes(storageRef, file);
                  const url = await getDownloadURL(storageRef);
                  
                  setProfileData(prev => ({
                    ...prev,
                    profilePhotoUrl: url
                  }));
                  setValue('profilePhotoUrl', url);
                  return url;
                } catch (error) {
                  console.error('Error uploading file:', error);
                  throw error;
                }
              }}
              initialImage={profileDataState.profilePhotoUrl}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Verification Status Section */}
      {profileDataState.verification && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <svg 
              className="h-5 w-5 mr-2" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path 
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            Verification Status
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`text-base font-medium ${getStatusColor(profileDataState.verification.status)}`}>
                    {formatStatus(profileDataState.verification.status)}
                  </p>
                </div>
                {profileDataState.verification.status === 'update_pending' && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                    <p className="text-sm text-yellow-700">
                      Your license update is pending review by an administrator.
                    </p>
                  </div>
                )}
              </div>
              {profileDataState.verification.documentType && (
                <div>
                  <p className="text-sm text-gray-500">Document Type</p>
                  <p className="text-base font-medium">{profileDataState.verification.documentType}</p>
                </div>
              )}
              {profileDataState.verification.documentId && (
                <div>
                  <p className="text-sm text-gray-500">Document ID</p>
                  <p className="text-base font-medium">{profileDataState.verification.documentId}</p>
                </div>
              )}
              {profileDataState.verification.verifiedDate && (
                <div>
                  <p className="text-sm text-gray-500">Verified Date</p>
                  <p className="text-base font-medium">
                    {new Date(profileDataState.verification.verifiedDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {profileDataState.verification.expirationDate && (
                <div>
                  <p className="text-sm text-gray-500">Expiration Date</p>
                  <p className={`text-base font-medium ${
                    new Date(profileDataState.verification.expirationDate) < new Date()
                      ? 'text-red-600'
                      : 'text-gray-900'
                  }`}>
                    {new Date(profileDataState.verification.expirationDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* License Image Section */}
              <div className="col-span-2 mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">License Image</p>
                {profileDataState.verification.licenseImageUrl ? (
                  <div className="relative group">
                    <img 
                      src={profileDataState.verification.licenseImageUrl} 
                      alt="License"
                      className="max-w-md rounded-lg shadow-sm"
                    />
                    <button
                      onClick={() => setShowUpdateForm(true)}
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                    >
                      <span className="bg-white text-gray-900 px-4 py-2 rounded-md text-sm font-medium">
                        Update License
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => setShowUpdateForm(true)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Upload License Image
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* License Update Modal */}
      {showUpdateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-lg w-full mx-4">
            <LicenseUpdateForm 
              onClose={() => {
                setShowUpdateForm(false);
                handleLicenseUpdate();
              }}
              userId={profileData.uid}
            />
          </div>
        </div>
      )}
    </div>
  );
};
