/**
 * License Data Generation Script
 * 
 * This script adds sample license data to professionals.
 * 
 * Usage:
 * 1. Make sure you have the Firebase Admin SDK initialized
 * 2. Run this script with Node.js: node scripts/addLicenseData.js
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK with service account
try {
  const serviceAccountPath = resolve(__dirname, '../serviceAccountKey.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  console.log('Make sure you have a valid serviceAccountKey.json file in the project root');
  process.exit(1);
}

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// Sample license types
const licenseTypes = [
  'Cosmetology',
  'Esthetician',
  'Nail Technician',
  'Massage Therapist',
  'Hair Stylist',
  'Makeup Artist',
  'Barber'
];

// Sample license statuses
const licenseStatuses = [
  'active',
  'pending',
  'expired',
  'revoked'
];

// Sample license data
function generateSampleLicense(professionalId) {
  const licenseType = licenseTypes[Math.floor(Math.random() * licenseTypes.length)];
  const licenseStatus = licenseStatuses[Math.floor(Math.random() * licenseStatuses.length)];
  
  // Generate a random license number
  const licenseNumber = `LIC-${Math.floor(100000 + Math.random() * 900000)}`;
  
  // Generate random dates
  const now = new Date();
  const issuedDate = new Date(now.getFullYear() - Math.floor(1 + Math.random() * 5), 
                             Math.floor(Math.random() * 12), 
                             Math.floor(1 + Math.random() * 28));
  
  // Expiration date is 2-4 years after issued date
  const expirationYears = Math.floor(2 + Math.random() * 3);
  const expirationDate = new Date(issuedDate);
  expirationDate.setFullYear(expirationDate.getFullYear() + expirationYears);
  
  return {
    professionalId,
    licenseType,
    licenseNumber,
    issuedBy: 'State Board of Cosmetology',
    issuedDate: admin.firestore.Timestamp.fromDate(issuedDate),
    expirationDate: admin.firestore.Timestamp.fromDate(expirationDate),
    status: licenseStatus,
    verificationStatus: licenseStatus === 'active' ? 'verified' : 'pending',
    documentUrl: `https://firebasestorage.googleapis.com/v0/b/beauty-app-demo.appspot.com/o/licenses%2Fsample_license.pdf?alt=media`,
    notes: licenseStatus === 'active' ? 'License verified and active' : 'Pending verification',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  };
}

// Add license data to professionals
async function addLicensesToProfessionals() {
  console.log('Adding license data to professionals...');
  
  try {
    // Get all professionals
    const professionalsSnapshot = await db.collection('professionals').get();
    
    if (professionalsSnapshot.empty) {
      console.log('No professionals found');
      return;
    }
    
    for (const doc of professionalsSnapshot.docs) {
      const professionalId = doc.id;
      
      // Generate 1-3 licenses for each professional
      const licenseCount = Math.floor(1 + Math.random() * 3);
      
      for (let i = 0; i < licenseCount; i++) {
        const licenseData = generateSampleLicense(professionalId);
        
        // Add to licenses subcollection
        const licenseRef = db.collection('professionals').doc(professionalId)
          .collection('licenses').doc();
        
        await licenseRef.set(licenseData);
        
        console.log(`Added license ${licenseRef.id} to professional ${professionalId}`);
        
        // Also add to the global licenses collection for backward compatibility
        await db.collection('licenses').doc(licenseRef.id).set({
          ...licenseData,
          id: licenseRef.id
        });
        
        console.log(`Added license ${licenseRef.id} to global licenses collection`);
      }
    }
    
    console.log(`Added licenses to ${professionalsSnapshot.size} professionals`);
  } catch (error) {
    console.error('Error adding license data:', error);
  }
}

// Main function to add license data
async function addLicenseData() {
  console.log('Starting to add license data...');
  
  try {
    await addLicensesToProfessionals();
    
    console.log('\nLicense data added successfully!');
  } catch (error) {
    console.error('Error adding license data:', error);
    console.log('License data addition failed');
  }
}

// Run the license data addition
addLicenseData().then(() => {
  console.log('License data script finished');
  process.exit(0);
}).catch(error => {
  console.error('Unhandled error during license data addition:', error);
  process.exit(1);
});
