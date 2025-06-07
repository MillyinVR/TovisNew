/**
 * Database Migration Script
 * 
 * This script migrates data from the current structure to the new structure
 * with separate collections for different user types.
 * 
 * Usage:
 * 1. Make sure you have the Firebase Admin SDK initialized
 * 2. Run this script with Node.js: node scripts/migrateToNewStructure.js
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK with service account
// You need to provide your own service account key
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
const auth = admin.auth();
const FieldValue = admin.firestore.FieldValue;

// Utility function to create a document with a specific ID
async function createDocumentWithId(collectionPath, docId, data) {
  try {
    await db.collection(collectionPath).doc(docId).set({
      ...data,
      migratedAt: FieldValue.serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error(`Error creating document ${docId} in ${collectionPath}:`, error);
    return false;
  }
}

// Utility function to copy a subcollection
async function copySubcollection(sourceDocRef, targetDocRef, subcollectionName) {
  try {
    const subcollectionSnapshot = await sourceDocRef.collection(subcollectionName).get();
    
    if (subcollectionSnapshot.empty) {
      console.log(`No documents in subcollection ${subcollectionName} for ${sourceDocRef.path}`);
      return 0;
    }

    const copyPromises = subcollectionSnapshot.docs.map(async (doc) => {
      await targetDocRef.collection(subcollectionName).doc(doc.id).set({
        ...doc.data(),
        migratedAt: FieldValue.serverTimestamp()
      });
    });

    await Promise.all(copyPromises);
    return subcollectionSnapshot.size;
  } catch (error) {
    console.error(`Error copying subcollection ${subcollectionName}:`, error);
    return 0;
  }
}

// Migrate a user to the appropriate role-specific collection
async function migrateUser(userDoc) {
  const userData = userDoc.data();
  const userId = userDoc.id;
  
  // Skip if no role is defined
  if (!userData.role) {
    console.log(`Skipping user ${userId} - no role defined`);
    return false;
  }

  // Determine target collection based on role
  let targetCollection;
  switch (userData.role) {
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
      console.log(`Skipping user ${userId} - unknown role: ${userData.role}`);
      return false;
  }

  console.log(`Migrating user ${userId} to ${targetCollection} collection`);

  // Create document in target collection
  const success = await createDocumentWithId(targetCollection, userId, userData);
  
  if (!success) {
    return false;
  }

  // Copy relevant subcollections based on role
  if (targetCollection === 'professionals') {
    const sourceDocRef = db.collection('users').doc(userId);
    const targetDocRef = db.collection(targetCollection).doc(userId);
    
    // Copy professional-specific subcollections
    const subcollections = [
      'services',
      'settings',
      'customWorkingHours',
      'blockedTimes'
    ];

    for (const subcollection of subcollections) {
      const count = await copySubcollection(sourceDocRef, targetDocRef, subcollection);
      console.log(`Copied ${count} documents from ${subcollection} subcollection for user ${userId}`);
    }

    // Migrate working hours from settings/workingHours to workingHours subcollection
    try {
      const workingHoursDoc = await sourceDocRef.collection('settings').doc('workingHours').get();
      if (workingHoursDoc.exists) {
        const workingHoursData = workingHoursDoc.data();
        
        // Create a document for each day in the workingHours subcollection
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        for (const day of days) {
          if (workingHoursData[day]) {
            await targetDocRef.collection('workingHours').doc(day).set({
              ...workingHoursData[day],
              migratedAt: FieldValue.serverTimestamp()
            });
          }
        }
        console.log(`Migrated working hours for user ${userId}`);
      }
    } catch (error) {
      console.error(`Error migrating working hours for user ${userId}:`, error);
    }

    // Create portfolio subcollection from global portfolio collection
    try {
      const portfolioSnapshot = await db.collection('portfolio')
        .where('professionalId', '==', userId)
        .get();
      
      if (!portfolioSnapshot.empty) {
        const portfolioPromises = portfolioSnapshot.docs.map(async (doc) => {
          await targetDocRef.collection('portfolio').doc(doc.id).set({
            ...doc.data(),
            migratedAt: FieldValue.serverTimestamp()
          });
        });
        
        await Promise.all(portfolioPromises);
        console.log(`Copied ${portfolioSnapshot.size} portfolio items for user ${userId}`);
      }
    } catch (error) {
      console.error(`Error copying portfolio for user ${userId}:`, error);
    }

    // Create licenses subcollection from global licenses collection
    try {
      const licensesSnapshot = await db.collection('licenses')
        .where('professionalId', '==', userId)
        .get();
      
      if (!licensesSnapshot.empty) {
        const licensesPromises = licensesSnapshot.docs.map(async (doc) => {
          await targetDocRef.collection('licenses').doc(doc.id).set({
            ...doc.data(),
            migratedAt: FieldValue.serverTimestamp()
          });
        });
        
        await Promise.all(licensesPromises);
        console.log(`Copied ${licensesSnapshot.size} licenses for user ${userId}`);
      }
    } catch (error) {
      console.error(`Error copying licenses for user ${userId}:`, error);
    }
  }

  return true;
}

// Create content collection from portfolio items
async function migratePortfolioToContent() {
  try {
    const portfolioSnapshot = await db.collection('portfolio').get();
    
    if (portfolioSnapshot.empty) {
      console.log('No portfolio items to migrate');
      return 0;
    }

    const contentPromises = portfolioSnapshot.docs.map(async (doc) => {
      const portfolioData = doc.data();
      
      // Skip if no professionalId
      if (!portfolioData.professionalId) {
        console.log(`Skipping portfolio item ${doc.id} - no professionalId`);
        return false;
      }

      // Create content document
      await db.collection('content').doc(doc.id).set({
        professionalId: portfolioData.professionalId,
        type: portfolioData.type || 'image',
        url: portfolioData.url,
        thumbnail: portfolioData.thumbnail || portfolioData.url,
        caption: portfolioData.caption || '',
        serviceIds: portfolioData.serviceId ? [portfolioData.serviceId] : [],
        categoryIds: portfolioData.category ? [portfolioData.category] : [],
        tags: portfolioData.tags || [],
        createdAt: portfolioData.createdAt || FieldValue.serverTimestamp(),
        views: portfolioData.views || 0,
        likes: portfolioData.likes || 0,
        engagementScore: 0,
        algorithmScore: 0,
        migratedAt: FieldValue.serverTimestamp()
      });

      return true;
    });

    const results = await Promise.all(contentPromises);
    const migratedCount = results.filter(Boolean).length;
    
    console.log(`Migrated ${migratedCount} portfolio items to content collection`);
    return migratedCount;
  } catch (error) {
    console.error('Error migrating portfolio to content:', error);
    return 0;
  }
}

// Create initial theLooks collection from content
async function createInitialTheLooks() {
  try {
    const contentSnapshot = await db.collection('content').get();
    
    if (contentSnapshot.empty) {
      console.log('No content items to add to theLooks');
      return 0;
    }

    const looksPromises = contentSnapshot.docs.map(async (doc, index) => {
      const contentData = doc.data();
      
      // Create theLooks document
      await db.collection('theLooks').doc(doc.id).set({
        contentId: doc.id,
        score: 100 - index, // Simple initial scoring based on order
        categoryId: contentData.categoryIds && contentData.categoryIds.length > 0 ? contentData.categoryIds[0] : null,
        serviceId: contentData.serviceIds && contentData.serviceIds.length > 0 ? contentData.serviceIds[0] : null,
        region: 'all', // Default region
        trendingScore: 0,
        featuredUntil: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        ),
        createdAt: FieldValue.serverTimestamp()
      });

      return true;
    });

    const results = await Promise.all(looksPromises);
    const createdCount = results.filter(Boolean).length;
    
    console.log(`Created ${createdCount} items in theLooks collection`);
    return createdCount;
  } catch (error) {
    console.error('Error creating initial theLooks:', error);
    return 0;
  }
}

// Create geoIndex collection from professionals
async function createGeoIndex() {
  try {
    const professionalsSnapshot = await db.collection('professionals').get();
    
    if (professionalsSnapshot.empty) {
      console.log('No professionals to index');
      return 0;
    }

    // Simple geohash function (for demonstration)
    // In production, use a proper geohash library
    function simpleGeohash(lat, lng, precision = 5) {
      // This is a very simplified version - use a proper geohash library in production
      const latBin = lat.toString(2).padStart(32, '0');
      const lngBin = lng.toString(2).padStart(32, '0');
      
      let geohash = '';
      for (let i = 0; i < precision * 5; i++) {
        geohash += (i % 2 === 0) ? lngBin[i/2] : latBin[Math.floor(i/2)];
      }
      
      return parseInt(geohash, 2).toString(32);
    }

    const geoIndexMap = new Map();

    // Group professionals by geohash
    for (const doc of professionalsSnapshot.docs) {
      const professionalData = doc.data();
      
      // Skip if no location
      if (!professionalData.location || 
          !professionalData.location.coordinates || 
          !professionalData.location.coordinates.lat || 
          !professionalData.location.coordinates.lng) {
        console.log(`Skipping professional ${doc.id} - no valid coordinates`);
        continue;
      }

      const { lat, lng } = professionalData.location.coordinates;
      const geohash = simpleGeohash(lat, lng);
      
      if (!geoIndexMap.has(geohash)) {
        geoIndexMap.set(geohash, {
          professionalIds: [],
          serviceIds: [],
          updatedAt: FieldValue.serverTimestamp()
        });
      }
      
      const geoData = geoIndexMap.get(geohash);
      geoData.professionalIds.push(doc.id);
      
      // Add service IDs if available
      try {
        const servicesSnapshot = await db.collection('professionals').doc(doc.id).collection('services').get();
        if (!servicesSnapshot.empty) {
          servicesSnapshot.docs.forEach(serviceDoc => {
            geoData.serviceIds.push(serviceDoc.id);
          });
        }
      } catch (error) {
        console.error(`Error getting services for professional ${doc.id}:`, error);
      }
    }

    // Create geoIndex documents
    const geoIndexPromises = Array.from(geoIndexMap.entries()).map(async ([geohash, data]) => {
      await db.collection('geoIndex').doc(geohash).set(data);
      return true;
    });

    const results = await Promise.all(geoIndexPromises);
    const createdCount = results.filter(Boolean).length;
    
    console.log(`Created ${createdCount} documents in geoIndex collection`);
    return createdCount;
  } catch (error) {
    console.error('Error creating geoIndex:', error);
    return 0;
  }
}

// Main migration function
async function migrateDatabase() {
  console.log('Starting database migration...');
  
  try {
    // 1. Migrate users to role-specific collections
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('No users to migrate');
    } else {
      console.log(`Found ${usersSnapshot.size} users to migrate`);
      
      let successCount = 0;
      for (const userDoc of usersSnapshot.docs) {
        const success = await migrateUser(userDoc);
        if (success) {
          successCount++;
        }
      }
      
      console.log(`Successfully migrated ${successCount} out of ${usersSnapshot.size} users`);
    }

    // 2. Migrate portfolio to content collection
    await migratePortfolioToContent();

    // 3. Create initial theLooks collection
    await createInitialTheLooks();

    // 4. Create geoIndex collection
    await createGeoIndex();

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    console.log('Migration failed');
  }
}

// Run the migration
migrateDatabase().then(() => {
  console.log('Migration script finished');
  process.exit(0);
}).catch(error => {
  console.error('Unhandled error during migration:', error);
  process.exit(1);
});
