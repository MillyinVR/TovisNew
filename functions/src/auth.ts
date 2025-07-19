import { CallableRequest, HttpsError, onCall, HttpsOptions } from 'firebase-functions/v2/https';
import { onDocumentUpdated, onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if it hasn't been initialized yet
try {
  admin.app();
} catch (e) {
  admin.initializeApp();
}

// Updated CORS configuration
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

// Helper function to set custom claims based on user role and verification status
async function setUserClaims(uid: string, role: string, verificationStatus?: string): Promise<void> {
  const claims: Record<string, any> = { role };

  // Set role-specific claims
  switch (role) {
    case 'admin':
      claims.admin = true;
      break;
    case 'professional':
      claims.professional = true;
      if (verificationStatus) {
        claims.verificationStatus = verificationStatus;
      }
      break;
    case 'pending_professional':
      claims.verificationStatus = 'pending';
      break;
    case 'client':
      // No additional claims needed for clients
      break;
  }

  console.log(`Setting claims for user ${uid}:`, claims);
  await admin.auth().setCustomUserClaims(uid, claims);
  
  // Force token refresh
  await admin.auth().revokeRefreshTokens(uid);
}

// Cloud function to automatically update claims when user document changes
export const updateUserClaims = onDocumentUpdated('users/{userId}', async (event) => {
  const userId = event.params.userId;
  const beforeData = event.data?.before.data();
  const afterData = event.data?.after.data();

  if (!afterData) {
    console.log(`User document ${userId} was deleted, removing claims`);
    await admin.auth().setCustomUserClaims(userId, {});
    return;
  }

  const oldRole = beforeData?.role;
  const newRole = afterData.role;
  const verificationStatus = afterData.professionalVerificationStatus;

  // Only update claims if role changed or verification status changed
  if (oldRole !== newRole || beforeData?.professionalVerificationStatus !== verificationStatus) {
    console.log(`Role or verification changed for user ${userId}: ${oldRole} -> ${newRole}, verification: ${verificationStatus}`);
    await setUserClaims(userId, newRole, verificationStatus);
  }
});

// Cloud function to set claims when user document is created
export const setInitialUserClaims = onDocumentCreated('users/{userId}', async (event) => {
  const userId = event.params.userId;
  const userData = event.data?.data();

  if (!userData) {
    console.log(`No data found for new user ${userId}`);
    return;
  }

  const role = userData.role;
  const verificationStatus = userData.professionalVerificationStatus;

  console.log(`Setting initial claims for new user ${userId} with role ${role}`);
  await setUserClaims(userId, role, verificationStatus);
});

// Cloud function to update claims when verification status changes
export const updateVerificationClaims = onDocumentUpdated('verifications/{userId}', async (event) => {
  const userId = event.params.userId;
  const afterData = event.data?.after.data();

  if (!afterData) {
    console.log(`Verification document ${userId} was deleted`);
    return;
  }

  // Get user document to check current role
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  if (!userDoc.exists) {
    console.log(`User document ${userId} not found`);
    return;
  }

  const userData = userDoc.data();
  const userRole = userData?.role;
  const verificationStatus = afterData.status;

  console.log(`Verification status changed for user ${userId}: ${verificationStatus}`);

  // If professional verification is approved, update role from pending_professional to professional
  if (userRole === 'pending_professional' && verificationStatus === 'approved') {
    console.log(`Promoting user ${userId} from pending_professional to professional`);
    
    // Update user document
    await admin.firestore().collection('users').doc(userId).update({
      role: 'professional',
      professionalVerificationStatus: 'approved',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Claims will be updated by the updateUserClaims function
  } else {
    // Just update verification status in claims
    await setUserClaims(userId, userRole, verificationStatus);
  }
});

// Manual function to set admin claim (for testing)
export const setAdminClaim = onCall(runtimeOpts, async (request: CallableRequest) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const uid = request.auth.uid;
  const userRef = admin.firestore().collection('users').doc(uid);
  
  try {
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User document not found');
    }

    const userData = userDoc.data();
    console.log('User data:', userData);

    if (userData?.role === 'admin' || userData?.email === 'Admin@test.com') {
      console.log('Setting admin claim for user:', uid);
      
      // Update user document if needed
      if (userData?.role !== 'admin') {
        await userRef.update({ role: 'admin' });
      }
      
      // Set admin custom claim
      await setUserClaims(uid, 'admin');
      
      // Verify claims were set
      const userRecord = await admin.auth().getUser(uid);
      console.log('User custom claims:', userRecord.customClaims);
      
      return { 
        success: true,
        claims: userRecord.customClaims
      };
    } else {
      throw new HttpsError('permission-denied', 'User is not an admin');
    }
  } catch (error) {
    console.error('Error setting admin claim:', error);
    throw new HttpsError('internal', 'Error setting admin claim');
  }
});

// Manual function to set professional claim (for testing)
export const setProfessionalClaim = onCall(runtimeOpts, async (request: CallableRequest) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const uid = request.auth.uid;
  const userRef = admin.firestore().collection('users').doc(uid);
  
  try {
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new HttpsError('not-found', 'User document not found');
    }

    const userData = userDoc.data();
    console.log('User data:', userData);

    const isProfessional = 
      userData?.role === 'professional' || 
      userData?.email === 'professional@test.com';
    
    if (isProfessional) {
      console.log('Setting professional claim for user:', uid);
      
      // Update user document if needed
      if (userData?.role !== 'professional') {
        await userRef.update({ role: 'professional' });
      }
      
      // Set professional custom claim
      await setUserClaims(uid, 'professional', userData?.professionalVerificationStatus);
      
      // Verify claims were set
      const userRecord = await admin.auth().getUser(uid);
      console.log('User custom claims:', userRecord.customClaims);
      
      return { 
        success: true,
        claims: userRecord.customClaims
      };
    } else {
      throw new HttpsError('permission-denied', 'User is not a professional');
    }
  } catch (error) {
    console.error('Error setting professional claim:', error);
    throw new HttpsError('internal', 'Error setting professional claim');
  }
});

// Function to approve professional verification
export const approveProfessionalVerification = onCall(runtimeOpts, async (request: CallableRequest) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check if user is admin
  const adminUserDoc = await admin.firestore().collection('users').doc(request.auth.uid).get();
  if (!adminUserDoc.exists || adminUserDoc.data()?.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only admins can approve verifications');
  }

  const { userId, notes } = request.data;
  
  if (!userId) {
    throw new HttpsError('invalid-argument', 'userId is required');
  }

  try {
    const batch = admin.firestore().batch();
    
    // Update verification document
    const verificationRef = admin.firestore().collection('verifications').doc(userId);
    batch.update(verificationRef, {
      status: 'approved',
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      reviewedBy: request.auth.uid,
      notes: notes || 'Approved by admin'
    });
    
    // Update user document
    const userRef = admin.firestore().collection('users').doc(userId);
    batch.update(userRef, {
      role: 'professional',
      professionalVerificationStatus: 'approved',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    await batch.commit();
    
    console.log(`Professional verification approved for user ${userId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error approving professional verification:', error);
    throw new HttpsError('internal', 'Error approving verification');
  }
});

// Function to reject professional verification
export const rejectProfessionalVerification = onCall(runtimeOpts, async (request: CallableRequest) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Check if user is admin
  const adminUserDoc = await admin.firestore().collection('users').doc(request.auth.uid).get();
  if (!adminUserDoc.exists || adminUserDoc.data()?.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only admins can reject verifications');
  }

  const { userId, notes } = request.data;
  
  if (!userId) {
    throw new HttpsError('invalid-argument', 'userId is required');
  }

  try {
    const batch = admin.firestore().batch();
    
    // Update verification document
    const verificationRef = admin.firestore().collection('verifications').doc(userId);
    batch.update(verificationRef, {
      status: 'rejected',
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      reviewedBy: request.auth.uid,
      notes: notes || 'Rejected by admin'
    });
    
    // Update user document
    const userRef = admin.firestore().collection('users').doc(userId);
    batch.update(userRef, {
      professionalVerificationStatus: 'rejected',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    await batch.commit();
    
    console.log(`Professional verification rejected for user ${userId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error rejecting professional verification:', error);
    throw new HttpsError('internal', 'Error rejecting verification');
  }
});
