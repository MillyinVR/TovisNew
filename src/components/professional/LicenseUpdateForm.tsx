import React, { useState } from 'react';
import { FileUpload } from '../shared/FileUpload';
import { doc, updateDoc, getDoc, setDoc, getDoc as getUserDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '@/lib/firebase';
import { US_STATES } from '@/types/professional';

interface LicenseUpdateFormProps {
  onClose: () => void;
  userId: string;
}

export const LicenseUpdateForm: React.FC<LicenseUpdateFormProps> = ({
  onClose,
  userId
}) => {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseState, setLicenseState] = useState('');
  const [licenseExpirationDate, setLicenseExpirationDate] = useState('');
  const [licenseImageUrl, setLicenseImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if document exists
      const verificationRef = doc(db, 'verifications', userId);
      const verificationDoc = await getDoc(verificationRef);
      const userDoc = await getUserDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      const updateData = {
        licenseNumber,
        licenseState,
        licenseExpirationDate,
        licenseImageUrl,
        verificationStatus: 'update_pending',
        submissionDate: new Date().toISOString()
      };

      if (!verificationDoc.exists()) {
        // Create new document if it doesn't exist
        await setDoc(verificationRef, {
          ...updateData,
          userId: userId,
          name: userData?.displayName || '',
          email: userData?.email || '',
          professionalType: userData?.professionalType || 'makeup_artist',
          submissionDate: new Date().toISOString(),
          verificationStatus: 'update_pending',
          identificationImageUrl: userData?.identificationImageUrl || ''
        });
      } else {
        // Update existing document
        await updateDoc(verificationRef, updateData);
      }

      onClose();
    } catch (error) {
      console.error('Error updating license:', error);
      alert('Failed to update license. Please try again. ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="bg-white p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Update License</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Close</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
            License Number
          </label>
          <input
            type="text"
            id="licenseNumber"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="licenseState" className="block text-sm font-medium text-gray-700">
            State
          </label>
          <select
            id="licenseState"
            value={licenseState}
            onChange={(e) => setLicenseState(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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

        <div>
          <label htmlFor="licenseExpirationDate" className="block text-sm font-medium text-gray-700">
            Expiration Date
          </label>
          <input
            type="date"
            id="licenseExpirationDate"
            value={licenseExpirationDate}
            onChange={(e) => setLicenseExpirationDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            License Image
          </label>
          <FileUpload
            onFileUpload={async (file: File) => {
              const storage = getStorage();
              const storageRef = ref(storage, `verification-documents/${userId}/license`);
              await uploadBytes(storageRef, file);
              const url = await getDownloadURL(storageRef);
              setLicenseImageUrl(url);
              return url;
            }}
            accept="image/jpeg,image/png,application/pdf"
            multiple={false}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !licenseImageUrl}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};
