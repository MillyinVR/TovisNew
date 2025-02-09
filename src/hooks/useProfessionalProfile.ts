import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import { db, storage, auth, profileImagesRef } from '../lib/firebase';
import { updateProfile as updateAuthProfile } from 'firebase/auth';
import { User, ProfileUpdateData, LocationData } from '../types/user';

export const useProfessionalProfile = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (data: ProfileUpdateData, profileImage?: File | null, services?: any[]) => {
    if (!userProfile?.uid) {
      throw new Error('User profile not found');
    }

    // Validate services if provided
    if (services) {
      if (!Array.isArray(services)) {
        throw new Error('Services must be an array');
      }
      services.forEach(service => {
        if (!service.name || !service.description || !service.price) {
          throw new Error('Each service must have name, description and price');
        }
      });
    }

    try {
      setLoading(true);
      setError(null);

      // Validate profile data
      if (!data.displayName?.trim()) {
        throw new Error('Display name is required');
      }

      let photoURL = userProfile?.photoURL;

      // Handle image upload with timeout
      if (profileImage) {
        console.log('Starting image upload...');
        const fileName = `${Date.now()}_${profileImage.name}`;
        const imageRef = profileImagesRef(`${userProfile.uid}/${fileName}`);
        
        // Set timeout for image upload (60 seconds)
        const uploadPromise = uploadBytes(imageRef, profileImage);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Image upload timed out after 60 seconds')), 60000)
        );

        try {
          const uploadResult = await Promise.race([uploadPromise, timeoutPromise]) as { ref: any };
          photoURL = await getDownloadURL(uploadResult.ref);
          console.log('Image upload successful:', photoURL);
          
          // Update auth profile
          if (auth.currentUser) {
            await updateAuthProfile(auth.currentUser, {
              photoURL: photoURL || '',
              displayName: data.displayName
            });
          }
        } catch (err) {
          console.error('Image upload failed:', err);
          throw new Error(`Image upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      const userRef = doc(db, 'users', userProfile.uid);
      // Ensure location data is properly structured
      const location = data.location && typeof data.location === 'object'
        ? {
            address: (data.location as LocationData).address,
            placeId: (data.location as LocationData).placeId,
            coordinates: {
              lat: (data.location as LocationData).coordinates.lat,
              lng: (data.location as LocationData).coordinates.lng
            }
          } as LocationData
        : data.location;

      const updateData: Partial<User> = {
        ...data,
        photoURL,
        location, // Add location at the root level
        updatedAt: serverTimestamp(),
        professionalProfile: {
          ...userProfile?.professionalProfile,
          ...data.professionalProfile,
          location, // Also add location in professionalProfile
          services: services || userProfile?.professionalProfile?.services || []
        }
      };
      
      // Update Firestore document
      await updateDoc(userRef, updateData);

      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateAuthProfile(auth.currentUser, {
          photoURL: photoURL || '',
          displayName: data.displayName
        });
      }

      // Update local state
      await updateUserProfile({
        ...updateData,
        photoURL,
        displayName: data.displayName
      });

      return { 
        success: true, 
        photoURL
      };

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    updateProfile
  };
};
