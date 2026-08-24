import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../../lib/useStore';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useStore();

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
