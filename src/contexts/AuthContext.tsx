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
import { getFunctions, httpsCallable } from 'firebase/functions';
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
  
  // Add a token refresh interval reference
  const tokenRefreshIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Function to refresh the token
  const refreshToken = async () => {
    try {
      if (auth.currentUser) {
        console.log('Refreshing auth token periodically');
        await auth.currentUser.getIdToken(true);
        console.log('Token refreshed successfully');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', {
        userEmail: user?.email,
        hasUser: !!user
      });
      
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
          // Get the latest token result to check claims
          const tokenResult = await user.getIdTokenResult(true);
          console.log('Token claims:', tokenResult.claims);

          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            console.log('No user profile found in database - waiting for profile creation');
            setLoading(false);
            return;
          }

          const profile = {
            ...(userDoc.data() as User),
            uid: user.uid, // Ensure we have the uid from Firebase
            // Override role based on claims
            role: tokenResult.claims.admin || tokenResult.claims.role === 'admin' 
              ? 'admin' 
              : tokenResult.claims.professional || tokenResult.claims.role === 'professional'
                ? 'professional'
                : (userDoc.data() as User).role
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

    // Set up periodic token refresh (every 45 minutes)
    // Firebase tokens expire after 1 hour by default, so refresh before that
    if (currentUser) {
      console.log('Setting up periodic token refresh');
      // Clear any existing interval
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
      }
      
      // Set new interval - refresh every 45 minutes (2,700,000 ms)
      tokenRefreshIntervalRef.current = setInterval(refreshToken, 2700000);
      
      // Do an initial refresh
      refreshToken();
    }

    return () => {
      // Clean up the interval when the component unmounts
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
        tokenRefreshIntervalRef.current = null;
      }
      unsubscribe();
    };
  }, [currentUser?.uid]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting sign in process:', { email });
      setError(null);
      
      const auth_result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Auth successful, fetching user profile');
      
      let userDoc = await getDoc(doc(db, 'users', auth_result.user.uid));

      // If this is the admin user, ensure admin document exists and set custom claim
      if (email === 'Admin@test.com') {
        try {
          // Create admin user document if it doesn't exist
          if (!userDoc.exists()) {
            const adminProfile = {
              uid: auth_result.user.uid,
              email: auth_result.user.email,
              role: 'admin',
              name: 'Admin User',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              lastLoginAt: serverTimestamp()
            };
            await setDoc(doc(db, 'users', auth_result.user.uid), adminProfile);
            console.log('Created admin user document');
          } else if (userDoc.data()?.role !== 'admin') {
            // Update role to admin if not already
            await setDoc(doc(db, 'users', auth_result.user.uid), { role: 'admin' }, { merge: true });
            console.log('Updated user role to admin');
          }

          console.log('Setting admin claim...');
          const functions = getFunctions();
          const setAdminClaim = httpsCallable(functions, 'setAdminClaim');
          const result = await setAdminClaim();
          console.log('Admin claim result:', result);
          
          // Force token refresh and wait for it
          await auth_result.user.getIdToken(true);
          const decodedToken = await auth_result.user.getIdTokenResult();
          console.log('New token claims:', decodedToken.claims);

          // Wait for claims to propagate and verify
          let attempts = 0;
          const maxAttempts = 5;
          let claimsVerified = false;
          
          while (attempts < maxAttempts && !claimsVerified) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const newTokenResult = await auth_result.user.getIdTokenResult(true);
            console.log(`Attempt ${attempts + 1}: Verifying admin claims:`, newTokenResult.claims);
            
            console.log('Token result in AuthContext:', newTokenResult);
            // Check for either admin:true or role:'admin' claim
            if (newTokenResult.claims.admin || newTokenResult.claims.role === 'admin') {
              claimsVerified = true;
              console.log('Admin access verified via claims:', newTokenResult.claims);
            } else {
              attempts++;
              console.log(`Admin claims not found, attempt ${attempts} of ${maxAttempts}`);
            }
          }

          if (!claimsVerified) {
            console.error('Failed to verify admin claims after multiple attempts');
            throw new Error('Failed to set admin permissions');
          }

          // Fetch updated user doc after claims are verified
          userDoc = await getDoc(doc(db, 'users', auth_result.user.uid));
        } catch (error) {
          console.error('Error setting admin claim:', error);
        }
      } 
      // If this is a professional user, ensure professional claim is set
      else if (email === 'professional@test.com' || (userDoc.exists() && userDoc.data()?.role === 'professional')) {
        try {
          // First, ensure the user document has the correct role
          if (userDoc.exists() && userDoc.data()?.role !== 'professional') {
            // Update role to professional if not already
            await setDoc(doc(db, 'users', auth_result.user.uid), { role: 'professional' }, { merge: true });
            console.log('Updated user role to professional');
            // Refresh the user document
            userDoc = await getDoc(doc(db, 'users', auth_result.user.uid));
          }
          
          // Set professional claim - but don't rely on it for authentication
          console.log('Setting professional claim (but will use document-based role as primary)...');
          
          try {
            // Call the cloud function to set the claim, but don't wait for it
            // This avoids blocking the login process if there are token issues
            const functions = getFunctions();
            const setProfessionalClaim = httpsCallable(functions, 'setProfessionalClaim');
            
            // Fire and forget - we'll use document-based role regardless
            setProfessionalClaim()
              .then(result => {
                console.log('Professional claim result:', result);
              })
              .catch(error => {
                console.log('Error setting professional claim, but continuing with document-based role:', error);
              });
            
            // Don't attempt token refresh here - we'll use document-based role
            console.log('Using document-based role for professional authentication');
            
          } catch (claimError) {
            console.error('Error calling setProfessionalClaim function:', claimError);
            console.log('Continuing with document-based role assignment as fallback');
          }
        } catch (error) {
          console.error('Error in professional role process:', error);
          console.log('Continuing with document-based role assignment as fallback');
        }
      } else if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      // Get fresh token result after claims are set
      let tokenClaims: Record<string, any> = {};
      try {
        const tokenResult = await auth_result.user.getIdTokenResult(true);
        tokenClaims = tokenResult.claims as Record<string, any>;
        console.log('Final token claims:', tokenClaims);
      } catch (error) {
        console.log('Error getting final token, using document-based role');
        // If we can't get the token, use the document-based role
      }

      // Determine the role based on claims or document data
      let role: UserRole = 'client';
      
      // First try to use claims
      if (tokenClaims.admin || tokenClaims.role === 'admin') {
        role = 'admin';
      } else if (tokenClaims.professional || tokenClaims.role === 'professional') {
        role = 'professional';
      } 
      // If no claims or claims don't indicate a special role, use document data
      else if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData?.role === 'admin') {
          role = 'admin';
        } else if (userData?.role === 'professional') {
          role = 'professional';
        } else if (userData?.role === 'pending_professional') {
          role = 'pending_professional';
        } else {
          role = 'client';
        }
      }

      const profile = {
        ...(userDoc.data() as User),
        uid: auth_result.user.uid,
        role: role
      };

      // DEBUG: Log user role verification
      if (email === 'Admin@test.com') {
        console.log('Admin user role verification:', {
          uid: profile.uid,
          role: profile.role,
          profileData: profile
        });
      } else if (email === 'professional@test.com') {
        console.log('Professional user role verification:', {
          uid: profile.uid,
          role: profile.role,
          profileData: profile,
          claims: tokenClaims
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
