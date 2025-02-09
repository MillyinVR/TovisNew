import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!currentUser || !userProfile) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(userProfile.role)) {
    // Redirect based on role
    switch (userProfile.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" />;
      case 'professional':
        return <Navigate to="/professional/dashboard" />;
      case 'pending_professional':
        return <Navigate to="/professional/pending" />;
      case 'client':
        return <Navigate to="/client/dashboard" />;
      default:
        return <Navigate to="/login" />;
    }
  }

  return <>{children}</>;
};
