import { CallableRequest, HttpsError, onCall, onRequest, HttpsOptions } from 'firebase-functions/v2/https';
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

interface NotificationData {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

// Callable function version (for use with httpsCallable)
export const sendNotification = onCall(runtimeOpts, async (request: CallableRequest) => {
  // Verify user is authenticated
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const data = request.data as NotificationData;
  
  if (!data.userId || !data.title || !data.body) {
    throw new HttpsError(
      'invalid-argument',
      'Missing required notification fields'
    );
  }

  try {
    // Create notification in Firestore
    const notificationRef = admin.firestore().collection('notifications').doc();
    
    await notificationRef.set({
      userId: data.userId,
      message: data.body,
      title: data.title,
      read: false,
      type: data.data?.type || 'general',
      data: data.data || {},
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Get user's FCM token if available
    console.log('Sending notification to user:', data.userId);
    const userDoc = await admin.firestore().collection('users').doc(data.userId).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const fcmToken = userData?.fcmToken;
      
      console.log('User data found:', userData?.displayName || 'Unknown user');
      
      // Send push notification if FCM token exists
      if (fcmToken) {
        const message = {
          notification: {
            title: data.title,
            body: data.body
          },
          data: {
            ...data.data,
            notificationId: notificationRef.id
          },
          token: fcmToken
        };
        
        console.log('Sending FCM message:', message);
        await admin.messaging().send(message);
        console.log('FCM message sent successfully');
      } else {
        console.log('No FCM token found for user:', data.userId);
      }
    } else {
      console.log('User document not found for ID:', data.userId);
    }
    
    return { success: true, notificationId: notificationRef.id };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new HttpsError(
      'internal',
      'Error sending notification'
    );
  }
});

// HTTP endpoint version (for direct HTTP calls)
export const sendNotificationHttp = onRequest(runtimeOpts, async (req, res) => {
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
    
    const data = req.body as NotificationData;
    
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
      type: data.data?.type || 'general',
      data: data.data || {},
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Get user's FCM token if available
    console.log('HTTP endpoint: Sending notification to user:', data.userId);
    const userDoc = await admin.firestore().collection('users').doc(data.userId).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const fcmToken = userData?.fcmToken;
      
      console.log('HTTP endpoint: User data found:', userData?.displayName || 'Unknown user');
      
      // Send push notification if FCM token exists
      if (fcmToken) {
        const message = {
          notification: {
            title: data.title,
            body: data.body
          },
          data: {
            ...data.data,
            notificationId: notificationRef.id
          },
          token: fcmToken
        };
        
        console.log('HTTP endpoint: Sending FCM message:', message);
        await admin.messaging().send(message);
        console.log('HTTP endpoint: FCM message sent successfully');
      } else {
        console.log('HTTP endpoint: No FCM token found for user:', data.userId);
      }
    } else {
      console.log('HTTP endpoint: User document not found for ID:', data.userId);
    }
    
    res.status(200).json({ success: true, notificationId: notificationRef.id });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Error sending notification' });
  }
});
