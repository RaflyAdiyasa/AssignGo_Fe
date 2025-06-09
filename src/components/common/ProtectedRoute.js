// src/components/common/ProtectedRoute.js - Fixed React hooks rules
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  // Always call useAuth at the top level - no conditional calls
  const { isAuthenticated, loading, isAdmin, user } = useAuth();
  
  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('🔒 User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // If admin is required but user is not admin, redirect to unauthorized
  if (requireAdmin && !isAdmin()) {
    console.log('⛔ Admin access required but user is not admin:', user?.role);
    return <Navigate to="/unauthorized" replace />;
  }
  
  // User is authenticated and has proper permissions
  console.log('✅ User authenticated and authorized:', { 
    isAuthenticated, 
    requireAdmin, 
    userRole: user?.role,
    isAdminUser: isAdmin() 
  });
  
  return children;
};

export default ProtectedRoute;