import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Icon from './Icon';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="empty-state">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="empty-state">
        <Icon name="alertCircle" size={32} />
        <p style={{ marginTop: 'var(--space-3)' }}>You don't have permission to access this page.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
