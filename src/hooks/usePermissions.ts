import { useAuth } from '../contexts/AuthContext';
import { Permission, PermissionAction, PermissionResource, ROLES } from '../types/auth';

export const usePermissions = () => {
  const { userProfile } = useAuth();

  const hasPermission = (action: PermissionAction, resource: PermissionResource): boolean => {
    if (!userProfile?.role) return false;

    const rolePermissions = ROLES[userProfile.role].permissions;
    return rolePermissions.some(
      (permission: Permission) =>
        permission.action === action && permission.resource === resource
    );
  };

  const can = {
    create: (resource: PermissionResource) => hasPermission('create', resource),
    read: (resource: PermissionResource) => hasPermission('read', resource),
    update: (resource: PermissionResource) => hasPermission('update', resource),
    delete: (resource: PermissionResource) => hasPermission('delete', resource),
  };

  return { can, hasPermission };
};