export type UserRole = 'admin' | 'professional' | 'client' | 'pending_professional';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete';
export type PermissionResource = 'users' | 'bookings' | 'services' | 'settings' | 'profiles' | 'verifications';

export interface Permission {
  action: PermissionAction;
  resource: PermissionResource;
}

export interface Role {
  name: UserRole;
  displayName: string;
  permissions: Permission[];
}

export interface UserType {
  role: UserRole;
  tier: 'standard' | 'premium' | 'vip';
  permissions: Permission[];
  features: string[];
}

// Firebase Custom Claims interface
export interface CustomClaims {
  admin?: boolean;
  professional?: boolean;
  role?: UserRole;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  tier?: 'standard' | 'premium' | 'vip';
}

// Verification status types
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface VerificationDocument {
  id: string;
  userId: string;
  type: 'license' | 'certification' | 'insurance' | 'identity';
  documentUrl: string;
  status: VerificationStatus;
  submittedAt: any; // Firestore timestamp
  reviewedAt?: any; // Firestore timestamp
  reviewedBy?: string; // Admin user ID
  expiresAt?: any; // Firestore timestamp
  notes?: string;
  metadata?: {
    licenseNumber?: string;
    issuingAuthority?: string;
    state?: string;
    country?: string;
  };
}

export const ROLES: Record<UserRole, Role> = {
  admin: {
    name: 'admin',
    displayName: 'Administrator',
    permissions: [
      { action: 'create', resource: 'users' },
      { action: 'read', resource: 'users' },
      { action: 'update', resource: 'users' },
      { action: 'delete', resource: 'users' },
      { action: 'create', resource: 'services' },
      { action: 'read', resource: 'services' },
      { action: 'update', resource: 'services' },
      { action: 'delete', resource: 'services' },
      { action: 'read', resource: 'bookings' },
      { action: 'update', resource: 'bookings' },
      { action: 'delete', resource: 'bookings' },
      { action: 'create', resource: 'settings' },
      { action: 'read', resource: 'settings' },
      { action: 'update', resource: 'settings' },
      { action: 'create', resource: 'verifications' },
      { action: 'read', resource: 'verifications' },
      { action: 'update', resource: 'verifications' },
      { action: 'delete', resource: 'verifications' },
    ],
  },
  professional: {
    name: 'professional',
    displayName: 'Professional',
    permissions: [
      { action: 'read', resource: 'users' },
      { action: 'read', resource: 'services' },
      { action: 'create', resource: 'services' },
      { action: 'update', resource: 'services' },
      { action: 'read', resource: 'bookings' },
      { action: 'update', resource: 'bookings' },
      { action: 'read', resource: 'profiles' },
      { action: 'update', resource: 'profiles' },
      { action: 'create', resource: 'verifications' },
      { action: 'read', resource: 'verifications' },
    ],
  },
  pending_professional: {
    name: 'pending_professional',
    displayName: 'Pending Professional',
    permissions: [
      { action: 'read', resource: 'profiles' },
      { action: 'update', resource: 'profiles' },
      { action: 'create', resource: 'verifications' },
      { action: 'read', resource: 'verifications' },
    ],
  },
  client: {
    name: 'client',
    displayName: 'Client',
    permissions: [
      { action: 'read', resource: 'services' },
      { action: 'create', resource: 'bookings' },
      { action: 'read', resource: 'bookings' },
      { action: 'update', resource: 'profiles' },
      { action: 'read', resource: 'profiles' },
    ],
  },
};
