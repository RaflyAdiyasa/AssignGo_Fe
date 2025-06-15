// src/pages/admin/AdminDashboard.js - Fixed version using latestStatus from backend like MailManagement
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Calendar,
  Mail,
  AlertTriangle,
  RefreshCw,
  Eye,
  BarChart3,
  Wifi,
  WifiOff,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { suratApi } from '../../services/api/suratApi';
import { userApi } from '../../services/api/userApi';
import LoadingSpinner, { SkeletonCard } from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/surat/StatusBadge';
import { formatDate, getRelativeTime } from '../../utils/dateUtils';
import { handleConnectionError, safeApiCall, validateApiResponse } from '../../services/utils/errorHandler';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalSurat: 0,
      pendingApprovals: 0,
      approvalRate: 0
    },
    suratStats: {
      diproses: 0,
      disetujui: 0,
      ditolak: 0
    },
    recentSurat: [],
    recentUsers: []
  });
  const [connectionStatus, setConnectionStatus] = useState({
    userService: 'unknown',
    mailService: 'unknown'
  });
  const [errors, setErrors] = useState({
    userService: null,
    mailService: null,
    general: null
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState(null);

  // Helper function to safely extract array from API response (same as MailManagement)
  const extractArrayFromResponse = (response, defaultArray = []) => {
    if (!response || !response.success) {
      return defaultArray;
    }
    
    const data = response.data;
    
    // If data is already an array
    if (Array.isArray(data)) {
      return data;
    }
    
    // If data is an object with various possible array properties
    if (data && typeof data === 'object') {
      // Try common property names for arrays
      const possibleArrayKeys = ['users', 'mails', 'data', 'items', 'results'];
      
      for (const key of possibleArrayKeys) {
        if (Array.isArray(data[key])) {
          return data[key];
        }
      }
      
      // If data is an object but not an array, return empty array
      return defaultArray;
    }
    
    return defaultArray;
  };

  // Fetch dashboard data with user mapping - using same approach as MailManagement
  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setErrors({ userService: null, mailService: null, general: null });

      console.log('🔄 Starting dashboard data fetch...');

      // Fetch data with safe API calls - same as MailManagement
      const [suratResult, usersResult] = await Promise.all([
        safeApiCall(
          () => suratApi.getAllSurat(), 
          [], 
          'Mail Service'
        ),
        safeApiCall(
          () => userApi.getAllUsers(), 
          [], 
          'User Service'
        )
      ]);

      console.log('📊 API Results:', { suratResult, usersResult });

      // Update connection status
      setConnectionStatus({
        userService: usersResult.success ? 'connected' : 'error',
        mailService: suratResult.success ? 'connected' : 'error'
      });

      // Update errors if any
      const newErrors = {};
      if (!usersResult.success) {
        newErrors.userService = usersResult.message;
      }
      if (!suratResult.success) {
        newErrors.mailService = suratResult.message;
      }
      setErrors(newErrors);

      // Process data even if some services failed - use the extraction helper like MailManagement
      const allSurat = extractArrayFromResponse(suratResult, []);
      const allUsers = extractArrayFromResponse(usersResult, []);

      console.log('📋 Processed data:', { 
        suratCount: allSurat.length, 
        usersCount: allUsers.length 
      });

      // Create user map for quick lookup - same as MailManagement
      const userMap = {};
      allUsers.forEach(userData => {
        if (userData && userData.id) {
          userMap[userData.id] = userData;
        }
      });

      console.log('👥 User map created with', Object.keys(userMap).length, 'users');

      // Map surat data with user information - same as MailManagement
      const suratWithUserData = allSurat.map(surat => {
        if (!surat || !surat.id) {
          console.warn('Invalid surat data:', surat);
          return null;
        }

        const userData = userMap[surat.id_pengirim];
        return {
          ...surat,
          user: userData ? {
            id: userData.id,
            username: userData.username || 'Unknown User',
            nim: userData.nim || 'N/A'
          } : {
            id: surat.id_pengirim || 'unknown',
            username: 'Unknown User',
            nim: 'N/A'
          }
        };
      }).filter(surat => surat !== null); // Remove null entries

      console.log('📋 Processed surat with user data:', suratWithUserData.length);

      // Calculate statistics safely - using latestStatus from backend like MailManagement
      const totalSurat = suratWithUserData.length;
      const totalUsers = allUsers.length;
      
      // Count status using latestStatus from backend - same as MailManagement
      const suratStats = { diproses: 0, disetujui: 0, ditolak: 0 };
      
      suratWithUserData.forEach(surat => {
        try {
          // Backend already provides latestStatus - same logic as MailManagement
          const latestStatus = surat.latestStatus || 'diproses'; // default status
          
          if (suratStats.hasOwnProperty(latestStatus)) {
            suratStats[latestStatus]++;
          } else {
            suratStats.diproses++; // fallback for unknown status
          }
        } catch (error) {
          console.warn('Error processing surat stats:', surat.id, error);
          suratStats.diproses++; // fallback
        }
      });

      const pendingApprovals = suratStats.diproses;
      const approvalRate = totalSurat > 0 ? Math.round((suratStats.disetujui / totalSurat) * 100) : 0;

      console.log('📊 Stats calculated:', { 
        suratStats, 
        pendingApprovals, 
        approvalRate 
      });

      // Get recent surat (last 5) safely
      const recentSurat = suratWithUserData
        .sort((a, b) => {
          try {
            const dateA = new Date(a.tanggal_pengiriman || a.createdAt || '1970-01-01');
            const dateB = new Date(b.tanggal_pengiriman || b.createdAt || '1970-01-01');
            return dateB - dateA;
          } catch (error) {
            return 0;
          }
        })
        .slice(0, 5);

      // Get recent users (last 5) safely
      const recentUsers = allUsers
        .sort((a, b) => {
          try {
            const dateA = new Date(
              a.created_at || a.tanggal_daftar || a.createdAt || '1970-01-01'
            );
            const dateB = new Date(
              b.created_at || b.tanggal_daftar || b.createdAt || '1970-01-01'
            );
            return dateB - dateA;
          } catch (error) {
            return 0;
          }
        })
        .slice(0, 5);

      // Update state
      setDashboardData({
        stats: {
          totalUsers,
          totalSurat,
          pendingApprovals,
          approvalRate
        },
        suratStats,
        recentSurat,
        recentUsers
      });

      console.log('✅ Dashboard data updated successfully');

    } catch (error) {
      console.error('❌ Dashboard fetch error:', error);
      const errorResult = handleConnectionError(error, 'Dashboard');
      setErrors(prev => ({ ...prev, general: errorResult.message }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refresh handler
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Handle view detail
  const handleViewDetail = (surat) => {
    setSelectedSurat(surat);
    setShowDetailModal(true);
  };

  // Connection status indicator
  const ConnectionIndicator = ({ service, status, error }) => {
    const getStatusIcon = () => {
      switch (status) {
        case 'connected':
          return <Wifi className="w-4 h-4 text-green-500" />;
        case 'error':
          return <WifiOff className="w-4 h-4 text-red-500" />;
        default:
          return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      }
    };

    const getStatusColor = () => {
      switch (status) {
        case 'connected':
          return 'text-green-600';
        case 'error':
          return 'text-red-600';
        default:
          return 'text-yellow-600';
      }
    };

    return (
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className={`text-xs ${getStatusColor()}`}>
          {service}: {status === 'connected' ? 'Connected' : status === 'error' ? 'Error' : 'Unknown'}
        </span>
      </div>
    );
  };

  if (loading && !refreshing) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const { stats, suratStats, recentSurat, recentUsers } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Dashboard Admin 👑
            </h1>
            <p className="text-purple-100">
              Selamat datang, {user?.username}! Kelola sistem surat tugas dengan mudah
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <BarChart3 className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Connection Status & Errors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Status Koneksi Backend</h3>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1 text-gray-500 hover:text-gray-700 rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="space-y-2">
            <ConnectionIndicator 
              service="User Service" 
              status={connectionStatus.userService} 
              error={errors.userService}
            />
            <ConnectionIndicator 
              service="Mail Service" 
              status={connectionStatus.mailService} 
              error={errors.mailService}
            />
          </div>
        </div>

        {/* Error Messages */}
        {(errors.userService || errors.mailService || errors.general) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800 mb-2">Peringatan Koneksi</h3>
                <div className="space-y-1 text-sm text-yellow-700">
                  {errors.userService && (
                    <p>• User Service: {errors.userService}</p>
                  )}
                  {errors.mailService && (
                    <p>• Mail Service: {errors.mailService}</p>
                  )}
                  {errors.general && (
                    <p>• General: {errors.general}</p>
                  )}
                </div>
                <p className="text-xs text-yellow-600 mt-2">
                  Data yang ditampilkan mungkin tidak lengkap. Sistem akan terus mencoba terhubung.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total User</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
          {connectionStatus.userService === 'error' && (
            <div className="mt-2 text-xs text-red-600">
              Data mungkin tidak akurat
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Surat</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSurat}</p>
            </div>
          </div>
          {connectionStatus.mailService === 'error' && (
            <div className="mt-2 text-xs text-red-600">
              Data mungkin tidak akurat
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Perlu Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
            </div>
          </div>
          {stats.pendingApprovals > 0 && (
            <div className="mt-2">
              <Link 
                to="/admin/approval"
                className="text-yellow-600 hover:text-yellow-700 text-sm font-medium flex items-center"
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Review Sekarang
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approval Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approvalRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Distribusi Status Surat</h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-700">{suratStats.diproses}</p>
              <p className="text-sm text-yellow-600">Diproses</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-700">{suratStats.disetujui}</p>
              <p className="text-sm text-green-600">Disetujui</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-700">{suratStats.ditolak}</p>
              <p className="text-sm text-red-600">Ditolak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Surat */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Surat Terbaru</h2>
              <Link
                to="/admin/surat"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Lihat Semua
              </Link>
            </div>
          </div>

          <div className="p-6">
            {connectionStatus.mailService === 'error' ? (
              <div className="text-center py-8">
                <WifiOff className="w-12 h-12 text-red-300 mx-auto mb-4" />
                <p className="text-red-500 font-medium">Koneksi Mail Service Bermasalah</p>
                <p className="text-red-400 text-sm mt-1">
                  {errors.mailService}
                </p>
                <button
                  onClick={handleRefresh}
                  className="mt-3 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            ) : recentSurat.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Belum ada surat</p>
                <p className="text-gray-400 text-sm mt-1">
                  Data surat akan muncul setelah ada yang mengajukan
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentSurat.map((surat) => {
                  try {
                    // Use latestStatus from backend like MailManagement
                    const status = surat.latestStatus || 'diproses';
                    
                    return (
                      <div
                        key={surat.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">
                              {surat.subject_surat || 'Tanpa Subjek'}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>
                                {surat.user?.username || 'Unknown User'} ({surat.user?.nim || 'N/A'})
                              </span>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(surat.tanggal_pengiriman || surat.createdAt)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <StatusBadge status={status} />
                            <button
                              onClick={() => handleViewDetail(surat)}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded"
                              title="Lihat detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  } catch (error) {
                    console.warn('Error rendering surat item:', error);
                    return (
                      <div key={surat.id || Math.random()} className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <p className="text-red-600 text-sm">Error loading surat data</p>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">User Terbaru</h2>
              <Link
                to="/admin/users"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Lihat Semua
              </Link>
            </div>
          </div>

          <div className="p-6">
            {connectionStatus.userService === 'error' ? (
              <div className="text-center py-8">
                <WifiOff className="w-12 h-12 text-red-300 mx-auto mb-4" />
                <p className="text-red-500 font-medium">Koneksi User Service Bermasalah</p>
                <p className="text-red-400 text-sm mt-1">
                  {errors.userService}
                </p>
                <button
                  onClick={handleRefresh}
                  className="mt-3 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Belum ada user</p>
                <p className="text-gray-400 text-sm mt-1">
                  Data user akan muncul setelah ada yang mendaftar
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((userItem) => {
                  try {
                    return (
                      <div
                        key={userItem.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{userItem.username || 'Unknown'}</h3>
                              <p className="text-sm text-gray-500">NIM: {userItem.nim || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              userItem.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {userItem.role === 'admin' ? 'Admin' : 'User'}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {getRelativeTime(
                                userItem.created_at || 
                                userItem.tanggal_daftar || 
                                userItem.createdAt || 
                                '1970-01-01'
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  } catch (error) {
                    console.warn('Error rendering user item:', error);
                    return (
                      <div key={userItem.id || Math.random()} className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <p className="text-red-600 text-sm">Error loading user data</p>
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link
            to="/admin/approval"
            className={`border rounded-lg p-4 transition-colors group ${
              connectionStatus.mailService === 'connected' 
                ? 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200' 
                : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
            }`}
          >
            <Clock className="w-8 h-8 text-yellow-600 mb-2" />
            <h3 className="font-medium text-yellow-800">Review Surat</h3>
            <p className="text-sm text-yellow-600">{stats.pendingApprovals} menunggu</p>
            {connectionStatus.mailService === 'error' && (
              <p className="text-xs text-red-500 mt-1">Service offline</p>
            )}
          </Link>

          <Link
            to="/admin/users"
            className={`border rounded-lg p-4 transition-colors group ${
              connectionStatus.userService === 'connected' 
                ? 'bg-purple-50 hover:bg-purple-100 border-purple-200' 
                : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
            }`}
          >
            <Users className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-medium text-purple-800">Kelola User</h3>
            <p className="text-sm text-purple-600">{stats.totalUsers} total user</p>
            {connectionStatus.userService === 'error' && (
              <p className="text-xs text-red-500 mt-1">Service offline</p>
            )}
          </Link>

          <Link
            to="/admin/surat"
            className={`border rounded-lg p-4 transition-colors group ${
              connectionStatus.mailService === 'connected' 
                ? 'bg-blue-50 hover:bg-blue-100 border-blue-200' 
                : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
            }`}
          >
            <FileText className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-blue-800">Kelola Surat</h3>
            <p className="text-sm text-blue-600">{stats.totalSurat} total surat</p>
            {connectionStatus.mailService === 'error' && (
              <p className="text-xs text-red-500 mt-1">Service offline</p>
            )}
          </Link>

          <Link
            to="/admin/nim-management"
            className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg p-4 transition-colors group"
          >
            <FileText className="w-8 h-8 text-orange-600 mb-2" />
            <h3 className="font-medium text-orange-800">Kelola NIM</h3>
            <p className="text-sm text-orange-600">Whitelist NIM</p>
          </Link>

          <Link
            to="/admin/reports"
            className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 transition-colors group"
          >
            <BarChart3 className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-medium text-green-800">Lihat Laporan</h3>
            <p className="text-sm text-green-600">Statistik lengkap</p>
          </Link>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedSurat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Detail Surat</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subjek Surat
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedSurat.subject_surat || 'Tanpa Subjek'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pengirim
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedSurat.user?.username || 'Unknown User'} ({selectedSurat.user?.nim || 'N/A'})
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Pengiriman
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {formatDate(selectedSurat.tanggal_pengiriman || selectedSurat.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="bg-gray-50 p-2 rounded">
                    <StatusBadge status={selectedSurat.latestStatus || 'diproses'} />
                  </div>
                </div>
              </div>

              {/* Content if available */}
              {selectedSurat.isi_surat && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Isi Surat
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-4 rounded min-h-[100px] whitespace-pre-wrap">
                    {selectedSurat.isi_surat}
                  </div>
                </div>
              )}

              {/* File */}
              {(selectedSurat.url_file_surat || selectedSurat.file_surat) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File Lampiran
                  </label>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            File Surat Tugas
                          </p>
                          <p className="text-xs text-gray-500">
                            Klik download untuk melihat file
                          </p>
                        </div>
                      </div>
                      <a
                        href={selectedSurat.url_file_surat || selectedSurat.file_surat}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Lihat</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;