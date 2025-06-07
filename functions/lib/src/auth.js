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
exports.setProfessionalClaim = exports.setAdminClaim = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin if it hasn't been initialized yet
try {
    admin.app();
}
catch (e) {
    admin.initializeApp();
}
// Updated CORS configuration to fix token expiration issues
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
exports.setAdminClaim = (0, https_1.onCall)(runtimeOpts, async (request) => {
    var _a;
    // Verify user is authenticated
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
        if ((userData === null || userData === void 0 ? void 0 : userData.role) === 'admin') {
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
            if (!((_a = userRecord.customClaims) === null || _a === void 0 ? void 0 : _a.admin)) {
                console.error('Admin claim was not set properly');
                throw new https_1.HttpsError('internal', 'Failed to set admin claim');
            }
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
exports.setProfessionalClaim = (0, https_1.onCall)(runtimeOpts, async (request) => {
    // Verify user is authenticated
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
        // Check if this is a professional user or the test professional account
        const isProfessional = (userData === null || userData === void 0 ? void 0 : userData.role) === 'professional' ||
            (userData === null || userData === void 0 ? void 0 : userData.email) === 'professional@test.com';
        if (isProfessional) {
            console.log('Setting professional claim for user:', uid);
            // Ensure user document has professional role
            if ((userData === null || userData === void 0 ? void 0 : userData.role) !== 'professional') {
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
                }
                catch (refreshError) {
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
            }
            catch (claimError) {
                console.error('Error setting custom claims:', claimError);
                // Return partial success - the document role is set correctly
                // even if the claims failed
                return {
                    success: false,
                    error: 'Failed to set custom claims, but document role is set',
                    documentRole: 'professional'
                };
            }
        }
        else {
            // For test purposes, allow setting professional claim for test account
            if ((userData === null || userData === void 0 ? void 0 : userData.email) === 'professional@test.com') {
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
                    }
                    catch (refreshError) {
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
                }
                catch (claimError) {
                    console.error('Error setting custom claims for test user:', claimError);
                    // Return partial success
                    return {
                        success: false,
                        error: 'Failed to set custom claims for test user, but document role is set',
                        documentRole: 'professional'
                    };
                }
            }
            else {
                throw new https_1.HttpsError('permission-denied', 'User is not a professional');
            }
        }
    }
    catch (error) {
        console.error('Error in setProfessionalClaim function:', error);
        throw new https_1.HttpsError('internal', 'Error setting professional claim');
    }
});
//# sourceMappingURL=auth.js.map