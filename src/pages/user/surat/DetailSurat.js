// src/pages/user/surat/DetailSurat.js - FIXED version
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
  RefreshCw,
  Upload,
  X
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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // FIXED: Fetch surat detail and history dengan proper error handling
  const fetchSuratDetail = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('🔍 Fetching surat detail for ID:', id);

      // FIXED: Fetch surat detail dengan response wrapper handling
      const detailResponse = await suratApi.getSuratDetail(id);
      
      let suratData = null;
      if (detailResponse && detailResponse.success && detailResponse.data) {
        suratData = detailResponse.data;
      } else if (detailResponse && typeof detailResponse === 'object' && detailResponse.id) {
        // Fallback jika API mengembalikan data langsung
        suratData = detailResponse;
      } else {
        console.error('Unexpected detail response format:', detailResponse);
        throw new Error('Surat tidak ditemukan atau format response tidak valid');
      }

      console.log('🔍 Surat detail data:', suratData);
      setSurat(suratData);

      // FIXED: Fetch history dengan better error handling
      try {
        console.log('📚 Fetching surat history for ID:', id);
        const historyResponse = await suratApi.getSuratHistory(id);
        
        let historyData = [];
        if (historyResponse && historyResponse.success && historyResponse.data) {
          historyData = Array.isArray(historyResponse.data) ? historyResponse.data : [];
        } else if (historyResponse && Array.isArray(historyResponse)) {
          // Fallback jika API mengembalikan array langsung
          historyData = historyResponse;
        } else {
          console.warn('History response format tidak sesuai:', historyResponse);
          historyData = [];
        }

        console.log('📚 History data:', historyData);
        setHistory(historyData);
        
      } catch (historyError) {
        console.warn('⚠️ Error fetching history (non-critical):', historyError);
        // Set empty array jika gagal fetch history, tapi jangan error keseluruhan
        setHistory([]);
      }

    } catch (err) {
      console.error('❌ Fetch surat detail error:', err);
      const handled = handleApiError(err);
      setError(handled.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validasi file
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadError('Ukuran file tidak boleh lebih dari 10MB');
      return;
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Format file tidak didukung. Gunakan PDF, DOC, atau DOCX');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      // Note: suratApi.uploadSuratFile() mungkin belum diimplementasi
      // Untuk sementara, kita skip upload file functionality
      console.log('📤 File upload not implemented yet:', file.name);
      
      setUploadError('Fitur upload file belum tersedia. Silakan hubungi admin.');
      
      // Clear file input
      event.target.value = '';
    } catch (err) {
      console.error('❌ Upload error:', err);
      const handled = handleApiError(err);
      setUploadError(handled.message);
    } finally {
      setUploading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (id) fetchSuratDetail();
  }, [id]);

  // Handlers
  const handleBack = () => navigate('/surat');
  const handleRefresh = () => fetchSuratDetail(true);
  const handleOpenFile = () => {
    if (surat?.url_file_surat) window.open(surat.url_file_surat, '_blank');
  };
  const handleDownloadFile = () => {
    if (surat?.url_file_surat) {
      const link = document.createElement('a');
      link.href = surat.url_file_surat;
      link.download = `surat-${surat.subject_surat}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // FIXED: Get latest status dengan proper fallback
  const getLatestStatus = () => {
    if (surat && surat.latestStatus) {
      return surat.latestStatus;
    } else if (history.length > 0) {
      return history[0]?.status || 'diproses';
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
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >Coba Lagi</button>
            <button
              onClick={handleBack}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >Kembali</button>
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
          <p className="text-yellow-600 mb-4">Surat dengan ID {id} tidak ditemukan</p>
          <button
            onClick={handleBack}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
          >Kembali ke Daftar Surat</button>
        </div>
      </div>
    );
  }

  const latestHistory = getLatestHistory();
  const latestStatus = getLatestStatus();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-lg">
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
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <StatusBadge status={latestStatus} size="md" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informasi Surat */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Informasi Surat</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject Surat</label>
                <p className="bg-gray-50 p-3 rounded-lg">{surat.subject_surat}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Pengajuan</label>
                  <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <Calendar className="w-4 h-4 mr-2" />{formatDate(surat.tanggal_pengiriman)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pengaju</label>
                  <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <User className="w-4 h-4 mr-2" />{user.username} ({user.nim})
                  </div>
                </div>
              </div>
              
              {/* File Upload Section */}
              <div>
                <label className="block text-sm font-medium mb-1">File Surat</label>
                
                {/* Upload Error */}
                {uploadError && (
                  <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center text-red-700">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm">{uploadError}</span>
                    </div>
                    <button onClick={() => setUploadError(null)} className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <label 
                    htmlFor="file-upload" 
                    className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex flex-col items-center">
                      <Upload className={`w-8 h-8 text-gray-400 mb-2 ${uploading ? 'animate-pulse' : ''}`} />
                      <p className="text-sm text-gray-600 mb-1">
                        {uploading ? 'Mengunggah...' : 'Klik untuk upload file surat'}
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX (Max 10MB)</p>
                    </div>
                  </label>
                </div>

                {/* Current File Display */}
                {surat.url_file_surat && (
                  <div className="mt-3 bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="truncate text-sm">{surat.url_file_surat.split('/').pop()}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={handleOpenFile} 
                        title="Buka File" 
                        className="p-2 rounded-lg hover:bg-blue-100"
                      >
                        <ExternalLink className="w-4 h-4 text-blue-700" />
                      </button>
                      <button 
                        onClick={handleDownloadFile} 
                        title="Download" 
                        className="p-2 rounded-lg hover:bg-gray-200"
                      >
                        <Download className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Terkini */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Status Terkini</h2>
            {latestHistory ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={latestHistory.status} size="lg" />
                  <span className="text-sm text-gray-500">{formatDateTime(latestHistory.tanggal_update)}</span>
                </div>
                {latestHistory.alasan && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-800">Alasan Penolakan</h4>
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
                        <p>Surat Anda sedang dalam proses review.</p>
                      </div>
                    </div>
                  </div>
                )}
                {latestHistory.status === 'disetujui' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p>Surat tugas Anda telah disetujui!</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <p>Belum ada update status</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Timeline */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {surat.url_file_surat && (
                <>
                  <button 
                    onClick={handleOpenFile} 
                    className="w-full bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Buka File Surat</span>
                  </button>
                  <button 
                    onClick={handleDownloadFile} 
                    className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-200"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </button>
                </>
              )}
              <label 
                htmlFor="file-upload" 
                className={`w-full bg-green-600 text-white p-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-700 cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'Mengunggah...' : 'Upload File Baru'}</span>
              </label>
              <button 
                onClick={handleBack} 
                className="w-full bg-gray-100 text-gray-700 p-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Daftar Surat</span>
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Riwayat Status</h3>
            <StatusTimeline history={history} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailSurat;