const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function setAdminClaim() {
  try {
    const user = await admin.auth().getUserByEmail('Admin@test.com');
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'admin'
    });
    console.log('Successfully set admin claim for Admin@test.com');
  } catch (error) {
    console.error('Error setting admin claim:', error);
  }
  process.exit();
}

setAdminClaim();
