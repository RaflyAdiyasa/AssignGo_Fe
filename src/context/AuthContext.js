// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { userApiClient, API_CONFIG } from '../config/apiConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        
        // Verify token is still valid by calling profile endpoint
        const response = await userApiClient.get(API_CONFIG.USER_SERVICE.endpoints.profile);
        
        if (response.data.success) {
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          // Token invalid, clear storage
          clearAuthData();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const login = async (nim, password) => {
    try {
      setLoading(true);
      
      const response = await userApiClient.post(API_CONFIG.USER_SERVICE.endpoints.login, {
        nim,
        password
      });

      if (response.data.success) {
        const { accessToken, refreshToken, ...userData } = response.data.data;
        
        // Store tokens and user data
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Update state
        setUser(userData);
        setIsAuthenticated(true);
        
        return {
          success: true,
          message: response.data.message,
          user: userData
        };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (nim, username, password, isAdmin = false) => {
    try {
      setLoading(true);
      
      const response = await userApiClient.post(API_CONFIG.USER_SERVICE.endpoints.register, {
        nim,
        username,
        password,
        isAdmin
      });

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message
        };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
  };

  const clearAuthData = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
  };

  const updateUserProfile = async (updateData) => {
    try {
      setLoading(true);
      
      const response = await userApiClient.put(API_CONFIG.USER_SERVICE.endpoints.updateProfile, updateData);
      
      if (response.data.success) {
        // Update local user data if username was changed
        if (updateData.username) {
          const updatedUser = { ...user, username: updateData.username };
          setUser(updatedUser);
          localStorage.setItem('userData', JSON.stringify(updatedUser));
        }
        
        return {
          success: true,
          message: response.data.message
        };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await userApiClient.post(API_CONFIG.USER_SERVICE.endpoints.refreshToken, {
        refreshToken
      });

      if (response.data.success) {
        const newAccessToken = response.data.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        return newAccessToken;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  // Helper function to check if user is admin
  const isAdmin = () => {
    return user?.isAdmin || false;
  };

  // Helper function to get user ID
  const getUserId = () => {
    return user?.id;
  };

  const value = {
    // State
    user,
    isAuthenticated,
    loading,
    
    // Actions
    login,
    register,
    logout,
    updateUserProfile,
    refreshAccessToken,
    
    // Helpers
    isAdmin,
    getUserId
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};