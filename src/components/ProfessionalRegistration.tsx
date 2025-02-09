import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  PROFESSIONAL_TYPES, 
  US_STATES, 
  ProfessionalType,
  MAKEUP_ARTIST_VERIFICATION_TYPES,
  MakeupArtistVerificationType
} from '../types/professional';
import { Upload, Calendar, FileText, MapPin, Camera, Info } from 'lucide-react';

export const ProfessionalRegistration = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [professionalType, setProfessionalType] = useState<ProfessionalType>('makeup_artist');
  const [licenseState, setLicenseState] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiration, setLicenseExpiration] = useState('');
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [verificationTypeOne, setVerificationTypeOne] = useState<MakeupArtistVerificationType>('union_card');
  const [verificationTypeTwo, setVerificationTypeTwo] = useState<MakeupArtistVerificationType>('editorial_credit');
  const [verificationFileOne, setVerificationFileOne] = useState<File | null>(null);
  const [verificationFileTwo, setVerificationFileTwo] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idFile) {
      setError('Please upload your ID document');
      return;
    }

    if (professionalType === 'makeup_artist') {
      if (!verificationFileOne || !verificationFileTwo) {
        setError('Please upload both verification documents');
        return;
      }
      if (verificationTypeOne === verificationTypeTwo) {
        setError('Please select two different types of verification');
        return;
      }
    } else {
      if (!licenseFile) {
        setError('Please upload your license document');
        return;
      }
    }

    try {
      setLoading(true);
      setError('');
      
      await updateUserProfile({
        role: 'pending_professional',
        professionalDetails: {
          type: professionalType,
          licenseState,
          licenseNumber,
          licenseExpiration,
          submissionDate: new Date().toISOString()
        }
      });

      navigate('/professional/pending');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit verification');
    } finally {
      setLoading(false);
    }
  };

  const isMakeupArtist = professionalType === 'makeup_artist';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Professional Registration
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please provide your professional credentials for verification
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Professional Type Selection */}
            <div>
              <label htmlFor="professionalType" className="block text-sm font-medium text-gray-700">
                Professional Type
              </label>
              <select
                id="professionalType"
                value={professionalType}
                onChange={(e) => setProfessionalType(e.target.value as ProfessionalType)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                required
              >
                {Object.entries(PROFESSIONAL_TYPES).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Conditional rendering based on professional type */}
            {!isMakeupArtist ? (
              <>
                {/* State Selection */}
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    License State
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="state"
                      value={licenseState}
                      onChange={(e) => setLicenseState(e.target.value)}
                      className="mt-1 block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      required
                    >
                      <option value="">Select a state</option>
                      {US_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* License Number */}
                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                    License Number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="licenseNumber"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="mt-1 block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      placeholder="Enter license number"
                      required
                    />
                  </div>
                </div>

                {/* License Expiration */}
                <div>
                  <label htmlFor="licenseExpiration" className="block text-sm font-medium text-gray-700">
                    License Expiration Date
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="licenseExpiration"
                      value={licenseExpiration}
                      onChange={(e) => setLicenseExpiration(e.target.value)}
                      className="mt-1 block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      required
                    />
                  </div>
                </div>

                {/* License Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Professional License Photo
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="license-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                          <span>Upload license</span>
                          <input
                            id="license-upload"
                            name="license-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*,.pdf"
                            onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                            required
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, or PDF up to 10MB</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Makeup Artist Verification Type One */}
                <div>
                  <label htmlFor="verificationTypeOne" className="block text-sm font-medium text-gray-700">
                    First Form of Verification
                  </label>
                  <select
                    id="verificationTypeOne"
                    value={verificationTypeOne}
                    onChange={(e) => setVerificationTypeOne(e.target.value as MakeupArtistVerificationType)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    {Object.entries(MAKEUP_ARTIST_VERIFICATION_TYPES).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Verification Upload One */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Verification Document
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="verification-one-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                          <span>Upload document</span>
                          <input
                            id="verification-one-upload"
                            name="verification-one-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*,.pdf"
                            onChange={(e) => setVerificationFileOne(e.target.files?.[0] || null)}
                            required
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, or PDF up to 10MB</p>
                    </div>
                  </div>
                </div>

                {/* Makeup Artist Verification Type Two */}
                <div>
                  <label htmlFor="verificationTypeTwo" className="block text-sm font-medium text-gray-700">
                    Second Form of Verification
                  </label>
                  <select
                    id="verificationTypeTwo"
                    value={verificationTypeTwo}
                    onChange={(e) => setVerificationTypeTwo(e.target.value as MakeupArtistVerificationType)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    {Object.entries(MAKEUP_ARTIST_VERIFICATION_TYPES).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Verification Upload Two */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Second Verification Document
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="verification-two-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                          <span>Upload document</span>
                          <input
                            id="verification-two-upload"
                            name="verification-two-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*,.pdf"
                            onChange={(e) => setVerificationFileTwo(e.target.files?.[0] || null)}
                            required
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, or PDF up to 10MB</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ID Upload - Required for all professionals */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Government-Issued ID
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="id-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Upload ID</span>
                      <input
                        id="id-upload"
                        name="id-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*,.pdf"
                        onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                        required
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, or PDF up to 10MB</p>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit for Verification'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};