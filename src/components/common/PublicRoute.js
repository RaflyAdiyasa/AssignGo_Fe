// src/components/common/PublicRoute.js - Fixed React hooks rules
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicRoute = ({ children }) => {
  // Always call useAuth at the top level - no conditional calls
  const { isAuthenticated, loading, isAdmin } = useAuth();
  
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
  
  // If user is already authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    console.log('👤 User already authenticated, redirecting to dashboard');
    const redirectPath = isAdmin() ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  
  // If not authenticated, show the public content (login/register page)
  return children;
};

export default PublicRoute;