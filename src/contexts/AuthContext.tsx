import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, UserRole } from '../types/user';
import { initializeServiceData } from '../lib/initializeData';
import { verifyDatabase, verifyUserServices } from '../lib/verifyDatabase';

export interface AuthContextType {
  currentUser: User | null;
  userProfile: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'client' | 'professional') => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<{ success: boolean }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', {
        userEmail: user?.email,
        hasUser: !!user
      });

      // Listen for token changes to handle custom claims updates
      if (user) {
        user.getIdToken(true).then(token => {
          console.log('Token refreshed with updated claims');
        }).catch(error => {
          console.error('Error refreshing token:', error);
        });
      }
      
      setCurrentUser(user ? {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        role: 'client', // Default role until we load the profile
        phoneNumber: user.phoneNumber || undefined,
        preferences: {
          notifications: true,
          theme: 'light',
          language: 'en',
        },
        verificationStatus: {
          email: user.emailVerified,
          phone: !!user.phoneNumber,
          identity: false,
        },
        membershipTier: 'standard',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        failedLoginAttempts: 0,
      } : null);
      setLoading(true);
      
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            console.log('No user profile found in database - waiting for profile creation');
            setLoading(false);
            return;
          }

          const profile = {
            ...(userDoc.data() as User),
            uid: user.uid // Ensure we have the uid from Firebase
          };
          console.log('Loaded user profile:', {
            userId: profile.uid,
            userEmail: profile.email,
            userRole: profile.role
          });
          
          setUserProfile(profile);
          
          if (profile.role === 'professional') {
            console.log('Verifying services for professional user');
            await verifyUserServices(user.uid);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setError('Failed to fetch user profile');
        }
      } else {
        console.log('No user signed in, clearing profile');
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting sign in process:', { email });
      setError(null);
      
      const auth_result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Auth successful, fetching user profile');
      
      // Force token refresh to get latest custom claims
      const token = await auth_result.user.getIdTokenResult(true);
      console.log('Token claims:', token.claims);
      
      const userDoc = await getDoc(doc(db, 'users', auth_result.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      const profile = {
        ...(userDoc.data() as User),
        uid: auth_result.user.uid
      };

      // DEBUG: Log admin user role
      if (email === 'Admin@test.com') {
        console.log('Admin user role verification:', {
          uid: profile.uid,
          role: profile.role,
          profileData: profile
        });
      }
      console.log('Profile loaded, navigating based on role:', profile.role);
      
      // Update local state
      setUserProfile(profile);

      // Navigate based on role
      switch (profile.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'professional':
          navigate('/professional/dashboard');
          break;
        case 'pending_professional':
          navigate('/professional/pending');
          break;
        case 'client':
          navigate('/client/dashboard');
          break;
        default:
          navigate('/client/dashboard');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, role: 'client' | 'professional') => {
    try {
      console.log('Starting signup process:', {
        email,
        role,
        typeofRole: typeof role
      });
      setError(null);
      
      // Explicitly determine role before auth creation
      const userRole: UserRole = role === 'professional' ? 'pending_professional' : 'client';
      console.log('Role determined:', {
        providedRole: role,
        determinedRole: userRole,
        isProfessional: role === 'professional'
      });

      // Create auth user
      console.log('Creating auth user');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create the profile document
      const newProfile: User = {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || '',
        photoURL: result.user.photoURL || '',
        role: userRole,
        preferences: {
          notifications: true,
          theme: 'light',
          language: 'en',
        },
        verificationStatus: {
          email: result.user.emailVerified,
          phone: !!result.user.phoneNumber,
          identity: false,
        },
        membershipTier: 'standard',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        failedLoginAttempts: 0,
      };

      // Save to database
      const userRef = doc(db, 'users', result.user.uid);
      console.log('Saving profile to database:', {
        userId: newProfile.uid,
        userRole: newProfile.role
      });
      
      // Use a clean object without any undefined values
      const profileToSave = JSON.parse(JSON.stringify(newProfile));
      await setDoc(userRef, profileToSave);
      
      // Verify the save
      const savedDoc = await getDoc(userRef);
      console.log('Verifying saved profile:', {
        exists: savedDoc.exists(),
        savedRole: savedDoc.data()?.role
      });

      // Update local state
      setUserProfile(newProfile);
      
      // Navigate to pending dashboard for pending professionals
      if (userRole === 'pending_professional') {
        navigate('/professional/pending');
      } else {
        navigate('/client/dashboard');
      }

    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message);
      throw error;
    }
  };

  const handleSocialLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider | OAuthProvider) => {
    try {
      console.log('Starting social login');
      setError(null); 
      
      const result = await signInWithPopup(auth, provider);
      const userRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userRef);
      
      let profile: User;

      if (!userDoc.exists()) {
        console.log('Creating new profile for social login user');
        profile = {
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || '',
          role: 'client',
          preferences: {
            notifications: true,
            theme: 'light',
            language: 'en',
          },
          verificationStatus: {
            email: result.user.emailVerified,
            phone: !!result.user.phoneNumber,
            identity: false,
          },
          membershipTier: 'standard',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          failedLoginAttempts: 0,
        } as User;

        await setDoc(userRef, profile);
      } else {
        console.log('Loading existing profile for social login user');
        profile = userDoc.data() as User;
      }

      setUserProfile(profile);
      
      console.log('Social login successful, navigating based on role:', profile.role);
      switch (profile.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'professional':
          navigate('/professional/dashboard');
          break;
        case 'pending_professional':
          navigate('/professional/registration');
          break;
        case 'client':
          navigate('/client/dashboard');
          break;
        default:
          navigate('/client/dashboard');
      }
    } catch (error: any) {
      console.error('Social login error:', error);
      setError(error.message);
      throw error;
    }
  };

  const signInWithGoogle = () => handleSocialLogin(new GoogleAuthProvider());
  const signInWithFacebook = () => handleSocialLogin(new FacebookAuthProvider());
  const signInWithApple = () => handleSocialLogin(new OAuthProvider('apple.com'));

  const logout = async () => {
    try {
      console.log('Starting logout process');
      setError(null);
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message);
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!currentUser) throw new Error('No user logged in');
    try {
      console.log('Updating user profile:', data);
      const userRef = doc(db, 'users', currentUser.uid);

      // Get current user data first
      const userDoc = await getDoc(userRef);
      const currentData = userDoc.exists() ? userDoc.data() as User : {
        professionalProfile: {},
      } as Partial<User>;

      // Properly merge professionalProfile if it exists
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
        professionalProfile: data.professionalProfile ? {
          ...(currentData.professionalProfile || {}),
          ...data.professionalProfile
        } : currentData.professionalProfile
      };

      await setDoc(userRef, updateData, { merge: true });
      
      // Update local state with merged data
      setUserProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...data,
          professionalProfile: data.professionalProfile ? {
            ...(prev.professionalProfile || {}),
            ...data.professionalProfile
          } : prev.professionalProfile
        };
      });

      return { success: true };
    } catch (error: any) {
      console.error('Profile update error:', error);
      setError(error.message);
      throw error;
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    signIn,
    signUp,
    logout,
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
