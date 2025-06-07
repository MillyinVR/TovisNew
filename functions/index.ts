import * as admin from 'firebase-admin';
import { setAdminClaim, setProfessionalClaim } from './src/auth';
import {
  syncUserToRoleCollection,
  syncPortfolioToContent,
  updateGeoIndex,
  updateContentEngagement,
  createUserActivity,
  createUserRecommendations
} from './src/dbStructure';
import { sendNotification, sendNotificationHttp } from './src/notifications';

// Initialize Firebase Admin with default credentials if not already initialized
try {
  admin.app();
} catch (e) {
  admin.initializeApp();
}

// Export auth functions
exports.setAdminClaim = setAdminClaim;
exports.setProfessionalClaim = setProfessionalClaim;

// Export database structure functions
exports.syncUserToRoleCollection = syncUserToRoleCollection;
exports.syncPortfolioToContent = syncPortfolioToContent;
exports.updateGeoIndex = updateGeoIndex;
exports.updateContentEngagement = updateContentEngagement;
exports.createUserActivity = createUserActivity;
exports.createUserRecommendations = createUserRecommendations;

// Export notification functions
exports.sendNotification = sendNotification;
exports.sendNotificationHttp = sendNotificationHttp;
