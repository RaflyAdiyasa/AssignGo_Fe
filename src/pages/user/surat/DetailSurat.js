// src/pages/user/surat/DetailSurat.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  User, 
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { suratApi } from '../../../services/api/suratApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import StatusBadge from '../../../components/surat/StatusBadge';
import StatusTimeline from '../../../components/surat/StatusTimeline';
import { formatDate, formatDateTime } from '../../../utils/dateUtils';
import { handleApiError } from '../../../services/utils/errorHandler';

const DetailSurat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [surat, setSurat] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  // Fetch surat detail and history
  const fetchSuratDetail = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch surat detail
      const detailResult = await suratApi.getSuratDetail(id);
      
      if (detailResult.success) {
        setSurat(detailResult.data);
        
        // History already included in detail response, but fetch separately for completeness
        const historyResult = await suratApi.getSuratHistory(id);
        if (historyResult.success) {
          setHistory(historyResult.data || []);
        }
      } else {
        throw new Error(detailResult.message || 'Surat tidak ditemukan');
      }
    } catch (error) {
      console.error('Fetch surat detail error:', error);
      const errorResult = handleApiError(error);
      setError(errorResult.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (id) {
      fetchSuratDetail();
    }
  }, [id]);

  // Handlers
  const handleBack = () => {
    navigate('/surat');
  };

  const handleRefresh = () => {
    fetchSuratDetail(true);
  };

  const handleOpenFile = () => {
    if (surat?.url_file_surat) {
      window.open(surat.url_file_surat, '_blank');
    }
  };

  const handleDownloadFile = () => {
    if (surat?.url_file_surat) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = surat.url_file_surat;
      link.download = `surat-${surat.subject_surat}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Get latest status
  const getLatestStatus = () => {
    if (history.length > 0) {
      return history[0].status;
    }
    return 'diproses';
  };

  const getLatestHistory = () => {
    return history.length > 0 ? history[0] : null;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <LoadingSpinner size="large" message="Memuat detail surat..." fullScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Gagal Memuat Detail Surat</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-3">
            <button
              onClick={() => fetchSuratDetail()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
            <button
              onClick={handleBack}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!surat) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Surat Tidak Ditemukan</h2>
          <p className="text-yellow-600 mb-4">Surat dengan ID {id} tidak ditemukan atau Anda tidak memiliki akses.</p>
          <button
            onClick={handleBack}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Kembali ke Daftar Surat
          </button>
        </div>
      </div>
    );
  }

  const latestStatus = getLatestStatus();
  const latestHistory = getLatestHistory();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Surat Tugas</h1>
            <p className="text-gray-600">ID: {surat.id}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <StatusBadge status={latestStatus} size="md" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Surat Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Surat</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Surat</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{surat.subject_surat}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pengajuan</label>
                  <div className="flex items-center text-gray-900 bg-gray-50 p-3 rounded-lg">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(surat.tanggal_pengiriman)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pengaju</label>
                  <div className="flex items-center text-gray-900 bg-gray-50 p-3 rounded-lg">
                    <User className="w-4 h-4 mr-2" />
                    {user?.username} ({user?.nim})
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File Surat</label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-900">
                      <FileText className="w-4 h-4 mr-2" />
                      <span className="truncate">{surat.url_file_surat}</span>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <button
                        onClick={handleOpenFile}
                        className="bg-blue-100 text-blue-700 p-2 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Buka File"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleDownloadFile}
                        className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Download File"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Terkini</h2>
            
            {latestHistory ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={latestHistory.status} size="lg" />
                  <span className="text-sm text-gray-500">
                    {formatDateTime(latestHistory.tanggal_update)}
                  </span>
                </div>
                
                {latestHistory.alasan && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-800 mb-1">Alasan Penolakan</h4>
                        <p className="text-red-700">{latestHistory.alasan}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {latestHistory.status === 'diproses' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800 mb-1">Sedang Diproses</h4>
                        <p className="text-yellow-700">Surat Anda sedang dalam proses review oleh admin. Mohon tunggu 1-3 hari kerja.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {latestHistory.status === 'disetujui' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800 mb-1">Surat Disetujui</h4>
                        <p className="text-green-700">Selamat! Surat tugas Anda telah disetujui dan dapat digunakan.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <p>Belum ada update status</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Timeline */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleOpenFile}
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka File Surat</span>
              </button>
              
              <button
                onClick={handleDownloadFile}
                className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </button>
              
              <button
                onClick={handleBack}
                className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke List</span>
              </button>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Status</h3>
            <StatusTimeline history={history} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailSurat;