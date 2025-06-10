// src/pages/user/Dashboard.js - FIXED version
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
  const { user } = useAuth();
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

      console.log('📊 Fetching dashboard data...');

      // FIXED: Call API dan handle response wrapper
      const response = await suratApi.getUserSurat();
      
      // FIXED: Check response format dan extract data
      let suratList = [];
      if (response && response.success && response.data) {
        suratList = response.data;
      } else if (response && Array.isArray(response)) {
        // Fallback jika API mengembalikan array langsung
        suratList = response;
      } else {
        console.warn('Unexpected response format:', response);
        suratList = [];
      }

      console.log('📊 Dashboard surat data:', suratList);

      // FIXED: Validasi array
      if (!Array.isArray(suratList)) {
        console.error('Expected array but got:', typeof suratList, suratList);
        throw new Error('Format data surat tidak valid - bukan array');
      }

      // Calculate statistics
      const newStats = {
        total: suratList.length,
        diproses: 0,
        disetujui: 0,
        ditolak: 0
      };

      suratList.forEach(surat => {
        // FIXED: Use latestStatus from backend or fallback to status determination
        let status = 'diproses'; // default
        
        if (surat.latestStatus) {
          // Backend sudah provide latestStatus
          status = surat.latestStatus;
        } else if (surat.histories && Array.isArray(surat.histories) && surat.histories.length > 0) {
          // Ambil status terbaru dari histories
          status = surat.histories[0].status || 'diproses';
        }
        
        // Count status
        if (newStats.hasOwnProperty(status)) {
          newStats[status]++;
        } else {
          newStats.diproses++; // fallback ke diproses jika status tidak dikenal
        }
      });

      console.log('📊 Dashboard stats:', newStats);
      setStats(newStats);
      
      // Recent 5 surat - sort by date desc
      const sortedSurat = [...suratList].sort((a, b) => 
        new Date(b.tanggal_pengiriman) - new Date(a.tanggal_pengiriman)
      );
      setRecentSurat(sortedSurat.slice(0, 5));

    } catch (err) {
      console.error('❌ Dashboard fetch error:', err);
      const handled = handleApiError(err);
      setError(handled.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handlers
  const handleRefresh = () => fetchDashboardData(true);
  const handleCreateSurat = () => navigate('/surat/create');
  const handleViewAllSurat = () => navigate('/surat');
  const handleViewDetail = (id) => navigate(`/surat/${id}`);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><SkeletonCard /></div>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
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

      {/* Error */}
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
              className="ml-auto bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: FileText, label: 'Total Surat', value: stats.total, bg: 'bg-blue-100', iconColor: 'text-blue-600' },
          { icon: Clock,    label: 'Diproses',   value: stats.diproses, bg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
          { icon: CheckCircle, label: 'Disetujui', value: stats.disetujui, bg: 'bg-green-100', iconColor: 'text-green-600' },
          { icon: XCircle,  label: 'Ditolak',    value: stats.ditolak, bg: 'bg-red-100', iconColor: 'text-red-600' },
        ].map(({ icon: Icon, label, value, bg, iconColor }) => (
          <div key={label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center">
            <div className={`${bg} p-3 rounded-lg`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Surat */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Surat Terbaru</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
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
          <div className="p-6">
            {recentSurat.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Belum ada surat</p>
                <button
                  onClick={handleCreateSurat}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Buat Surat Baru
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentSurat.map(surat => {
                  // FIXED: Get status properly
                  let status = 'diproses';
                  if (surat.latestStatus) {
                    status = surat.latestStatus;
                  } else if (surat.histories && Array.isArray(surat.histories) && surat.histories.length > 0) {
                    status = surat.histories[0].status || 'diproses';
                  }

                  return (
                    <div
                      key={surat.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewDetail(surat.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{surat.subject_surat}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{formatDate(surat.tanggal_pengiriman)}</span>
                            <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{getRelativeTime(surat.tanggal_pengiriman)}</span>
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

      {/* Quick Actions & Progress */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={handleCreateSurat} className="w-full bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center space-x-2">
              <Plus className="w-5 h-5" /><span>Buat Surat Baru</span>
            </button>
            <button onClick={handleViewAllSurat} className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg flex items-center space-x-2">
              <FileText className="w-5 h-5" /><span>Lihat Semua Surat</span>
            </button>
            <Link to="/profile" className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" /><span>Kelola Profile</span>
            </Link>
          </div>
        </div>
        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h3>
          {stats.total > 0 ? (
            <>
              <div className="flex justify-between text-sm mb-1">
                <span>Approval Rate</span>
                <span>{Math.round((stats.disetujui / stats.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(stats.disetujui / stats.total) * 100}%` }} />
              </div>
              {['disetujui','diproses','ditolak'].map(key => (
                <div key={key} className="flex justify-between text-sm">
                  <span className={`text-${key==='disetujui'?'green':'diproses'?'yellow':'red'}-600`}>
                    {key.charAt(0).toUpperCase()+key.slice(1)}
                  </span>
                  <span>{stats[key]} surat</span>
                </div>
              ))}
            </>
          ) : (
            <p className="text-center text-gray-500">Belum ada data untuk ditampilkan</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;