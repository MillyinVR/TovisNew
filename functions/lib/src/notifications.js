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
exports.sendNotificationHttp = exports.sendNotification = void 0;
const https_1 = require("firebase-functions/v2/https");
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
// Callable function version (for use with httpsCallable)
exports.sendNotification = (0, https_1.onCall)(runtimeOpts, async (request) => {
    var _a;
    // Verify user is authenticated
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const data = request.data;
    if (!data.userId || !data.title || !data.body) {
        throw new https_1.HttpsError('invalid-argument', 'Missing required notification fields');
    }
    try {
        // Create notification in Firestore
        const notificationRef = admin.firestore().collection('notifications').doc();
        await notificationRef.set({
            userId: data.userId,
            message: data.body,
            title: data.title,
            read: false,
            type: ((_a = data.data) === null || _a === void 0 ? void 0 : _a.type) || 'general',
            data: data.data || {},
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        // Get user's FCM token if available
        console.log('Sending notification to user:', data.userId);
        const userDoc = await admin.firestore().collection('users').doc(data.userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            const fcmToken = userData === null || userData === void 0 ? void 0 : userData.fcmToken;
            console.log('User data found:', (userData === null || userData === void 0 ? void 0 : userData.displayName) || 'Unknown user');
            // Send push notification if FCM token exists
            if (fcmToken) {
                const message = {
                    notification: {
                        title: data.title,
                        body: data.body
                    },
                    data: Object.assign(Object.assign({}, data.data), { notificationId: notificationRef.id }),
                    token: fcmToken
                };
                console.log('Sending FCM message:', message);
                await admin.messaging().send(message);
                console.log('FCM message sent successfully');
            }
            else {
                console.log('No FCM token found for user:', data.userId);
            }
        }
        else {
            console.log('User document not found for ID:', data.userId);
        }
        return { success: true, notificationId: notificationRef.id };
    }
    catch (error) {
        console.error('Error sending notification:', error);
        throw new https_1.HttpsError('internal', 'Error sending notification');
    }
});
// HTTP endpoint version (for direct HTTP calls)
exports.sendNotificationHttp = (0, https_1.onRequest)(runtimeOpts, async (req, res) => {
    var _a;
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    try {
        // Check if request has a body
        if (!req.body) {
            res.status(400).json({ error: 'Missing request body' });
            return;
        }
        const data = req.body;
        if (!data.userId || !data.title || !data.body) {
            res.status(400).json({ error: 'Missing required notification fields' });
            return;
        }
        // Create notification in Firestore
        const notificationRef = admin.firestore().collection('notifications').doc();
        await notificationRef.set({
            userId: data.userId,
            message: data.body,
            title: data.title,
            read: false,
            type: ((_a = data.data) === null || _a === void 0 ? void 0 : _a.type) || 'general',
            data: data.data || {},
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        // Get user's FCM token if available
        console.log('HTTP endpoint: Sending notification to user:', data.userId);
        const userDoc = await admin.firestore().collection('users').doc(data.userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            const fcmToken = userData === null || userData === void 0 ? void 0 : userData.fcmToken;
            console.log('HTTP endpoint: User data found:', (userData === null || userData === void 0 ? void 0 : userData.displayName) || 'Unknown user');
            // Send push notification if FCM token exists
            if (fcmToken) {
                const message = {
                    notification: {
                        title: data.title,
                        body: data.body
                    },
                    data: Object.assign(Object.assign({}, data.data), { notificationId: notificationRef.id }),
                    token: fcmToken
                };
                console.log('HTTP endpoint: Sending FCM message:', message);
                await admin.messaging().send(message);
                console.log('HTTP endpoint: FCM message sent successfully');
            }
            else {
                console.log('HTTP endpoint: No FCM token found for user:', data.userId);
            }
        }
        else {
            console.log('HTTP endpoint: User document not found for ID:', data.userId);
        }
        res.status(200).json({ success: true, notificationId: notificationRef.id });
    }
    catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: 'Error sending notification' });
    }
});
//# sourceMappingURL=notifications.js.map