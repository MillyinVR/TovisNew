const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

async function migrateToNewAuthStructure() {
  console.log('Starting migration to new auth structure...');

  const batch = db.batch();
  let batchCount = 0;
  const maxBatchSize = 500;

  try {
    // 1. Migrate users collection to use new field names
    console.log('Migrating users collection...');
    const usersSnapshot = await db.collection('users').get();

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      // Check if user has old verification status structure
      if (userData.verificationStatus && typeof userData.verificationStatus === 'string') {
        console.log(`Migrating verification status for user ${userId}`);

        const updateData = {
          professionalVerificationStatus: userData.verificationStatus,
          verificationStatus: {
            email: userData.emailVerified || false,
            phone: !!userData.phoneNumber,
            identity: false,
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        batch.update(userDoc.ref, updateData);
        batchCount++;

        if (batchCount >= maxBatchSize) {
          await batch.commit();
          console.log(`Committed batch of ${batchCount} updates`);
          batchCount = 0;
        }
      }

      // Ensure all users have proper role structure
      if (!userData.role) {
        console.log(`Setting default role for user ${userId}`);
        batch.update(userDoc.ref, {
          role: 'client',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        batchCount++;

        if (batchCount >= maxBatchSize) {
          await batch.commit();
          console.log(`Committed batch of ${batchCount} updates`);
          batchCount = 0;
        }
      }
    }

    // 2. Create verification documents for pending professionals
    console.log('Creating verification documents for pending professionals...');
    const pendingProfessionals = await db
      .collection('users')
      .where('role', '==', 'pending_professional')
      .get();

    for (const userDoc of pendingProfessionals.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();

      // Check if verification document already exists
      const verificationDoc = await db.collection('verifications').doc(userId).get();

      if (!verificationDoc.exists) {
        console.log(`Creating verification document for user ${userId}`);

        const verificationData = {
          userId: userId,
          status: 'pending',
          submittedAt: userData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        batch.set(db.collection('verifications').doc(userId), verificationData);
        batchCount++;

        if (batchCount >= maxBatchSize) {
          await batch.commit();
          console.log(`Committed batch of ${batchCount} updates`);
          batchCount = 0;
        }
      }
    }

    // 3. Update custom claims for all users
    console.log('Updating custom claims for all users...');
    const allUsersSnapshot = await db.collection('users').get();

    for (const userDoc of allUsersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      try {
        const claims = { role: userData.role };

        // Set role-specific claims
        switch (userData.role) {
          case 'admin':
            claims.admin = true;
            break;
          case 'professional':
            claims.professional = true;
            if (userData.professionalVerificationStatus) {
              claims.verificationStatus = userData.professionalVerificationStatus;
            }
            break;
          case 'pending_professional':
            claims.verificationStatus = 'pending';
            break;
          case 'client':
            // No additional claims needed for clients
            break;
        }

        console.log(`Setting claims for user ${userId}:`, claims);
        await admin.auth().setCustomUserClaims(userId, claims);

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error setting claims for user ${userId}:`, error);
        // Continue with other users
      }
    }

    // Commit any remaining batch operations
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} updates`);
    }

    console.log('Migration completed successfully!');

    // Generate migration report
    const report = {
      timestamp: new Date().toISOString(),
      totalUsers: usersSnapshot.size,
      pendingProfessionals: pendingProfessionals.size,
      status: 'completed',
    };

    fs.writeFileSync('migration-report.json', JSON.stringify(report, null, 2));
    console.log('Migration report saved to migration-report.json');
  } catch (error) {
    console.error('Migration failed:', error);

    // Generate error report
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      status: 'failed',
    };

    fs.writeFileSync('migration-error-report.json', JSON.stringify(errorReport, null, 2));
    throw error;
  }
}

// Function to verify migration
async function verifyMigration() {
  console.log('Verifying migration...');

  try {
    // Check users collection structure
    const usersSnapshot = await db.collection('users').limit(10).get();
    console.log('Sample user documents:');

    usersSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log(`User ${doc.id}:`, {
        role: data.role,
        professionalVerificationStatus: data.professionalVerificationStatus,
        verificationStatus: data.verificationStatus,
      });
    });

    // Check verification documents
    const verificationsSnapshot = await db.collection('verifications').limit(5).get();
    console.log('\nSample verification documents:');

    verificationsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log(`Verification ${doc.id}:`, {
        userId: data.userId,
        status: data.status,
        submittedAt: data.submittedAt,
      });
    });

    // Check custom claims for a few users
    console.log('\nSample custom claims:');
    const sampleUsers = usersSnapshot.docs.slice(0, 3);

    for (const userDoc of sampleUsers) {
      try {
        const userRecord = await admin.auth().getUser(userDoc.id);
        console.log(`User ${userDoc.id} claims:`, userRecord.customClaims);
      } catch (error) {
        console.log(`Could not get claims for user ${userDoc.id}:`, error.message);
      }
    }

    console.log('\nMigration verification completed!');
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

// Run migration if called directly
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'verify') {
    verifyMigration()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    migrateToNewAuthStructure()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}

module.exports = {
  migrateToNewAuthStructure,
  verifyMigration,
};
