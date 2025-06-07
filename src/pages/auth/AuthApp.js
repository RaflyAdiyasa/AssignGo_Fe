// src/pages/auth/AuthApp.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Mail, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AuthApp = () => {
  const navigate = useNavigate();
  const { login, register, loading, isAuthenticated, isAdmin } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nim: '',
    username: '',
    password: '',
    isAdmin: false
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = isAdmin() ? '/admin/dashboard' : '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      let result;
      
      if (isLoginMode) {
        result = await login(formData.nim, formData.password);
      } else {
        result = await register(formData.nim, formData.username, formData.password, formData.isAdmin);
      }

      if (result.success) {
        setMessage({ text: result.message, type: 'success' });
        
        if (isLoginMode) {
          // Login successful - navigation will be handled by useEffect
          const redirectPath = result.user?.isAdmin ? '/admin/dashboard' : '/dashboard';
          navigate(redirectPath, { replace: true });
        } else {
          // Register successful - switch to login mode
          setTimeout(() => {
            setIsLoginMode(true);
            setFormData({ nim: formData.nim, username: '', password: '', isAdmin: false });
            setMessage({ text: 'Registrasi berhasil! Silakan login dengan akun baru Anda', type: 'info' });
          }, 2000);
        }
      } else {
        setMessage({ text: result.message, type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Terjadi kesalahan yang tidak terduga', type: 'error' });
      console.error('Auth error:', error);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({ nim: '', username: '', password: '', isAdmin: false });
    setMessage({ text: '', type: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Mail className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Sistem Surat Tugas
          </h1>
          <p className="text-gray-600">
            {isLoginMode ? 'Masuk ke akun Anda' : 'Daftar akun baru'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setIsLoginMode(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                isLoginMode
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLoginMode(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                !isLoginMode
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Register
            </button>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
              message.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
              'bg-blue-100 text-blue-700 border border-blue-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NIM Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NIM
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="nim"
                  value={formData.nim}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Masukkan NIM"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Username Field (hanya untuk register) */}
            {!isLoginMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Masukkan username"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Masukkan password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Admin Checkbox (hanya untuk register) */}
            {!isLoginMode && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isAdmin"
                  id="isAdmin"
                  checked={formData.isAdmin}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={loading}
                />
                <label htmlFor="isAdmin" className="ml-2 text-sm text-gray-700">
                  Daftar sebagai Admin
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
              } text-white`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  {isLoginMode ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {isLoginMode ? 'Login' : 'Register'}
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            {isLoginMode ? "Belum punya akun?" : "Sudah punya akun?"}{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              disabled={loading}
            >
              {isLoginMode ? 'Daftar sekarang' : 'Login di sini'}
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Demo:</strong> Aplikasi ini terhubung ke User Service (port 3001) dan Mail Service (port 3002). 
            Pastikan kedua backend service sudah berjalan sebelum menggunakan aplikasi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthApp;