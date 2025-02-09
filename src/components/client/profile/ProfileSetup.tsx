import React, { useState } from 'react';
import { Camera, Bell, Lock, Sliders, User } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface ProfilePreferences {
  skinType?: string;
  hairType?: string;
  allergies: string[];
  sensitivities: string[];
  preferredProducts: string[];
  stylePreferences: string[];
  communicationPreferences: {
    reminders: boolean;
    method: 'email' | 'sms' | 'both';
    frequency: 'day_before' | 'hours_before' | 'week_before';
  };
}

const ProfileSetup: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<ProfilePreferences>({
    skinType: '',
    hairType: '',
    allergies: [],
    sensitivities: [],
    preferredProducts: [],
    stylePreferences: [],
    communicationPreferences: {
      reminders: true,
      method: 'sms',
      frequency: 'day_before'
    }
  });

  const skinTypes = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'];
  const hairTypes = ['Straight', 'Wavy', 'Curly', 'Coily'];
  const commonAllergies = ['Latex', 'Fragrance', 'Nuts', 'Dyes'];
  const commonSensitivities = ['Fragrance', 'Alcohol', 'Essential Oils', 'Preservatives'];

  const handlePreferenceChange = (field: keyof ProfilePreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateUserProfile({
        preferences
      });
    } catch (error) {
      console.error('Failed to update preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Photo */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Photo</h3>
        <div className="flex items-center space-x-6">
          <div className="relative">
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt="Profile"
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <button className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-1.5 text-white hover:bg-indigo-700">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Change photo</h4>
            <p className="text-sm text-gray-500">
              Upload a new photo or remove the current one
            </p>
          </div>
        </div>
      </div>

      {/* Beauty Preferences */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Beauty Preferences</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Skin Type</label>
            <select
              value={preferences.skinType}
              onChange={(e) => handlePreferenceChange('skinType', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select skin type</option>
              {skinTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Hair Type</label>
            <select
              value={preferences.hairType}
              onChange={(e) => handlePreferenceChange('hairType', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select hair type</option>
              {hairTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">Allergies</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {commonAllergies.map(allergy => (
              <label key={allergy} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.allergies.includes(allergy)}
                  onChange={(e) => {
                    const newAllergies = e.target.checked
                      ? [...preferences.allergies, allergy]
                      : preferences.allergies.filter(a => a !== allergy);
                    handlePreferenceChange('allergies', newAllergies);
                  }}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600">{allergy}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">Sensitivities</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {commonSensitivities.map(sensitivity => (
              <label key={sensitivity} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.sensitivities.includes(sensitivity)}
                  onChange={(e) => {
                    const newSensitivities = e.target.checked
                      ? [...preferences.sensitivities, sensitivity]
                      : preferences.sensitivities.filter(s => s !== sensitivity);
                    handlePreferenceChange('sensitivities', newSensitivities);
                  }}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600">{sensitivity}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Communication Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.communicationPreferences.reminders}
                onChange={(e) => handlePreferenceChange('communicationPreferences', {
                  ...preferences.communicationPreferences,
                  reminders: e.target.checked
                })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-600">
                Enable appointment reminders
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Reminder Method</label>
            <select
              value={preferences.communicationPreferences.method}
              onChange={(e) => handlePreferenceChange('communicationPreferences', {
                ...preferences.communicationPreferences,
                method: e.target.value as 'email' | 'sms' | 'both'
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="both">Both Email & SMS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Reminder Timing</label>
            <select
              value={preferences.communicationPreferences.frequency}
              onChange={(e) => handlePreferenceChange('communicationPreferences', {
                ...preferences.communicationPreferences,
                frequency: e.target.value as 'day_before' | 'hours_before' | 'week_before'
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="week_before">1 week before</option>
              <option value="day_before">1 day before</option>
              <option value="hours_before">3 hours before</option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Privacy Settings</h3>
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              Show my profile to other clients
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              Allow professionals to see my beauty preferences
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              Receive personalized recommendations
            </span>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};

export { ProfileSetup };
// We can also add a default export if needed
export default ProfileSetup;