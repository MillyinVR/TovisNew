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
exports.createUserRecommendations = exports.createUserActivity = exports.updateContentEngagement = exports.updateGeoIndex = exports.syncPortfolioToContent = exports.syncUserToRoleCollection = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin if it hasn't been initialized yet
try {
    admin.app();
}
catch (e) {
    admin.initializeApp();
}
// Initialize Firestore
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;
/**
 * Cloud Function to sync user data to role-specific collections
 * Triggered when a user document is created or updated in the users collection
 */
exports.syncUserToRoleCollection = functions.firestore
    .document('users/{userId}')
    .onWrite(async (change, context) => {
    const userId = context.params.userId;
    const afterData = change.after.exists ? change.after.data() : null;
    const beforeData = change.before.exists ? change.before.data() : null;
    // If document was deleted, we don't need to do anything
    if (!afterData) {
        console.log(`User document ${userId} was deleted, no sync needed`);
        return null;
    }
    // Determine the role
    const role = afterData.role;
    if (!role) {
        console.log(`User ${userId} has no role defined, skipping sync`);
        return null;
    }
    // Determine target collection based on role
    let targetCollection;
    switch (role) {
        case 'admin':
            targetCollection = 'admins';
            break;
        case 'professional':
        case 'pending_professional':
            targetCollection = 'professionals';
            break;
        case 'client':
            targetCollection = 'clients';
            break;
        default:
            console.log(`Unknown role: ${role} for user ${userId}, skipping sync`);
            return null;
    }
    // Check if role has changed
    const roleChanged = beforeData && beforeData.role !== afterData.role;
    // If role changed, remove from old collection
    if (roleChanged && (beforeData === null || beforeData === void 0 ? void 0 : beforeData.role)) {
        let oldCollection;
        switch (beforeData.role) {
            case 'admin':
                oldCollection = 'admins';
                break;
            case 'professional':
            case 'pending_professional':
                oldCollection = 'professionals';
                break;
            case 'client':
                oldCollection = 'clients';
                break;
        }
        if (oldCollection) {
            try {
                await db.collection(oldCollection).doc(userId).delete();
                console.log(`Removed user ${userId} from ${oldCollection} collection due to role change`);
            }
            catch (error) {
                console.error(`Error removing user ${userId} from ${oldCollection}:`, error);
            }
        }
    }
    // Create or update document in target collection
    try {
        const targetDocRef = db.collection(targetCollection).doc(userId);
        const targetDoc = await targetDocRef.get();
        if (!targetDoc.exists) {
            // Create new document
            await targetDocRef.set(Object.assign(Object.assign({}, afterData), { updatedAt: FieldValue.serverTimestamp() }));
            console.log(`Created new document for user ${userId} in ${targetCollection} collection`);
        }
        else {
            // Update existing document
            await targetDocRef.update(Object.assign(Object.assign({}, afterData), { updatedAt: FieldValue.serverTimestamp() }));
            console.log(`Updated document for user ${userId} in ${targetCollection} collection`);
        }
        return { success: true };
    }
    catch (error) {
        console.error(`Error syncing user ${userId} to ${targetCollection}:`, error);
        return { error: error.message || 'Unknown error' };
    }
});
/**
 * Cloud Function to sync portfolio items to content collection
 * Triggered when a portfolio item is created or updated in a professional's portfolio subcollection
 */
exports.syncPortfolioToContent = functions.firestore
    .document('professionals/{professionalId}/portfolio/{itemId}')
    .onWrite(async (change, context) => {
    const { professionalId, itemId } = context.params;
    const afterData = change.after.exists ? change.after.data() : null;
    // Get content document reference
    const contentRef = db.collection('content').doc(itemId);
    // If portfolio item was deleted, delete from content collection
    if (!afterData) {
        try {
            await contentRef.delete();
            console.log(`Deleted content ${itemId} for professional ${professionalId}`);
            return null;
        }
        catch (error) {
            console.error(`Error deleting content ${itemId}:`, error);
            return { error: error.message || 'Unknown error' };
        }
    }
    try {
        // Get professional data for additional context
        const professionalRef = db.collection('professionals').doc(professionalId);
        const professionalDoc = await professionalRef.get();
        if (!professionalDoc.exists) {
            console.log(`Professional ${professionalId} not found, skipping content sync`);
            return null;
        }
        const professionalData = professionalDoc.data();
        // Create or update content document
        const contentData = {
            professionalId,
            professionalName: (professionalData === null || professionalData === void 0 ? void 0 : professionalData.displayName) || (professionalData === null || professionalData === void 0 ? void 0 : professionalData.name) || 'Professional',
            professionalImage: (professionalData === null || professionalData === void 0 ? void 0 : professionalData.photoURL) || (professionalData === null || professionalData === void 0 ? void 0 : professionalData.profilePhotoUrl) || null,
            type: afterData.type || 'image',
            url: afterData.url,
            thumbnail: afterData.thumbnail || afterData.url,
            caption: afterData.caption || '',
            serviceIds: afterData.serviceIds || (afterData.serviceId ? [afterData.serviceId] : []),
            categoryIds: afterData.categoryIds || (afterData.category ? [afterData.category] : []),
            tags: afterData.tags || [],
            location: (professionalData === null || professionalData === void 0 ? void 0 : professionalData.location) || null,
            createdAt: afterData.createdAt || FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            views: afterData.views || 0,
            likes: afterData.likes || 0,
            comments: afterData.comments || 0,
            engagementScore: calculateEngagementScore(afterData),
            algorithmScore: 0, // Will be calculated by a separate process
            isPublished: afterData.isPublished !== false // Default to true if not specified
        };
        await contentRef.set(contentData, { merge: true });
        console.log(`Synced portfolio item ${itemId} to content collection for professional ${professionalId}`);
        // Update theLooks collection
        if (contentData.isPublished) {
            await updateTheLooks(itemId, contentData);
        }
        return { success: true };
    }
    catch (error) {
        console.error(`Error syncing portfolio item ${itemId} to content:`, error);
        return { error: error.message || 'Unknown error' };
    }
});
/**
 * Cloud Function to update geoIndex when a professional's location changes
 * Triggered when a professional document is updated
 */
exports.updateGeoIndex = functions.firestore
    .document('professionals/{professionalId}')
    .onUpdate(async (change, context) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    const professionalId = context.params.professionalId;
    const afterData = change.after.data() || {};
    const beforeData = change.before.data() || {};
    // Check if location has changed
    const locationChanged = !((_b = (_a = beforeData.location) === null || _a === void 0 ? void 0 : _a.coordinates) === null || _b === void 0 ? void 0 : _b.lat) ||
        !((_d = (_c = beforeData.location) === null || _c === void 0 ? void 0 : _c.coordinates) === null || _d === void 0 ? void 0 : _d.lng) ||
        !((_f = (_e = afterData.location) === null || _e === void 0 ? void 0 : _e.coordinates) === null || _f === void 0 ? void 0 : _f.lat) ||
        !((_h = (_g = afterData.location) === null || _g === void 0 ? void 0 : _g.coordinates) === null || _h === void 0 ? void 0 : _h.lng) ||
        beforeData.location.coordinates.lat !== afterData.location.coordinates.lat ||
        beforeData.location.coordinates.lng !== afterData.location.coordinates.lng;
    if (!locationChanged) {
        console.log(`Location for professional ${professionalId} has not changed, skipping geoIndex update`);
        return null;
    }
    try {
        // If old location exists, remove from old geohash
        if (((_k = (_j = beforeData.location) === null || _j === void 0 ? void 0 : _j.coordinates) === null || _k === void 0 ? void 0 : _k.lat) && ((_m = (_l = beforeData.location) === null || _l === void 0 ? void 0 : _l.coordinates) === null || _m === void 0 ? void 0 : _m.lng)) {
            const oldGeohash = generateGeohash(beforeData.location.coordinates.lat, beforeData.location.coordinates.lng);
            const oldGeoRef = db.collection('geoIndex').doc(oldGeohash);
            const oldGeoDoc = await oldGeoRef.get();
            if (oldGeoDoc.exists) {
                const oldGeoData = oldGeoDoc.data() || {};
                const professionalIds = (oldGeoData.professionalIds || []).filter((id) => id !== professionalId);
                if (professionalIds.length > 0) {
                    await oldGeoRef.update({
                        professionalIds,
                        updatedAt: FieldValue.serverTimestamp()
                    });
                }
                else {
                    await oldGeoRef.delete();
                }
                console.log(`Removed professional ${professionalId} from geohash ${oldGeohash}`);
            }
        }
        // If new location exists, add to new geohash
        if (((_p = (_o = afterData.location) === null || _o === void 0 ? void 0 : _o.coordinates) === null || _p === void 0 ? void 0 : _p.lat) && ((_r = (_q = afterData.location) === null || _q === void 0 ? void 0 : _q.coordinates) === null || _r === void 0 ? void 0 : _r.lng)) {
            const newGeohash = generateGeohash(afterData.location.coordinates.lat, afterData.location.coordinates.lng);
            const newGeoRef = db.collection('geoIndex').doc(newGeohash);
            const newGeoDoc = await newGeoRef.get();
            // Get professional's services
            const servicesSnapshot = await db.collection('professionals').doc(professionalId)
                .collection('services').get();
            const serviceIds = servicesSnapshot.docs.map(doc => doc.id);
            if (newGeoDoc.exists) {
                const newGeoData = newGeoDoc.data() || {};
                const professionalIds = [...new Set([...(newGeoData.professionalIds || []), professionalId])];
                const allServiceIds = [...new Set([...(newGeoData.serviceIds || []), ...serviceIds])];
                await newGeoRef.update({
                    professionalIds,
                    serviceIds: allServiceIds,
                    updatedAt: FieldValue.serverTimestamp()
                });
            }
            else {
                await newGeoRef.set({
                    professionalIds: [professionalId],
                    serviceIds: serviceIds,
                    updatedAt: FieldValue.serverTimestamp()
                });
            }
            console.log(`Added professional ${professionalId} to geohash ${newGeohash}`);
        }
        return { success: true };
    }
    catch (error) {
        console.error(`Error updating geoIndex for professional ${professionalId}:`, error);
        return { error: error.message || 'Unknown error' };
    }
});
/**
 * Cloud Function to update content engagement metrics
 * Triggered when a content document is updated with new views, likes, or comments
 */
exports.updateContentEngagement = functions.firestore
    .document('content/{contentId}')
    .onUpdate(async (change, context) => {
    const contentId = context.params.contentId;
    const afterData = change.after.data() || {};
    const beforeData = change.before.data() || {};
    // Check if engagement metrics have changed
    const engagementChanged = beforeData.views !== afterData.views ||
        beforeData.likes !== afterData.likes ||
        beforeData.comments !== afterData.comments;
    if (!engagementChanged) {
        return null;
    }
    try {
        // Calculate new engagement score
        const engagementScore = calculateEngagementScore(afterData);
        // Update content document with new engagement score
        await change.after.ref.update({
            engagementScore,
            updatedAt: FieldValue.serverTimestamp()
        });
        // Update theLooks collection
        await updateTheLooks(contentId, Object.assign(Object.assign({}, afterData), { engagementScore }));
        return { success: true };
    }
    catch (error) {
        console.error(`Error updating engagement for content ${contentId}:`, error);
        return { error: error.message || 'Unknown error' };
    }
});
/**
 * Cloud Function to create user activity document when a new user is created
 * Triggered when a new user document is created
 */
exports.createUserActivity = functions.firestore
    .document('users/{userId}')
    .onCreate(async (snapshot, context) => {
    const userId = context.params.userId;
    try {
        const activityRef = db.collection('userActivity').doc(`${userId}_activity`);
        await activityRef.set({
            userId,
            viewedContent: [],
            likedContent: [],
            viewedProfessionals: [],
            viewedServices: [],
            searchHistory: [],
            categoryPreferences: {},
            lastActive: FieldValue.serverTimestamp(),
            createdAt: FieldValue.serverTimestamp()
        });
        console.log(`Created activity document for user ${userId}`);
        return { success: true };
    }
    catch (error) {
        console.error(`Error creating activity for user ${userId}:`, error);
        return { error: error.message || 'Unknown error' };
    }
});
/**
 * Cloud Function to create initial user recommendations
 * Triggered when a new user activity document is created
 */
exports.createUserRecommendations = functions.firestore
    .document('userActivity/{activityId}')
    .onCreate(async (snapshot, context) => {
    const activityId = context.params.activityId;
    const userId = activityId.split('_')[0];
    try {
        // Get top trending content
        const trendingSnapshot = await db.collection('theLooks')
            .orderBy('trendingScore', 'desc')
            .limit(20)
            .get();
        const recommendedContent = trendingSnapshot.docs.map(doc => ({
            contentId: doc.data().contentId,
            score: doc.data().trendingScore
        }));
        // Create recommendations document
        const recommendationsRef = db.collection('userRecommendations').doc(`${userId}_recommendations`);
        await recommendationsRef.set({
            userId,
            recommendedContent,
            recommendedProfessionals: [],
            recommendedServices: [],
            generatedAt: FieldValue.serverTimestamp()
        });
        console.log(`Created recommendations for user ${userId}`);
        return { success: true };
    }
    catch (error) {
        console.error(`Error creating recommendations for user ${userId}:`, error);
        return { error: error.message || 'Unknown error' };
    }
});
// Helper function to calculate engagement score
function calculateEngagementScore(data) {
    // Simple engagement score formula
    // You can adjust weights based on your business logic
    const viewWeight = 1;
    const likeWeight = 5;
    const commentWeight = 10;
    const views = data.views || 0;
    const likes = data.likes || 0;
    const comments = data.comments || 0;
    return (views * viewWeight) + (likes * likeWeight) + (comments * commentWeight);
}
// Helper function to update theLooks collection
async function updateTheLooks(contentId, contentData) {
    var _a;
    try {
        const looksRef = db.collection('theLooks').doc(contentId);
        const looksDoc = await looksRef.get();
        // Calculate trending score
        // This is a simple formula that considers recency and engagement
        // You can adjust this based on your business logic
        const now = admin.firestore.Timestamp.now().toMillis();
        const createdAt = contentData.createdAt instanceof admin.firestore.Timestamp
            ? contentData.createdAt.toMillis()
            : now;
        const ageInHours = (now - createdAt) / (1000 * 60 * 60);
        const recencyFactor = Math.max(0, 1 - (ageInHours / 72)); // Decay over 3 days
        const trendingScore = contentData.engagementScore * recencyFactor;
        if (looksDoc.exists) {
            // Update existing document
            await looksRef.update({
                score: contentData.engagementScore,
                trendingScore,
                updatedAt: FieldValue.serverTimestamp()
            });
        }
        else {
            // Create new document
            await looksRef.set({
                contentId,
                score: contentData.engagementScore,
                trendingScore,
                categoryId: contentData.categoryIds && contentData.categoryIds.length > 0
                    ? contentData.categoryIds[0]
                    : null,
                serviceId: contentData.serviceIds && contentData.serviceIds.length > 0
                    ? contentData.serviceIds[0]
                    : null,
                region: ((_a = contentData.location) === null || _a === void 0 ? void 0 : _a.state) || 'all',
                featuredUntil: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
                ),
                createdAt: FieldValue.serverTimestamp()
            });
        }
        console.log(`Updated theLooks for content ${contentId}`);
        return true;
    }
    catch (error) {
        console.error(`Error updating theLooks for content ${contentId}:`, error);
        return false;
    }
}
// Helper function to generate a geohash
// This is a simplified version - in production, use a proper geohash library
function generateGeohash(lat, lng, precision = 5) {
    // Convert lat and lng to integers for simplicity
    const latInt = Math.floor((lat + 90) * 1000000);
    const lngInt = Math.floor((lng + 180) * 1000000);
    // Convert to binary strings
    const latBin = latInt.toString(2).padStart(32, '0');
    const lngBin = lngInt.toString(2).padStart(32, '0');
    // Interleave bits
    let geohashBin = '';
    for (let i = 0; i < precision * 5; i++) {
        geohashBin += (i % 2 === 0) ? lngBin[Math.floor(i / 2)] : latBin[Math.floor(i / 2)];
    }
    // Convert to base32 string
    const base32Chars = '0123456789bcdefghjkmnpqrstuvwxyz';
    let geohash = '';
    for (let i = 0; i < geohashBin.length; i += 5) {
        const chunk = geohashBin.substr(i, 5);
        const index = parseInt(chunk, 2);
        geohash += base32Chars[index];
    }
    return geohash;
}
//# sourceMappingURL=dbStructure.js.map