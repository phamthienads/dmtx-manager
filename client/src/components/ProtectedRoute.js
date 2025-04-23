import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requireAdmin = false }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute; 