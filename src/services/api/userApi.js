// src/services/api/userApi.js - Fixed response format and error handling
import { userApiClient } from '../../config/apiConfig';

export const userApi = {
  // Login user - FIXED response format
  login: async (nim, password) => {
    try {
      console.log('🔐 API: Attempting login for NIM:', nim);
      const payload = { nim: nim.toString().trim(), password };

      const response = await userApiClient.post('/api/auth/login', payload);
      console.log('📋 API: Raw login response:', response.data);

      // Check if backend response has success flag
      if (response.data && response.data.success) {
        // Backend returned { success: true, data: { accessToken, refreshToken, user }, message }
        console.log('✅ API: Login successful, returning data:', response.data.data);
        
        return {
          success: true,
          data: response.data.data, // This should contain { accessToken, refreshToken, user }
          message: response.data.message || 'Login berhasil',
        };
      } else if (response.data && response.data.accessToken) {
        // Backend returned direct { accessToken, refreshToken, user } format
        console.log('✅ API: Login successful (direct format), wrapping data');
        
        return {
          success: true,
          data: response.data, // Direct format
          message: 'Login berhasil',
        };
      } else {
        // Unexpected response format
        console.error('❌ API: Unexpected response format:', response.data);
        
        return {
          success: false,
          message: 'Format response tidak valid',
          error: new Error('Invalid response format')
        };
      }
    } catch (error) {
      console.error('❌ API: Login error:', error);
      
      let errorMessage = 'Login gagal';
      if (error.response) {
        console.error('❌ API: Server error response:', error.response.data);
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        console.error('❌ API: Network error - no response received');
        errorMessage = 'Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:5000';
      } else {
        console.error('❌ API: Request setup error:', error.message);
        errorMessage = error.message || 'Terjadi kesalahan yang tidak diketahui';
      }

      return {
        success: false,
        message: errorMessage,
        error,
      };
    }
  },

  // Register user - FIXED response format
  register: async (nim, username, password) => {
    try {
      console.log('📝 API: Attempting registration for NIM:', nim);
      
      const payload = {
        nim: nim.toString().trim(),
        username: username.trim(),
        password: password
      };

      const response = await userApiClient.post('/api/auth/register', payload);
      console.log('📋 API: Raw register response:', response.data);
      
      // Handle different response formats
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Registrasi berhasil'
        };
      } else if (response.data && response.data.accessToken) {
        return {
          success: true,
          data: response.data,
          message: 'Registrasi berhasil'
        };
      } else {
        return {
          success: false,
          message: 'Format response registrasi tidak valid',
          error: new Error('Invalid response format')
        };
      }
    } catch (error) {
      console.error('❌ API: Register error:', error);
      
      let errorMessage = 'Registrasi gagal';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:5000';
      } else {
        errorMessage = error.message || 'Terjadi kesalahan yang tidak diketahui';
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error
      };
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      console.log('👤 API: Fetching user profile');
      
      const response = await userApiClient.get('/api/users/profile');
      console.log('📋 API: Profile response:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Profile berhasil dimuat'
      };
    } catch (error) {
      console.error('❌ API: Get profile error:', error);
      
      let errorMessage = 'Gagal memuat profil';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Tidak dapat terhubung ke server';
      } else {
        errorMessage = error.message || 'Terjadi kesalahan yang tidak diketahui';
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error
      };
    }
  },

  // Update user profile
  updateProfile: async (updateData) => {
    try {
      console.log('👤 API: Updating user profile');
      
      const response = await userApiClient.put('/api/users/profile', updateData);
      console.log('📋 API: Update profile response:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Profil berhasil diperbarui'
      };
    } catch (error) {
      console.error('❌ API: Update profile error:', error);
      
      let errorMessage = 'Gagal memperbarui profil';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Tidak dapat terhubung ke server';
      } else {
        errorMessage = error.message || 'Terjadi kesalahan yang tidak diketahui';
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error
      };
    }
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    try {
      console.log('🔄 API: Refreshing token');
      
      const payload = { refreshToken };
      const response = await userApiClient.post('/api/auth/refresh-token', payload);
      console.log('📋 API: Refresh token response:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Token berhasil diperbarui'
      };
    } catch (error) {
      console.error('❌ API: Refresh token error:', error);
      
      let errorMessage = 'Gagal memperbarui token';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Tidak dapat terhubung ke server';
      } else {
        errorMessage = error.message || 'Terjadi kesalahan yang tidak diketahui';
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error
      };
    }
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      console.log('👥 API: Fetching all users');
      
      const response = await userApiClient.get('/api/users');
      console.log('📋 API: Get all users response:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Users berhasil dimuat'
      };
    } catch (error) {
      console.error('❌ API: Get all users error:', error);
      
      let errorMessage = 'Gagal memuat users';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Tidak dapat terhubung ke server';
      } else {
        errorMessage = error.message || 'Terjadi kesalahan yang tidak diketahui';
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error
      };
    }
  },

  // Get user by ID (admin only)
  getUserById: async (userId) => {
    try {
      console.log('👤 API: Fetching user by ID:', userId);
      
      const response = await userApiClient.get(`/api/users/${userId}`);
      console.log('📋 API: Get user by ID response:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'User berhasil dimuat'
      };
    } catch (error) {
      console.error('❌ API: Get user by ID error:', error);
      
      let errorMessage = 'Gagal memuat user';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Tidak dapat terhubung ke server';
      } else {
        errorMessage = error.message || 'Terjadi kesalahan yang tidak diketahui';
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error
      };
    }
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    try {
      console.log('🗑️ API: Deleting user:', userId);
      
      const response = await userApiClient.delete(`/api/users/${userId}`);
      console.log('📋 API: Delete user response:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'User berhasil dihapus'
      };
    } catch (error) {
      console.error('❌ API: Delete user error:', error);
      
      let errorMessage = 'Gagal menghapus user';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Tidak dapat terhubung ke server';
      } else {
        errorMessage = error.message || 'Terjadi kesalahan yang tidak diketahui';
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error
      };
    }
  },

  // Update user role (admin only)
  updateUserRole: async (userId, role) => {
    try {
      console.log('🔐 API: Updating user role:', userId, 'to', role);
      
      const payload = { role };
      const response = await userApiClient.put(`/api/users/${userId}/role`, payload);
      console.log('📋 API: Update role response:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Role user berhasil diperbarui'
      };
    } catch (error) {
      console.error('❌ API: Update user role error:', error);
      
      let errorMessage = 'Gagal memperbarui role user';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Tidak dapat terhubung ke server';
      } else {
        errorMessage = error.message || 'Terjadi kesalahan yang tidak diketahui';
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error
      };
    }
  }
};