import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PROFESSIONAL_TYPES, US_STATES, ProfessionalType, MAKEUP_ARTIST_VERIFICATION_TYPES, MakeupArtistVerificationType } from '../types/professional';
import { FileUploader } from '../components/FileUploader';
import { MapPin, Calendar, FileText } from 'lucide-react';

export const ProfessionalRegistration = () => {
  const navigate = useNavigate();
  const { updateUserProfile } = useAuth();
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

  const isMakeupArtist = professionalType === 'makeup_artist';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idFile) {
      setError('Please upload your ID document');
      return;
    }

    if (isMakeupArtist) {
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Professional Registration</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please provide your professional credentials for verification
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">{error}</div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Professional Type</label>
              <select
                value={professionalType}
                onChange={(e) => setProfessionalType(e.target.value as ProfessionalType)}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                {Object.entries(PROFESSIONAL_TYPES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {!isMakeupArtist ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">License State</label>
                  <select
                    value={licenseState}
                    onChange={(e) => setLicenseState(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select a state</option>
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">License Number</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-10 pr-10 text-base sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter license number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">License Expiration Date</label>
                  <input
                    type="date"
                    value={licenseExpiration}
                    onChange={(e) => setLicenseExpiration(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-10 pr-10 text-base sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <FileUploader
                  label="Professional License Photo"
                  onFileSelect={setLicenseFile}
                  required
                />
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Form of Verification</label>
                  <select
                    value={verificationTypeOne}
                    onChange={(e) => setVerificationTypeOne(e.target.value as MakeupArtistVerificationType)}
                    className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    {Object.entries(MAKEUP_ARTIST_VERIFICATION_TYPES).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <FileUploader
                  label="First Verification Document"
                  onFileSelect={setVerificationFileOne}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700">Second Form of Verification</label>
                  <select
                    value={verificationTypeTwo}
                    onChange={(e) => setVerificationTypeTwo(e.target.value as MakeupArtistVerificationType)}
                    className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    {Object.entries(MAKEUP_ARTIST_VERIFICATION_TYPES).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <FileUploader
                  label="Second Verification Document"
                  onFileSelect={setVerificationFileTwo}
                  required
                />
              </>
            )}

            <FileUploader
              label="Government-Issued ID"
              onFileSelect={setIdFile}
              required
            />

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
