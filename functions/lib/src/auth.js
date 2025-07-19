"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectProfessionalVerification = exports.approveProfessionalVerification = exports.setProfessionalClaim = exports.setAdminClaim = exports.updateVerificationClaims = exports.setInitialUserClaims = exports.updateUserClaims = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin if it hasn't been initialized yet
try {
    admin.app();
}
catch (e) {
    admin.initializeApp();
}
// Updated CORS configuration
const runtimeOpts = {
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
async function setUserClaims(uid, role, verificationStatus) {
    const claims = { role };
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
exports.updateUserClaims = (0, firestore_1.onDocumentUpdated)('users/{userId}', async (event) => {
    var _a, _b;
    const userId = event.params.userId;
    const beforeData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
    const afterData = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
    if (!afterData) {
        console.log(`User document ${userId} was deleted, removing claims`);
        await admin.auth().setCustomUserClaims(userId, {});
        return;
    }
    const oldRole = beforeData === null || beforeData === void 0 ? void 0 : beforeData.role;
    const newRole = afterData.role;
    const verificationStatus = afterData.professionalVerificationStatus;
    // Only update claims if role changed or verification status changed
    if (oldRole !== newRole || (beforeData === null || beforeData === void 0 ? void 0 : beforeData.professionalVerificationStatus) !== verificationStatus) {
        console.log(`Role or verification changed for user ${userId}: ${oldRole} -> ${newRole}, verification: ${verificationStatus}`);
        await setUserClaims(userId, newRole, verificationStatus);
    }
});
// Cloud function to set claims when user document is created
exports.setInitialUserClaims = (0, firestore_1.onDocumentCreated)('users/{userId}', async (event) => {
    var _a;
    const userId = event.params.userId;
    const userData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
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
exports.updateVerificationClaims = (0, firestore_1.onDocumentUpdated)('verifications/{userId}', async (event) => {
    var _a;
    const userId = event.params.userId;
    const afterData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.after.data();
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
    const userRole = userData === null || userData === void 0 ? void 0 : userData.role;
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
    }
    else {
        // Just update verification status in claims
        await setUserClaims(userId, userRole, verificationStatus);
    }
});
// Manual function to set admin claim (for testing)
exports.setAdminClaim = (0, https_1.onCall)(runtimeOpts, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const uid = request.auth.uid;
    const userRef = admin.firestore().collection('users').doc(uid);
    try {
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new https_1.HttpsError('not-found', 'User document not found');
        }
        const userData = userDoc.data();
        console.log('User data:', userData);
        if ((userData === null || userData === void 0 ? void 0 : userData.role) === 'admin' || (userData === null || userData === void 0 ? void 0 : userData.email) === 'Admin@test.com') {
            console.log('Setting admin claim for user:', uid);
            // Update user document if needed
            if ((userData === null || userData === void 0 ? void 0 : userData.role) !== 'admin') {
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
        }
        else {
            throw new https_1.HttpsError('permission-denied', 'User is not an admin');
        }
    }
    catch (error) {
        console.error('Error setting admin claim:', error);
        throw new https_1.HttpsError('internal', 'Error setting admin claim');
    }
});
// Manual function to set professional claim (for testing)
exports.setProfessionalClaim = (0, https_1.onCall)(runtimeOpts, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const uid = request.auth.uid;
    const userRef = admin.firestore().collection('users').doc(uid);
    try {
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new https_1.HttpsError('not-found', 'User document not found');
        }
        const userData = userDoc.data();
        console.log('User data:', userData);
        const isProfessional = (userData === null || userData === void 0 ? void 0 : userData.role) === 'professional' ||
            (userData === null || userData === void 0 ? void 0 : userData.email) === 'professional@test.com';
        if (isProfessional) {
            console.log('Setting professional claim for user:', uid);
            // Update user document if needed
            if ((userData === null || userData === void 0 ? void 0 : userData.role) !== 'professional') {
                await userRef.update({ role: 'professional' });
            }
            // Set professional custom claim
            await setUserClaims(uid, 'professional', userData === null || userData === void 0 ? void 0 : userData.professionalVerificationStatus);
            // Verify claims were set
            const userRecord = await admin.auth().getUser(uid);
            console.log('User custom claims:', userRecord.customClaims);
            return {
                success: true,
                claims: userRecord.customClaims
            };
        }
        else {
            throw new https_1.HttpsError('permission-denied', 'User is not a professional');
        }
    }
    catch (error) {
        console.error('Error setting professional claim:', error);
        throw new https_1.HttpsError('internal', 'Error setting professional claim');
    }
});
// Function to approve professional verification
exports.approveProfessionalVerification = (0, https_1.onCall)(runtimeOpts, async (request) => {
    var _a;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    // Check if user is admin
    const adminUserDoc = await admin.firestore().collection('users').doc(request.auth.uid).get();
    if (!adminUserDoc.exists || ((_a = adminUserDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
        throw new https_1.HttpsError('permission-denied', 'Only admins can approve verifications');
    }
    const { userId, notes } = request.data;
    if (!userId) {
        throw new https_1.HttpsError('invalid-argument', 'userId is required');
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
    }
    catch (error) {
        console.error('Error approving professional verification:', error);
        throw new https_1.HttpsError('internal', 'Error approving verification');
    }
});
// Function to reject professional verification
exports.rejectProfessionalVerification = (0, https_1.onCall)(runtimeOpts, async (request) => {
    var _a;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    // Check if user is admin
    const adminUserDoc = await admin.firestore().collection('users').doc(request.auth.uid).get();
    if (!adminUserDoc.exists || ((_a = adminUserDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== 'admin') {
        throw new https_1.HttpsError('permission-denied', 'Only admins can reject verifications');
    }
    const { userId, notes } = request.data;
    if (!userId) {
        throw new https_1.HttpsError('invalid-argument', 'userId is required');
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
    }
    catch (error) {
        console.error('Error rejecting professional verification:', error);
        throw new https_1.HttpsError('internal', 'Error rejecting verification');
    }
});
//# sourceMappingURL=auth.js.map