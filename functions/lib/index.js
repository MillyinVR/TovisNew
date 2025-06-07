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
const admin = __importStar(require("firebase-admin"));
const auth_1 = require("./src/auth");
const dbStructure_1 = require("./src/dbStructure");
const notifications_1 = require("./src/notifications");
// Initialize Firebase Admin with default credentials if not already initialized
try {
    admin.app();
}
catch (e) {
    admin.initializeApp();
}
// Export auth functions
exports.setAdminClaim = auth_1.setAdminClaim;
exports.setProfessionalClaim = auth_1.setProfessionalClaim;
// Export database structure functions
exports.syncUserToRoleCollection = dbStructure_1.syncUserToRoleCollection;
exports.syncPortfolioToContent = dbStructure_1.syncPortfolioToContent;
exports.updateGeoIndex = dbStructure_1.updateGeoIndex;
exports.updateContentEngagement = dbStructure_1.updateContentEngagement;
exports.createUserActivity = dbStructure_1.createUserActivity;
exports.createUserRecommendations = dbStructure_1.createUserRecommendations;
// Export notification functions
exports.sendNotification = notifications_1.sendNotification;
exports.sendNotificationHttp = notifications_1.sendNotificationHttp;
//# sourceMappingURL=index.js.map