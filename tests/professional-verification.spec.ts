import { test, expect } from '@playwright/test';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK for testing
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID || 'beautyappaici',
  });
}

test.describe('Professional Verification Flow', () => {
  let testUserId: string;
  let testUserEmail: string;

  test.beforeEach(async () => {
    // Generate unique test user email
    testUserEmail = `test-professional-${Date.now()}@example.com`;

    // Create test user via Firebase Admin SDK
    const userRecord = await admin.auth().createUser({
      email: testUserEmail,
      password: 'TestPassword123!',
      displayName: 'Test Professional User',
    });

    testUserId = userRecord.uid;

    // Create user document in Firestore
    await admin
      .firestore()
      .collection('users')
      .doc(testUserId)
      .set({
        uid: testUserId,
        email: testUserEmail,
        displayName: 'Test Professional User',
        role: 'pending_professional',
        professionalVerificationStatus: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        failedLoginAttempts: 0,
        preferences: {
          notifications: true,
          theme: 'light',
          language: 'en',
        },
        membershipTier: 'standard',
        verificationStatus: {
          email: true,
          phone: false,
          identity: false,
        },
      });

    // Create verification document
    await admin
      .firestore()
      .collection('verifications')
      .doc(testUserId)
      .set({
        userId: testUserId,
        status: 'pending',
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        documents: {
          license: 'test-license-url',
          insurance: 'test-insurance-url',
          certification: 'test-certification-url',
        },
        personalInfo: {
          firstName: 'Test',
          lastName: 'Professional',
          businessName: 'Test Beauty Business',
          licenseNumber: 'TEST123456',
          yearsExperience: 5,
        },
      });
  });

  test.afterEach(async () => {
    // Clean up test user and data
    try {
      await admin.auth().deleteUser(testUserId);
      await admin.firestore().collection('users').doc(testUserId).delete();
      await admin.firestore().collection('verifications').doc(testUserId).delete();
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  });

  test('should approve professional verification and redirect to dashboard', async ({ page }) => {
    // Step 1: Sign in as admin to approve the verification
    await page.goto('/login');

    // Sign in as admin
    await page.fill('input[type="email"]', 'Admin@test.com');
    await page.fill('input[type="password"]', 'Password@1');
    await page.click('button[type="submit"]');

    // Wait for admin dashboard to load
    await expect(page).toHaveURL('/admin/dashboard');

    // Navigate to professional management
    await page.click('text=Professionals');

    // Find and approve the test user's verification
    await page.click(`text=${testUserEmail}`);
    await page.click('button:has-text("Approve")');

    // Confirm approval
    await page.fill('textarea[placeholder*="notes"]', 'Test approval - automated test');
    await page.click('button:has-text("Confirm Approval")');

    // Wait for approval to process
    await page.waitForTimeout(3000);

    // Sign out as admin
    await page.click('button:has-text("Sign Out")');
    await expect(page).toHaveURL('/login');

    // Step 2: Sign in as the test professional user
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Step 3: Wait for the professional dashboard to load
    await expect(page).toHaveURL('/professional/dashboard', { timeout: 10000 });

    // Step 4: Verify the success toast appears
    await expect(page.locator('.Toastify__toast--success')).toContainText(
      "You're all set—dashboard unlocked!",
      { timeout: 10000 }
    );

    // Step 5: Verify user can access professional features
    await expect(page.locator('h1')).toContainText('Professional Dashboard');

    // Verify navigation items are accessible
    await expect(page.locator('nav')).toContainText('Calendar');
    await expect(page.locator('nav')).toContainText('Clients');
    await expect(page.locator('nav')).toContainText('Services');

    // Test navigation to ensure full access
    await page.click('text=Calendar');
    await expect(page).toHaveURL('/professional/calendar');

    await page.click('text=Services');
    await expect(page).toHaveURL('/professional/services');
  });

  test('should handle verification rejection gracefully', async ({ page }) => {
    // Step 1: Sign in as admin to reject the verification
    await page.goto('/login');

    // Sign in as admin
    await page.fill('input[type="email"]', 'Admin@test.com');
    await page.fill('input[type="password"]', 'Password@1');
    await page.click('button[type="submit"]');

    // Wait for admin dashboard to load
    await expect(page).toHaveURL('/admin/dashboard');

    // Navigate to professional management
    await page.click('text=Professionals');

    // Find and reject the test user's verification
    await page.click(`text=${testUserEmail}`);
    await page.click('button:has-text("Reject")');

    // Confirm rejection
    await page.fill('textarea[placeholder*="notes"]', 'Test rejection - automated test');
    await page.click('button:has-text("Confirm Rejection")');

    // Wait for rejection to process
    await page.waitForTimeout(3000);

    // Sign out as admin
    await page.click('button:has-text("Sign Out")');
    await expect(page).toHaveURL('/login');

    // Step 2: Sign in as the test professional user
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Step 3: Should be redirected to pending page, not dashboard
    await expect(page).toHaveURL('/professional/pending', { timeout: 10000 });

    // Step 4: Verify rejection message is displayed
    await expect(page.locator('text=rejected')).toBeVisible();

    // Step 5: Verify user cannot access professional dashboard
    await page.goto('/professional/dashboard');
    await expect(page).toHaveURL('/professional/pending');
  });

  test('should maintain pending status for unprocessed verification', async ({ page }) => {
    // Sign in as the test professional user without admin approval
    await page.goto('/login');

    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Should be redirected to pending page
    await expect(page).toHaveURL('/professional/pending', { timeout: 10000 });

    // Verify pending message is displayed
    await expect(page.locator('text=pending')).toBeVisible();

    // Verify user cannot access professional dashboard
    await page.goto('/professional/dashboard');
    await expect(page).toHaveURL('/professional/pending');
  });
});
