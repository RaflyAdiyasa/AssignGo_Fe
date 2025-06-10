// src/pages/user/Profile.js - FIXED version
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Save, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Shield,
  Calendar,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../services/api/userApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { handleApiError } from '../../services/utils/errorHandler';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    username: '',
    nim: ''
  });
  const [profileErrors, setProfileErrors] = useState({});
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        nim: user.nim || ''
      });
    }
  }, [user]);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Profile form validation
  const validateProfile = () => {
    const errors = {};
    
    if (!profileData.username.trim()) {
      errors.username = 'Username wajib diisi';
    } else if (profileData.username.trim().length < 3) {
      errors.username = 'Username minimal 3 karakter';
    } else if (profileData.username.trim().length > 50) {
      errors.username = 'Username maksimal 50 karakter';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Password form validation
  const validatePassword = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Password saat ini wajib diisi';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'Password baru wajib diisi';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password minimal 6 karakter';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password tidak cocok';
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'Password baru harus berbeda dari password saat ini';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile form input change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (profileErrors[name]) {
      setProfileErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle password form input change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // FIXED: Handle profile form submit dengan userApi langsung
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfile()) {
      setMessage({ 
        text: 'Silakan perbaiki kesalahan pada form', 
        type: 'error' 
      });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      console.log('👤 Updating profile with data:', { username: profileData.username.trim() });

      // FIXED: Call userApi.updateProfile langsung
      const result = await userApi.updateProfile({
        username: profileData.username.trim()
      });

      console.log('👤 Update profile result:', result);

      // FIXED: Handle response wrapper format dari userApi
      if (result && result.success) {
        setMessage({ 
          text: result.message || 'Profile berhasil diperbarui!', 
          type: 'success' 
        });
      } else if (result && result.data && !result.error) {
        setMessage({ 
          text: result.message || 'Profile berhasil diperbarui!', 
          type: 'success' 
        });
      } else {
        const errorMessage = result && result.message 
          ? result.message 
          : 'Gagal memperbarui profile';
        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error('❌ Update profile error:', error);
      
      let errorMessage = 'Gagal memperbarui profile';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          errorMessage = data.message || 'Data tidak valid. Periksa form Anda.';
        } else if (status === 401) {
          errorMessage = 'Sesi Anda telah berakhir. Silakan login ulang.';
        } else if (status === 403) {
          errorMessage = 'Anda tidak memiliki akses untuk mengubah profile.';
        } else if (status === 500) {
          errorMessage = 'Terjadi kesalahan server. Coba lagi nanti.';
        } else {
          errorMessage = data.message || `Server error: ${status}`;
        }
      } else if (error.request) {
        errorMessage = 'Koneksi bermasalah. Periksa koneksi internet Anda.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessage({ 
        text: errorMessage, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Handle password form submit dengan userApi langsung
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      setMessage({ 
        text: 'Silakan perbaiki kesalahan pada form password', 
        type: 'error' 
      });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      console.log('🔐 Updating password...');

      // FIXED: Call userApi.updateProfile untuk password
      const result = await userApi.updateProfile({
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword
      });

      console.log('🔐 Update password result:', result);

      // FIXED: Handle response wrapper format dari userApi
      if (result && result.success) {
        setMessage({ 
          text: result.message || 'Password berhasil diubah!', 
          type: 'success' 
        });
        
        // Reset password form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else if (result && result.data && !result.error) {
        setMessage({ 
          text: result.message || 'Password berhasil diubah!', 
          type: 'success' 
        });
        
        // Reset password form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const errorMessage = result && result.message 
          ? result.message 
          : 'Gagal mengubah password';
        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error('❌ Update password error:', error);
      
      let errorMessage = 'Gagal mengubah password';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          errorMessage = data.message || 'Password saat ini salah atau data tidak valid.';
        } else if (status === 401) {
          errorMessage = 'Password saat ini salah atau sesi telah berakhir.';
        } else if (status === 403) {
          errorMessage = 'Anda tidak memiliki akses untuk mengubah password.';
        } else if (status === 500) {
          errorMessage = 'Terjadi kesalahan server. Coba lagi nanti.';
        } else {
          errorMessage = data.message || `Server error: ${status}`;
        }
      } else if (error.request) {
        errorMessage = 'Koneksi bermasalah. Periksa koneksi internet Anda.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessage({ 
        text: errorMessage, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (authLoading) {
    return <LoadingSpinner size="large" message="Memuat profile..." fullScreen />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.username}</h1>
            <p className="text-blue-100 mb-1">NIM: {user?.nim}</p>
            <div className="flex items-center space-x-2">
              {user?.isAdmin ? (
                <span className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-sm font-medium flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  Administrator
                </span>
              ) : (
                <span className="bg-blue-500 bg-opacity-50 text-white px-2 py-1 rounded-full text-sm font-medium">
                  User
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center space-x-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <p className={`font-medium ${
            message.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Informasi Profile</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'password'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Ubah Password</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Informasi Profile</h2>
                <p className="text-gray-600">Kelola informasi akun Anda</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* NIM (Read Only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIM
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.nim}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">NIM tidak dapat diubah</p>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <div className="relative">
                    <Edit3 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="username"
                      value={profileData.username}
                      onChange={handleProfileChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        profileErrors.username 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder="Masukkan username"
                      disabled={loading}
                    />
                  </div>
                  {profileErrors.username && (
                    <p className="mt-2 text-sm text-red-600">{profileErrors.username}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {profileData.username.length}/50 karakter
                  </p>
                </div>

                {/* Role (Read Only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={user?.isAdmin ? 'Administrator' : 'User'}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Role ditentukan oleh administrator</p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !profileData.username.trim() || profileData.username.trim() === user?.username}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Simpan Perubahan</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Ubah Password</h2>
                <p className="text-gray-600">Pastikan password baru Anda aman dan mudah diingat</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Saat Ini *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        passwordErrors.currentPassword 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder="Masukkan password saat ini"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-2 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Baru *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        passwordErrors.newPassword 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder="Masukkan password baru"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-2 text-sm text-red-600">{passwordErrors.newPassword}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Password minimal 6 karakter</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password Baru *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        passwordErrors.confirmPassword 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300'
                      }`}
                      placeholder="Ulangi password baru"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Security Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Tips Keamanan Password:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Gunakan kombinasi huruf besar, kecil, angka, dan simbol</li>
                    <li>• Minimal 8 karakter untuk keamanan optimal</li>
                    <li>• Jangan gunakan informasi pribadi (nama, tanggal lahir)</li>
                    <li>• Pastikan password berbeda dari akun lain</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="small" />
                        <span>Mengubah...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Ubah Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;