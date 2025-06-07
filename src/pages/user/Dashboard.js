// src/pages/user/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Calendar,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { suratApi } from '../../services/api/suratApi';
import LoadingSpinner, { SkeletonCard } from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/surat/StatusBadge';
import { formatDate, getRelativeTime } from '../../utils/dateUtils';
import { handleApiError } from '../../services/utils/errorHandler';

const Dashboard = () => {
  const { user, getUserId } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    diproses: 0,
    disetujui: 0,
    ditolak: 0
  });
  const [recentSurat, setRecentSurat] = useState([]);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Fetch user's surat
      const response = await suratApi.getUserSurat(userId);
      
      if (response.success) {
        const suratList = response.data || [];
        
        // Calculate statistics
        const newStats = {
          total: suratList.length,
          diproses: 0,
          disetujui: 0,
          ditolak: 0
        };

        // Count status from latest history of each surat
        suratList.forEach(surat => {
          if (surat.histories && surat.histories.length > 0) {
            const latestStatus = surat.histories[0].status;
            newStats[latestStatus] = (newStats[latestStatus] || 0) + 1;
          } else {
            // Default to 'diproses' if no history
            newStats.diproses += 1;
          }
        });

        setStats(newStats);
        
        // Get recent 5 surat
        const recent = suratList.slice(0, 5);
        setRecentSurat(recent);
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      const errorResult = handleApiError(error);
      setError(errorResult.message);
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

  // Quick actions
  const handleCreateSurat = () => {
    navigate('/surat/create');
  };

  const handleViewAllSurat = () => {
    navigate('/surat');
  };

  const handleViewDetail = (suratId) => {
    navigate(`/surat/${suratId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SkeletonCard />
          </div>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Selamat datang, {user?.username}! 👋
            </h1>
            <p className="text-blue-100">
              NIM: {user?.nim} • Kelola surat tugas Anda dengan mudah
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <FileText className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-3" />
            <div>
              <p className="text-red-800 font-medium">Gagal memuat data</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="ml-auto bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Surat</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Diproses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.diproses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Disetujui</p>
              <p className="text-2xl font-bold text-gray-900">{stats.disetujui}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ditolak</p>
              <p className="text-2xl font-bold text-gray-900">{stats.ditolak}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Surat */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Surat Terbaru</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={handleViewAllSurat}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Lihat Semua
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {recentSurat.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Belum ada surat</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Buat surat tugas pertama Anda
                  </p>
                  <button
                    onClick={handleCreateSurat}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Buat Surat Baru
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSurat.map((surat) => {
                    const latestHistory = surat.histories?.[0];
                    const status = latestHistory?.status || 'diproses';
                    
                    return (
                      <div
                        key={surat.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleViewDetail(surat.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">
                              {surat.subject_surat}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(surat.tanggal_pengiriman)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {getRelativeTime(surat.tanggal_pengiriman)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <StatusBadge status={status} />
                            <Eye className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleCreateSurat}
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Buat Surat Baru</span>
              </button>
              
              <button
                onClick={handleViewAllSurat}
                className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <FileText className="w-5 h-5" />
                <span>Lihat Semua Surat</span>
              </button>
              
              <Link
                to="/profile"
                className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <TrendingUp className="w-5 h-5" />
                <span>Kelola Profile</span>
              </Link>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h3>
            
            {stats.total > 0 ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Approval Rate</span>
                    <span className="font-medium">
                      {Math.round((stats.disetujui / stats.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(stats.disetujui / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Disetujui</span>
                    <span>{stats.disetujui} surat</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-600">Diproses</span>
                    <span>{stats.diproses} surat</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600">Ditolak</span>
                    <span>{stats.ditolak} surat</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p className="text-sm">Belum ada data untuk ditampilkan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;