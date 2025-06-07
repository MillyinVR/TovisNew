/**
 * Database Structure Verification Script
 * 
 * This script verifies that the database structure is correctly set up
 * with separate collections for different user types and appropriate subcollections.
 * 
 * Usage:
 * 1. Make sure you have the Firebase Admin SDK initialized
 * 2. Run this script with Node.js: node scripts/verifyDatabaseStructure.js
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

// Define expected collections and subcollections
const expectedCollections = [
  'users',
  'professionals',
  'clients',
  'admins',
  'content',
  'theLooks',
  'geoIndex',
  'userActivity',
  'userRecommendations',
  'appointments',
  'serviceCategories',
  'services',
  'reviews',
  'conversations'
];

const expectedSubcollections = {
  'professionals': [
    'services',
    'workingHours',
    'timeOff',
    'portfolio',
    'licenses'
  ],
  'conversations': [
    'messages'
  ]
};

// Verify top-level collections
async function verifyCollections() {
  console.log('Verifying top-level collections...');
  
  const collections = await db.listCollections();
  const collectionIds = collections.map(col => col.id);
  
  console.log('Found collections:', collectionIds.join(', '));
  
  const missingCollections = expectedCollections.filter(col => !collectionIds.includes(col));
  
  if (missingCollections.length > 0) {
    console.warn('Missing expected collections:', missingCollections.join(', '));
  } else {
    console.log('All expected top-level collections exist.');
  }
  
  return collectionIds;
}

// Verify subcollections for a specific collection
async function verifySubcollections(collectionId) {
  if (!expectedSubcollections[collectionId]) {
    return;
  }
  
  console.log(`\nVerifying subcollections for ${collectionId}...`);
  
  // Get a sample document from the collection
  const snapshot = await db.collection(collectionId).limit(1).get();
  
  if (snapshot.empty) {
    console.log(`No documents found in ${collectionId} collection to verify subcollections.`);
    return;
  }
  
  const docRef = snapshot.docs[0].ref;
  const docId = snapshot.docs[0].id;
  
  console.log(`Using document ${docId} to verify subcollections.`);
  
  // List subcollections for the document
  const subcollections = await docRef.listCollections();
  const subcollectionIds = subcollections.map(col => col.id);
  
  console.log(`Found subcollections for ${collectionId}/${docId}:`, 
    subcollectionIds.length > 0 ? subcollectionIds.join(', ') : 'None');
  
  const expectedSubcols = expectedSubcollections[collectionId];
  const missingSubcollections = expectedSubcols.filter(col => !subcollectionIds.includes(col));
  
  if (missingSubcollections.length > 0) {
    console.warn(`Missing expected subcollections for ${collectionId}:`, missingSubcollections.join(', '));
  } else if (subcollectionIds.length > 0) {
    console.log(`All expected subcollections for ${collectionId} exist.`);
  }
}

// Verify user counts in role-specific collections
async function verifyUserCounts() {
  console.log('\nVerifying user counts in role-specific collections...');
  
  const userCount = (await db.collection('users').count().get()).data().count;
  const professionalCount = (await db.collection('professionals').count().get()).data().count;
  const clientCount = (await db.collection('clients').count().get()).data().count;
  const adminCount = (await db.collection('admins').count().get()).data().count;
  
  console.log(`Users: ${userCount}`);
  console.log(`Professionals: ${professionalCount}`);
  console.log(`Clients: ${clientCount}`);
  console.log(`Admins: ${adminCount}`);
  
  const totalRoleSpecific = professionalCount + clientCount + adminCount;
  
  if (totalRoleSpecific < userCount) {
    console.warn(`Warning: There are ${userCount} users but only ${totalRoleSpecific} in role-specific collections.`);
    console.warn('Some users may not have been migrated properly.');
  } else if (totalRoleSpecific > userCount) {
    console.warn(`Warning: There are ${totalRoleSpecific} users in role-specific collections but only ${userCount} in the users collection.`);
    console.warn('There may be duplicate users or the users collection is not in sync.');
  } else {
    console.log('User counts match between users collection and role-specific collections.');
  }
}

// Verify sample data in each collection
async function verifySampleData() {
  console.log('\nVerifying sample data in each collection...');
  
  for (const collectionId of expectedCollections) {
    const snapshot = await db.collection(collectionId).limit(1).get();
    
    if (snapshot.empty) {
      console.log(`No documents found in ${collectionId} collection.`);
      continue;
    }
    
    const docData = snapshot.docs[0].data();
    const docId = snapshot.docs[0].id;
    
    console.log(`Sample document in ${collectionId} (${docId}):`);
    console.log('Fields:', Object.keys(docData).join(', '));
  }
}

// Main verification function
async function verifyDatabaseStructure() {
  console.log('Starting database structure verification...');
  
  try {
    // Verify collections
    const collections = await verifyCollections();
    
    // Verify subcollections for collections that should have them
    for (const collectionId of Object.keys(expectedSubcollections)) {
      if (collections.includes(collectionId)) {
        await verifySubcollections(collectionId);
      }
    }
    
    // Verify user counts
    await verifyUserCounts();
    
    // Verify sample data
    await verifySampleData();
    
    console.log('\nDatabase structure verification completed.');
  } catch (error) {
    console.error('Error during verification:', error);
    console.log('Verification failed');
  }
}

// Run the verification
verifyDatabaseStructure().then(() => {
  console.log('Verification script finished');
  process.exit(0);
}).catch(error => {
  console.error('Unhandled error during verification:', error);
  process.exit(1);
});
