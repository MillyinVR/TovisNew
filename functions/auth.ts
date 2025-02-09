import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

export const onUserRoleUpdate = functions.firestore
  .document('users/{userId}')
  .onWrite(async (change, context) => {
    const userId = context.params.userId;
    const afterData = change.after.data();
    const beforeData = change.before.data();

    // If document was deleted or no role in new data, remove claims
    if (!afterData || !afterData.role) {
      await admin.auth().setCustomUserClaims(userId, null);
      return;
    }

    // If role hasn't changed, do nothing
    if (beforeData && beforeData.role === afterData.role) {
      return;
    }

    // Set custom claims based on user role
    await admin.auth().setCustomUserClaims(userId, {
      role: afterData.role
    });

    // Force token refresh
    const user = await admin.auth().getUser(userId);
    if (user.email) {
      await admin.auth().revokeRefreshTokens(userId);
    }
  });
