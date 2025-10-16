import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { isAdmin, user } = useAuth();

  const getUserRole = () => {
    if (isAdmin()) return 'admin';
    return user?.role || 'student';
  };

  const currentRole = getUserRole();

  if (!allowedRoles.includes(currentRole)) {
    // Redirect unauthorized users to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleProtectedRoute;