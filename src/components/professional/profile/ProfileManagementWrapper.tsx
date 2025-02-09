import { useAuth } from '../../../contexts/AuthContext';
import { useProfessionalProfile } from '../../../hooks/useProfessionalProfile';
import { ProfileManagement } from './ProfileManagement';
import { ProfileUpdateData } from '../../../types/user';

export const ProfileManagementWrapper = () => {
  const { userProfile } = useAuth();
  const { updateProfile: updateProfileHook } = useProfessionalProfile();

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  const handleUpdateProfile = async (data: ProfileUpdateData, profileImage?: File | null) => {
    await updateProfileHook(data, profileImage);
  };

  const profileData = {
    uid: userProfile.uid,
    name: userProfile.displayName || '',
    bio: userProfile.professionalProfile?.bio || '',
    location: userProfile.professionalProfile?.location || '',
    profilePhotoUrl: userProfile.photoURL || '',
    verification: userProfile.professionalProfile?.verification
  };

  return (
    <ProfileManagement 
      profileData={profileData}
      updateProfile={handleUpdateProfile}
    />
  );
};
