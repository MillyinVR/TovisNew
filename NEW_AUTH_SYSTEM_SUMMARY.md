# New Role-Based Authentication System with Firebase Custom Claims

## Overview

This document outlines the redesigned role-based authentication system that uses Firebase custom claims as the primary source of truth for permissions, with a normalized Firestore structure that eliminates data duplication.

## Key Changes

### 1. Firebase Custom Claims as Primary Authorization

- **Custom claims** are now the primary source of truth for user roles and permissions
- **Firestore rules** check custom claims first, with document-based fallbacks
- **Automatic claim updates** via cloud functions when user roles change

### 2. Normalized Database Structure

- **Users collection**: Canonical source of truth for all user metadata
- **Verifications collection**: Separate collection for verification documents and statuses only
- **No role duplication**: Roles and verification statuses are not repeated across multiple collections

### 3. Automatic Claim Management

- **Cloud functions** automatically update custom claims when user documents change
- **Real-time synchronization** between Firestore data and Firebase Auth claims
- **Verification workflow** automatically promotes pending professionals to full professionals

## Database Structure

### Users Collection (`/users/{userId}`)

```typescript
interface User {
  uid: string;
  email: string;
  role: 'admin' | 'professional' | 'pending_professional' | 'client';
  professionalVerificationStatus?: 'pending' | 'approved' | 'rejected';
  verificationStatus?: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };
  // ... other user metadata
}
```

### Verifications Collection (`/verifications/{userId}`)

```typescript
interface Verification {
  userId: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string; // Admin user ID
  notes?: string;

  // Subcollection for documents
  documents: {
    [documentId]: VerificationDocument;
  };
}
```

## Custom Claims Structure

```typescript
interface CustomClaims {
  role: 'admin' | 'professional' | 'pending_professional' | 'client';
  admin?: boolean; // Set to true for admin users
  professional?: boolean; // Set to true for professional users
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  tier?: 'standard' | 'premium' | 'vip';
}
```

## Cloud Functions

### Automatic Claim Management

1. **`setInitialUserClaims`**: Sets claims when user document is created
2. **`updateUserClaims`**: Updates claims when user document changes
3. **`updateVerificationClaims`**: Updates claims when verification status changes

### Manual Claim Functions (for testing)

1. **`setAdminClaim`**: Manually set admin claims for test accounts
2. **`setProfessionalClaim`**: Manually set professional claims for test accounts

### Verification Management

1. **`approveProfessionalVerification`**: Approve professional verification (admin only)
2. **`rejectProfessionalVerification`**: Reject professional verification (admin only)

## Firestore Security Rules

### Primary Authorization Pattern

```javascript
function isAdmin() {
  return (
    request.auth != null && (request.auth.token.admin == true || request.auth.token.role == 'admin')
  );
}

function isProfessional() {
  return (
    request.auth != null &&
    (request.auth.token.professional == true || request.auth.token.role == 'professional')
  );
}
```

### Key Security Features

- **Claims-first authorization**: Custom claims are checked before document data
- **Fallback protection**: Document-based checks as backup for users without claims
- **Granular permissions**: Different access levels for different user types
- **Verification-aware**: Rules consider verification status for professionals

## Authentication Flow

### User Registration

1. User creates account with email/password
2. User document created in `/users/{userId}` with appropriate role
3. Cloud function automatically sets custom claims
4. For professionals: verification document created in `/verifications/{userId}`

### Role Promotion (Pending Professional → Professional)

1. Admin approves verification in `/verifications/{userId}`
2. Cloud function detects verification status change
3. User document updated: `role: 'professional'`, `professionalVerificationStatus: 'approved'`
4. Custom claims automatically updated with new role and verification status

### Permission Checking

1. **Primary**: Check custom claims in Firestore rules
2. **Fallback**: Check user document if claims not available
3. **Client-side**: Use custom claims from token for UI logic

## Test Accounts

The system includes special handling for test accounts:

- **Admin**: `Admin@test.com` / `Password@1`
- **Professional**: `professional@test.com` / `Password@1`
- **Client**: `client@test.com` / `Password@1`

## Migration Process

### Running the Migration

```bash
# Run the migration script
node scripts/migrateToNewAuthStructure.js

# Verify the migration
node scripts/migrateToNewAuthStructure.js verify
```

### Migration Steps

1. **Field Migration**: Convert old `verificationStatus` strings to new structure
2. **Verification Documents**: Create verification documents for pending professionals
3. **Custom Claims**: Set appropriate claims for all existing users
4. **Validation**: Verify migration completed successfully

## Benefits

### 1. Performance

- **Faster authorization**: Claims checked at rule level without database reads
- **Reduced queries**: No need to fetch user documents for permission checks
- **Scalable**: Claims are cached and don't require additional database operations

### 2. Security

- **Tamper-proof**: Custom claims can only be set by admin SDK
- **Real-time**: Claims are immediately available after updates
- **Consistent**: Single source of truth prevents permission inconsistencies

### 3. Maintainability

- **Normalized data**: No duplication of roles across collections
- **Automatic sync**: Claims stay in sync with database changes
- **Clear separation**: User metadata vs. verification data clearly separated

## Implementation Checklist

- [x] Updated type definitions (`src/types/auth.ts`, `src/types/user.ts`)
- [x] Redesigned cloud functions (`functions/src/auth.ts`)
- [x] Updated Firestore security rules (`firestore.rules`)
- [x] Modified AuthContext to use custom claims (`src/contexts/AuthContext.tsx`)
- [x] Created migration script (`scripts/migrateToNewAuthStructure.js`)
- [x] Built and deployed cloud functions

## Next Steps

1. **Deploy Functions**: Deploy the updated cloud functions to Firebase
2. **Update Rules**: Deploy the new Firestore security rules
3. **Run Migration**: Execute the migration script on existing data
4. **Test System**: Verify all authentication flows work correctly
5. **Monitor**: Watch for any issues with claim propagation or rule enforcement

## Troubleshooting

### Common Issues

1. **Claims not updating**: Check cloud function logs for errors
2. **Permission denied**: Verify claims are set correctly for the user
3. **Token refresh needed**: Force token refresh after claim updates

### Debugging

- Check Firebase Auth user custom claims in console
- Monitor cloud function execution logs
- Verify Firestore rule evaluation in Firebase console
- Use browser dev tools to inspect token claims

## Security Considerations

1. **Claim Validation**: Always validate claims server-side
2. **Token Refresh**: Implement proper token refresh mechanisms
3. **Fallback Rules**: Maintain document-based fallbacks for edge cases
4. **Audit Trail**: Log all role and verification status changes
5. **Rate Limiting**: Implement rate limiting for claim update functions
