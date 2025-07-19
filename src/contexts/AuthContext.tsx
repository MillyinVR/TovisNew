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
import { CustomClaims } from '../types/auth';

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
  refreshUserClaims: () => Promise<CustomClaims | null>;
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
  
  // Token refresh interval reference
  const tokenRefreshIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Function to refresh the token and get latest claims
  const refreshUserClaims = async () => {
    try {
      if (auth.currentUser) {
        console.log('Refreshing auth token and claims');
        await auth.currentUser.getIdToken(true);
        const tokenResult = await auth.currentUser.getIdTokenResult();
        console.log('Refreshed token claims:', tokenResult.claims);
        return tokenResult.claims as CustomClaims;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
    return null;
  };

  // Function to determine user role from claims and fallback to document
  const getUserRole = (claims: CustomClaims, documentRole?: UserRole): UserRole => {
    // Primary: Use custom claims
    if (claims.admin || claims.role === 'admin') {
      return 'admin';
    }
    if (claims.professional || claims.role === 'professional') {
      return 'professional';
    }
    if (claims.role === 'pending_professional') {
      return 'pending_professional';
    }
    if (claims.role === 'client') {
      return 'client';
    }
    
    // Fallback: Use document role if no claims are set
    if (documentRole) {
      return documentRole;
    }
    
    // Default: client
    return 'client';
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', {
        userEmail: user?.email,
        hasUser: !!user
      });
      
      setLoading(true);
      
      if (user) {
        try {
          // Get the latest token result to check claims
          const tokenResult = await user.getIdTokenResult(true);
          const claims = tokenResult.claims as CustomClaims;
          console.log('Token claims:', claims);

          // Get user document from the canonical users collection
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            console.log('No user profile found in database - waiting for profile creation');
            setCurrentUser({
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
              role: getUserRole(claims),
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
            });
            setUserProfile(null);
            setLoading(false);
            return;
          }

          const documentData = userDoc.data() as User;
          
          // Determine role using claims first, document as fallback
          const userRole = getUserRole(claims, documentData.role);
          
          const profile: User = {
            ...documentData,
            uid: user.uid, // Ensure we have the uid from Firebase
            role: userRole, // Use the determined role
            professionalVerificationStatus: claims.verificationStatus || documentData.professionalVerificationStatus || 'pending'
          };
          
          console.log('Loaded user profile:', {
            userId: profile.uid,
            userEmail: profile.email,
            userRole: profile.role,
            claimsRole: claims.role,
            documentRole: documentData.role,
            verificationStatus: profile.verificationStatus
          });
          
          setCurrentUser({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            role: userRole,
            phoneNumber: user.phoneNumber || undefined,
            preferences: profile.preferences || {
              notifications: true,
              theme: 'light',
              language: 'en',
            },
            verificationStatus: {
              email: user.emailVerified,
              phone: !!user.phoneNumber,
              identity: false,
            },
            membershipTier: profile.membershipTier || 'standard',
            createdAt: profile.createdAt || serverTimestamp(),
            updatedAt: profile.updatedAt || serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            failedLoginAttempts: profile.failedLoginAttempts || 0,
          });
          
          setUserProfile(profile);
          
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setError('Failed to fetch user profile');
        }
      } else {
        console.log('No user signed in, clearing profile');
        setCurrentUser(null);
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Set up periodic token refresh (every 45 minutes)
    if (currentUser) {
      console.log('Setting up periodic token refresh');
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
      }
      
      tokenRefreshIntervalRef.current = setInterval(refreshUserClaims, 2700000);
      refreshUserClaims();
    }

    return () => {
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
      
      // Get user document from canonical users collection
      let userDoc = await getDoc(doc(db, 'users', auth_result.user.uid));

      // Handle special test accounts
      if (email === 'Admin@test.com') {
        try {
          // Create/update admin user document
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
            await setDoc(doc(db, 'users', auth_result.user.uid), { role: 'admin' }, { merge: true });
            console.log('Updated user role to admin');
          }

          // Set admin claim via cloud function
          console.log('Setting admin claim...');
          const functions = getFunctions();
          const setAdminClaim = httpsCallable(functions, 'setAdminClaim');
          await setAdminClaim();
          
          // Wait for claims to propagate
          await new Promise(resolve => setTimeout(resolve, 2000));
          await auth_result.user.getIdToken(true);
          
          userDoc = await getDoc(doc(db, 'users', auth_result.user.uid));
        } catch (error) {
          console.error('Error setting admin claim:', error);
        }
      } 
      else if (email === 'professional@test.com') {
        try {
          // Create/update professional user document
          if (!userDoc.exists()) {
            const professionalProfile = {
              uid: auth_result.user.uid,
              email: auth_result.user.email,
              role: 'professional',
              name: 'Professional User',
              professionalVerificationStatus: 'approved',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              lastLoginAt: serverTimestamp()
            };
            await setDoc(doc(db, 'users', auth_result.user.uid), professionalProfile);
            console.log('Created professional user document');
          } else if (userDoc.data()?.role !== 'professional') {
            await setDoc(doc(db, 'users', auth_result.user.uid), { 
              role: 'professional',
              professionalVerificationStatus: 'approved'
            }, { merge: true });
            console.log('Updated user role to professional');
          }

          // Set professional claim via cloud function
          console.log('Setting professional claim...');
          const functions = getFunctions();
          const setProfessionalClaim = httpsCallable(functions, 'setProfessionalClaim');
          await setProfessionalClaim();
          
          // Wait for claims to propagate
          await new Promise(resolve => setTimeout(resolve, 2000));
          await auth_result.user.getIdToken(true);
          
          userDoc = await getDoc(doc(db, 'users', auth_result.user.uid));
        } catch (error) {
          console.error('Error setting professional claim:', error);
        }
      }
      else if (email === 'client@test.com') {
        try {
          // Create/update client user document
          if (!userDoc.exists()) {
            const clientProfile = {
              uid: auth_result.user.uid,
              email: auth_result.user.email,
              role: 'client',
              name: 'Client User',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              lastLoginAt: serverTimestamp()
            };
            await setDoc(doc(db, 'users', auth_result.user.uid), clientProfile);
            console.log('Created client user document');
          }
          
          userDoc = await getDoc(doc(db, 'users', auth_result.user.uid));
        } catch (error) {
          console.error('Error setting up client account:', error);
        }
      }
      else if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      // Get fresh token result after claims are set
      const tokenResult = await auth_result.user.getIdTokenResult(true);
      const claims = tokenResult.claims as CustomClaims;
      console.log('Final token claims:', claims);

      // Determine the role using claims and document data
      const documentData = userDoc.data() as User;
      const role = getUserRole(claims, documentData?.role);

      const profile = {
        ...documentData,
        uid: auth_result.user.uid,
        role: role
      };

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
      console.log('Starting signup process:', { email, role });
      setError(null);
      
      // Determine initial role
      const userRole: UserRole = role === 'professional' ? 'pending_professional' : 'client';
      console.log('Role determined:', { providedRole: role, determinedRole: userRole });

      // Create auth user
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create the profile document in the canonical users collection
      const newProfile: User = {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || '',
        photoURL: result.user.photoURL || '',
        role: userRole,
        professionalVerificationStatus: userRole === 'pending_professional' ? 'pending' : undefined,
        preferences: {
          notifications: true,
          theme: 'light',
          language: 'en',
        },
        membershipTier: 'standard',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        failedLoginAttempts: 0,
      };

      // Save to users collection (canonical source of truth)
      const userRef = doc(db, 'users', result.user.uid);
      console.log('Saving profile to users collection:', {
        userId: newProfile.uid,
        userRole: newProfile.role
      });
      
      await setDoc(userRef, newProfile);
      
      // Verify the save
      const savedDoc = await getDoc(userRef);
      console.log('Verifying saved profile:', {
        exists: savedDoc.exists(),
        savedRole: savedDoc.data()?.role
      });

      // Update local state
      setUserProfile(newProfile);
      
      // Navigate based on role
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
          navigate('/professional/pending');
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
      const currentData = userDoc.exists() ? userDoc.data() as User : {} as Partial<User>;

      // Properly merge data
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      await setDoc(userRef, updateData, { merge: true });
      
      // Update local state with merged data
      setUserProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...data,
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
    refreshUserClaims,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
