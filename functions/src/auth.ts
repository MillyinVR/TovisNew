import { CallableRequest, HttpsError, onCall, HttpsOptions } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if it hasn't been initialized yet
try {
  admin.app();
} catch (e) {
  admin.initializeApp();
}

// Updated CORS configuration to fix token expiration issues
const runtimeOpts: HttpsOptions = {
  region: 'us-central1',
  minInstances: 0,
  cors: [
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:*',
    'https://beautyappaici.web.app', 
    'https://beautyappaici.firebaseapp.com'
  ]
};

export const setAdminClaim = onCall(runtimeOpts, async (request: CallableRequest) => {
  // Verify user is authenticated
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const uid = request.auth.uid;
  const userRef = admin.firestore().collection('users').doc(uid);
  
  try {
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new HttpsError(
        'not-found',
        'User document not found'
      );
    }

    const userData = userDoc.data();
    console.log('User data:', userData);

    if (userData?.role === 'admin') {
      console.log('Setting admin claim for user:', uid);
      
      // Set admin custom claim
      await admin.auth().setCustomUserClaims(uid, { 
        admin: true,
        role: 'admin' // Keep both claims for backward compatibility
      });
      
      // Force token refresh
      await admin.auth().revokeRefreshTokens(uid);

      // Verify claims were set
      const userRecord = await admin.auth().getUser(uid);
      console.log('User custom claims:', userRecord.customClaims);
      
      // Double check the claims are set correctly
      if (!userRecord.customClaims?.admin) {
        console.error('Admin claim was not set properly');
        throw new HttpsError(
          'internal',
          'Failed to set admin claim'
        );
      }
      
      return { 
        success: true,
        claims: userRecord.customClaims
      };
    } else {
      throw new HttpsError(
        'permission-denied',
        'User is not an admin'
      );
    }
  } catch (error) {
    console.error('Error setting admin claim:', error);
    throw new HttpsError(
      'internal',
      'Error setting admin claim'
    );
  }
});

export const setProfessionalClaim = onCall(runtimeOpts, async (request: CallableRequest) => {
  // Verify user is authenticated
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const uid = request.auth.uid;
  const userRef = admin.firestore().collection('users').doc(uid);
  
  try {
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new HttpsError(
        'not-found',
        'User document not found'
      );
    }

    const userData = userDoc.data();
    console.log('User data:', userData);

    // Check if this is a professional user or the test professional account
    const isProfessional = 
      userData?.role === 'professional' || 
      userData?.email === 'professional@test.com';
    
    if (isProfessional) {
      console.log('Setting professional claim for user:', uid);
      
      // Ensure user document has professional role
      if (userData?.role !== 'professional') {
        console.log('Updating user role to professional in Firestore');
        await userRef.update({ role: 'professional' });
      }
      
      try {
        // Set professional custom claim
        await admin.auth().setCustomUserClaims(uid, { 
          professional: true,
          role: 'professional'
        });
        
        // Force token refresh - but don't throw if this fails
        try {
          await admin.auth().revokeRefreshTokens(uid);
        } catch (refreshError) {
          console.warn('Token refresh failed, but continuing:', refreshError);
          // Continue anyway since we've set the claims
        }

        // Verify claims were set
        const userRecord = await admin.auth().getUser(uid);
        console.log('User custom claims:', userRecord.customClaims);
        
        return { 
          success: true,
          claims: userRecord.customClaims,
          documentRole: 'professional' // Include document role for fallback
        };
      } catch (claimError) {
        console.error('Error setting custom claims:', claimError);
        
        // Return partial success - the document role is set correctly
        // even if the claims failed
        return {
          success: false,
          error: 'Failed to set custom claims, but document role is set',
          documentRole: 'professional'
        };
      }
    } else {
      // For test purposes, allow setting professional claim for test account
      if (userData?.email === 'professional@test.com') {
        console.log('Setting professional claim for test user:', uid);
        
        // Update user role to professional
        await userRef.update({ role: 'professional' });
        
        try {
          // Set professional custom claim
          await admin.auth().setCustomUserClaims(uid, { 
            professional: true,
            role: 'professional'
          });
          
          // Force token refresh - but don't throw if this fails
          try {
            await admin.auth().revokeRefreshTokens(uid);
          } catch (refreshError) {
            console.warn('Token refresh failed for test user, but continuing:', refreshError);
          }

          // Verify claims were set
          const userRecord = await admin.auth().getUser(uid);
          console.log('Test user custom claims:', userRecord.customClaims);
          
          return { 
            success: true,
            claims: userRecord.customClaims,
            documentRole: 'professional'
          };
        } catch (claimError) {
          console.error('Error setting custom claims for test user:', claimError);
          
          // Return partial success
          return {
            success: false,
            error: 'Failed to set custom claims for test user, but document role is set',
            documentRole: 'professional'
          };
        }
      } else {
        throw new HttpsError(
          'permission-denied',
          'User is not a professional'
        );
      }
    }
  } catch (error) {
    console.error('Error in setProfessionalClaim function:', error);
    throw new HttpsError(
      'internal',
      'Error setting professional claim'
    );
  }
});
