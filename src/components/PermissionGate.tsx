import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionAction, PermissionResource } from '../types/auth';

interface PermissionGateProps {
  action: PermissionAction;
  resource: PermissionResource;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  action,
  resource,
  children,
  fallback = null,
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(action, resource)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};