import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Still bootstrapping session from localStorage/API — don't redirect yet
  const hasStoredToken = !!(
    localStorage.getItem('token') || sessionStorage.getItem('token')
  );

  if (isLoading || (hasStoredToken && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const dest = ['admin', 'sub-admin', 'staff'].includes(user?.role)
      ? '/admin'
      : '/dashboard';
    return <Navigate to={dest} replace />;
  }

  return children;
};
