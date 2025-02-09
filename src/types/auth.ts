export type UserRole = 'admin' | 'professional' | 'client';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete';
export type PermissionResource = 'users' | 'bookings' | 'services' | 'settings' | 'profiles';

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