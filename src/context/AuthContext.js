// src/context/AuthContext.js - Simplified using authApi
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api/authApi';
import { USER_ROLES, API_MESSAGES } from '../utils/constants';

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
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('userData');

        if (accessToken && userData) {
          const parsedUser = JSON.parse(userData);
          
          // Validate token by fetching user profile
          try {
            const profileData = await authApi.getProfile();
            console.log('📋 Profile data during init:', profileData);
            
            // Handle different profile response formats
            let userInfo = profileData;
            if (profileData.user) {
              userInfo = profileData.user;
            } else if (profileData.data && profileData.data.user) {
              userInfo = profileData.data.user;
            }
            
            // Update with fresh data from server
            const freshUser = {
              id: userInfo.id,
              username: userInfo.username,
              nim: userInfo.nim,
              role: userInfo.role,
              isAdmin: userInfo.role === USER_ROLES.ADMIN
            };
            
            setUser(freshUser);
            setIsAuthenticated(true);
            
            // Update localStorage with fresh data
            localStorage.setItem('userData', JSON.stringify(freshUser));
          } catch (profileError) {
            console.error('Profile validation failed:', profileError);
            logout();
          }
        } else {
          // No stored auth data
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function - Simple using authApi
  const login = async (nim, password) => {
    try {
      console.log('🔐 Attempting login for NIM:', nim);
      
      const response = await authApi.login(nim, password);
      console.log('📋 Login response:', response);
      
      // Extract data from response - backend uses 'token' not 'accessToken'
      const { token, refreshToken, user: userData } = response;
      
      if (!token || !userData) {
        console.error('❌ Missing token or user data:', { token: !!token, userData: !!userData });
        return {
          success: false,
          message: 'Login gagal - data tidak lengkap'
        };
      }
      
      // Store tokens - use 'accessToken' key for consistency with frontend
      localStorage.setItem('accessToken', token); // Store 'token' as 'accessToken'
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Create user object
      const userObj = {
        id: userData.id,
        username: userData.username,
        nim: userData.nim,
        role: userData.role,
        isAdmin: userData.role === USER_ROLES.ADMIN
      };
      
      // Store user data
      localStorage.setItem('userData', JSON.stringify(userObj));
      
      // Update state
      setUser(userObj);
      setIsAuthenticated(true);
      
      console.log('✅ Login successful for user:', userObj);
      
      return {
        success: true,
        data: userObj,
        message: response.message || 'Login berhasil'
      };
      
    } catch (error) {
      console.error('❌ Login error:', error);
      
      let errorMessage = 'Login gagal';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error
      };
    }
  };

  // Register function - Simple using authApi
  const register = async (registrationData) => {
    try {
      console.log('📝 Attempting registration for NIM:', registrationData.nim);
      
      const response = await authApi.register(
        registrationData.nim,
        registrationData.username,
        registrationData.password,
        registrationData.isAdmin
      );
      
      console.log('📋 Register response:', response);
      
      // Extract data from response - backend uses 'token' not 'accessToken'
      const { token, refreshToken, user: userData } = response;
      
      if (!token || !userData) {
        console.error('❌ Missing token or user data:', { token: !!token, userData: !!userData });
        return {
          success: false,
          message: 'Registrasi gagal - data tidak lengkap'
        };
      }
      
      // Store tokens - use 'accessToken' key for consistency with frontend
      localStorage.setItem('accessToken', token); // Store 'token' as 'accessToken'
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Create user object
      const userObj = {
        id: userData.id,
        username: userData.username,
        nim: userData.nim,
        role: userData.role || USER_ROLES.USER,
        isAdmin: (userData.role || USER_ROLES.USER) === USER_ROLES.ADMIN
      };
      
      // Store user data
      localStorage.setItem('userData', JSON.stringify(userObj));
      
      // Update state
      setUser(userObj);
      setIsAuthenticated(true);
      
      console.log('✅ Registration successful for user:', userObj);
      
      return {
        success: true,
        data: userObj,
        message: response.message || 'Registrasi berhasil'
      };
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      let errorMessage = 'Registrasi gagal';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error
      };
    }
  };

  // Logout function
  const logout = () => {
    console.log('🚪 Logging out user');
    
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    
    // Clear state
    setUser(null);
    setIsAuthenticated(false);
    
    console.log('✅ Logout completed');
  };

  // Update profile function
  const updateProfile = async (updateData) => {
    try {
      console.log('👤 Updating profile for user:', user?.id);
      
      const response = await authApi.updateProfile(updateData);
      console.log('📋 Update profile response:', response);
      
      // Handle different response formats
      let userInfo = response;
      if (response.user) {
        userInfo = response.user;
      } else if (response.data && response.data.user) {
        userInfo = response.data.user;
      }
      
      // Update user object with new data
      const updatedUser = {
        ...user,
        username: userInfo.username || user.username,
      };
      
      // Update state and localStorage
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      console.log('✅ Profile updated successfully');
      
      return {
        success: true,
        data: updatedUser,
        message: response.message || 'Profil berhasil diperbarui'
      };
    } catch (error) {
      console.error('❌ Profile update error:', error);
      
      return {
        success: false,
        message: error.message || 'Gagal memperbarui profil',
        error: error
      };
    }
  };

  // Utility functions
  const isAdmin = () => {
    return user?.role === USER_ROLES.ADMIN || user?.isAdmin === true;
  };

  const isUser = () => {
    return user?.role === USER_ROLES.USER || (user && !user.isAdmin);
  };

  const getUserId = () => {
    return user?.id;
  };

  const getUserRole = () => {
    return user?.role || (user?.isAdmin ? USER_ROLES.ADMIN : USER_ROLES.USER);
  };

  const hasPermission = (requiredRole) => {
    if (!user || !isAuthenticated) return false;
    
    const userRole = getUserRole();
    
    // Admin has access to everything
    if (userRole === USER_ROLES.ADMIN) return true;
    
    // Check specific role requirement
    return userRole === requiredRole;
  };

  // Check if user can access a specific feature
  const canAccess = (feature) => {
    if (!user || !isAuthenticated) return false;
    
    const permissions = {
      // Admin-only features
      'admin.dashboard': isAdmin(),
      'admin.users': isAdmin(),
      'admin.nims': isAdmin(),
      'admin.approve': isAdmin(),
      'admin.reports': isAdmin(),
      'admin.settings': isAdmin(),
      
      // User features
      'user.dashboard': isAuthenticated,
      'user.surat.create': isUser() || isAdmin(),
      'user.surat.view': isAuthenticated,
      'user.profile': isAuthenticated,
      
      // Shared features
      'surat.view': isAuthenticated,
      'profile.view': isAuthenticated
    };
    
    return permissions[feature] || false;
  };

  // Force refresh user data
  const refreshUserData = async () => {
    try {
      console.log('🔄 Refreshing user data...');
      
      const profileData = await authApi.getProfile();
      console.log('📋 Profile data during refresh:', profileData);
      
      // Handle different profile response formats
      let userInfo = profileData;
      if (profileData.user) {
        userInfo = profileData.user;
      } else if (profileData.data && profileData.data.user) {
        userInfo = profileData.data.user;
      }
      
      const freshUser = {
        id: userInfo.id,
        username: userInfo.username,
        nim: userInfo.nim,
        role: userInfo.role,
        isAdmin: userInfo.role === USER_ROLES.ADMIN
      };
      
      setUser(freshUser);
      localStorage.setItem('userData', JSON.stringify(freshUser));
      
      console.log('✅ User data refreshed');
      
      return {
        success: true,
        data: freshUser
      };
    } catch (error) {
      console.error('❌ Refresh user data error:', error);
      
      // If refresh fails, user might need to login again
      logout();
      
      return {
        success: false,
        message: 'Sesi telah berakhir. Silakan login ulang.',
        error: error
      };
    }
  };

  const contextValue = {
    // State
    user,
    loading,
    isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    refreshUserData,
    
    // Utilities
    isAdmin,
    isUser,
    getUserId,
    getUserRole,
    hasPermission,
    canAccess
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};