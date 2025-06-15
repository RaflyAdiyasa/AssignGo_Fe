// src/pages/admin/MailApproval.js - Updated dengan alasan persetujuan
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  FileText, 
  User,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Download,
  MessageSquare,
  Send,
  Filter,
  Search
} from 'lucide-react';
import { suratApi } from '../../services/api/suratApi';
import { userApi } from '../../services/api/userApi';
import LoadingSpinner, { SkeletonTable } from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/surat/StatusBadge';
import { formatDate, formatDateTime, getRelativeTime } from '../../utils/dateUtils';
import { handleApiError } from '../../services/utils/errorHandler';
import { SURAT_STATUS } from '../../utils/constants';

const MailApproval = () => {
  const [searchParams] = useSearchParams();
  const highlightMailId = searchParams.get('mail');
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [pendingMails, setPendingMails] = useState([]);
  const [filteredMails, setFilteredMails] = useState([]);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('oldest');
  
  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMail, setSelectedMail] = useState(null);
  const [approvalAction, setApprovalAction] = useState(''); // 'approve' or 'reject'
  const [approvalReason, setApprovalReason] = useState(''); // Changed: unified reason field
  
  // Success message
  const [successMessage, setSuccessMessage] = useState('');

  // Helper function to safely extract array from API response
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

  // Fetch pending mails with user data
  const fetchPendingMails = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('📧 Fetching all surat and users for approval...');

      // Fetch both surat and users data in parallel
      const [suratResponse, usersResponse] = await Promise.all([
        suratApi.getAllSurat(),
        userApi.getAllUsers()
      ]);
      
      console.log('📧 Raw responses:', { suratResponse, usersResponse });

      if (suratResponse.success && usersResponse.success) {
        // Extract arrays using helper function
        const allMails = extractArrayFromResponse(suratResponse, []);
        const allUsers = extractArrayFromResponse(usersResponse, []);
        
        console.log('📧 Extracted data:', { 
          mailsCount: allMails.length, 
          usersCount: allUsers.length 
        });

        // Create user map for quick lookup
        const userMap = {};
        allUsers.forEach(userData => {
          if (userData && userData.id) {
            userMap[userData.id] = userData;
          }
        });

        console.log('👥 User map created with', Object.keys(userMap).length, 'users');

        // Map surat data with user information
        const mailsWithUserData = allMails.map(mail => {
          if (!mail || !mail.id) {
            console.warn('Invalid mail data:', mail);
            return null;
          }

          const userData = userMap[mail.id_pengirim];
          return {
            ...mail,
            user: userData ? {
              id: userData.id,
              username: userData.username || 'Unknown User',
              nim: userData.nim || 'N/A'
            } : {
              id: mail.id_pengirim || 'unknown',
              username: 'Unknown User',
              nim: 'N/A'
            }
          };
        }).filter(mail => mail !== null); // Remove any null entries

        console.log('📋 Processed mails with user data:', mailsWithUserData.length);

        // Filter only pending mails - use latestStatus from backend
        const pending = mailsWithUserData.filter(mail => {
          try {
            // Backend already provides latestStatus in the response
            const latestStatus = mail.latestStatus || 'diproses'; // default status
            return latestStatus === SURAT_STATUS.DIPROSES;
          } catch (error) {
            console.warn('Error filtering mail:', mail.id, error);
            return true; // Include if unsure
          }
        });
        
        console.log('✅ Pending mails filtered:', pending.length);
        
        setPendingMails(pending);
        setFilteredMails(pending);
      } else {
        const errorMsg = suratResponse.message || usersResponse.message || 'Failed to fetch data';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Fetch pending mails error:', error);
      const errorResult = handleApiError(error);
      setError(errorResult.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPendingMails();
  }, []);

  // Filter and search effect
  useEffect(() => {
    let filtered = [...pendingMails];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(mail => {
        try {
          const subject = (mail.subject_surat || '').toLowerCase();
          const username = (mail.user?.username || '').toLowerCase();
          const nim = (mail.user?.nim || '').toLowerCase();
          const searchLower = searchTerm.toLowerCase();
          
          return subject.includes(searchLower) ||
                 username.includes(searchLower) ||
                 nim.includes(searchLower);
        } catch (error) {
          console.warn('Error in search filter:', error);
          return false;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      try {
        switch (sortBy) {
          case 'oldest':
            const dateA = new Date(a.tanggal_pengiriman || '1970-01-01');
            const dateB = new Date(b.tanggal_pengiriman || '1970-01-01');
            return dateA - dateB;
          case 'newest':
            const dateA2 = new Date(a.tanggal_pengiriman || '1970-01-01');
            const dateB2 = new Date(b.tanggal_pengiriman || '1970-01-01');
            return dateB2 - dateA2;
          case 'subject':
            const subjectA = a.subject_surat || '';
            const subjectB = b.subject_surat || '';
            return subjectA.localeCompare(subjectB);
          case 'user':
            const userA = a.user?.username || '';
            const userB = b.user?.username || '';
            return userA.localeCompare(userB);
          default:
            return 0;
        }
      } catch (error) {
        console.warn('Error in sort:', error);
        return 0;
      }
    });

    setFilteredMails(filtered);
  }, [pendingMails, searchTerm, sortBy]);

  // Handle approval/rejection
  const handleApprovalAction = async () => {
    if (!selectedMail || !approvalAction) return;
    
    // Validation: approval requires reason, rejection requires reason
    if (approvalAction === 'approve' && !approvalReason.trim()) {
      setError('Alasan persetujuan wajib diisi');
      return;
    }
    
    if (approvalAction === 'reject' && !approvalReason.trim()) {
      setError('Alasan penolakan wajib diisi');
      return;
    }
    
    try {
      setProcessing(true);
      setError(null);
      
      const status = approvalAction === 'approve' ? SURAT_STATUS.DISETUJUI : SURAT_STATUS.DITOLAK;
      const reason = approvalReason.trim();
      
      console.log('🔄 Updating mail status:', { 
        mailId: selectedMail.id, 
        status, 
        reason 
      });
      
      const response = await suratApi.updateSuratStatus(selectedMail.id, status, reason);
      
      if (response.success) {
        setShowApprovalModal(false);
        setSelectedMail(null);
        setApprovalAction('');
        setApprovalReason('');
        
        // Show success message
        setSuccessMessage(
          `Surat "${selectedMail.subject_surat}" berhasil ${approvalAction === 'approve' ? 'disetujui' : 'ditolak'}`
        );
        
        // Force refresh data to get updated status
        console.log('✅ Status updated, refreshing data...');
        await fetchPendingMails(true);
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('❌ Approval action error:', error);
      const errorResult = handleApiError(error);
      setError(errorResult.message);
      
      // Clear error after 10 seconds
      setTimeout(() => setError(null), 10000);
    } finally {
      setProcessing(false);
    }
  };

  // Handle open approval modal
  const handleOpenApprovalModal = (mail, action) => {
    setSelectedMail(mail);
    setApprovalAction(action);
    setApprovalReason('');
    setError(null);
    setShowApprovalModal(true);
  };

  // Handle view detail
  const handleViewDetail = (mail) => {
    setSelectedMail(mail);
    setShowDetailModal(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchPendingMails(true);
    setSuccessMessage('');
    setError(null);
  };

  if (loading && !refreshing) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <SkeletonTable rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Persetujuan Surat</h1>
            <p className="text-gray-600">
              Review dan setujui surat tugas yang menunggu persetujuan
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  {pendingMails.length} Menunggu Review
                </span>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <p className="text-green-800 font-medium">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage('')}
              className="ml-auto text-green-600 hover:text-green-700"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-3" />
            <div>
              <p className="text-red-800 font-medium">Gagal memproses permintaan</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari subjek, user, atau NIM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="oldest">Terlama (Prioritas)</option>
            <option value="newest">Terbaru</option>
            <option value="subject">Subjek A-Z</option>
            <option value="user">User A-Z</option>
          </select>

          {/* Stats */}
          <div className="flex items-center justify-end text-sm text-gray-600">
            <span>
              Menampilkan {filteredMails.length} dari {pendingMails.length} surat
            </span>
          </div>
        </div>
      </div>

      {/* Pending Mails */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredMails.length === 0 ? (
          <div className="p-12 text-center">
            {pendingMails.length === 0 ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Semua Surat Sudah Diproses! 🎉
                </h3>
                <p className="text-gray-500">
                  Tidak ada surat yang menunggu persetujuan saat ini
                </p>
              </>
            ) : (
              <>
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tidak Ada Hasil
                </h3>
                <p className="text-gray-500">
                  Tidak ada surat yang sesuai dengan pencarian Anda
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredMails.map((mail) => (
              <div 
                key={mail.id}
                className={`p-6 ${
                  highlightMailId === mail.id.toString() ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'hover:bg-gray-50'
                } transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Mail Header */}
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {mail.subject_surat || 'Tanpa Subjek'}
                          </h3>
                          <StatusBadge status={SURAT_STATUS.DIPROSES} size="sm" />
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{mail.user?.username || 'Unknown User'} ({mail.user?.nim || 'N/A'})</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(mail.tanggal_pengiriman)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{getRelativeTime(mail.tanggal_pengiriman)}</span>
                          </div>
                        </div>
                        
                        {/* File Attachment */}
                        {mail.url_file_surat && (
                          <div className="flex items-center space-x-2 mb-4">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-600">File lampiran tersedia</span>
                            <a
                              href={mail.url_file_surat}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm underline"
                            >
                              Lihat File
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewDetail(mail)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Detail</span>
                    </button>
                    
                    <button
                      onClick={() => handleOpenApprovalModal(mail, 'reject')}
                      disabled={processing}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-2 rounded-lg transition-colors flex items-center space-x-1 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Tolak</span>
                    </button>
                    
                    <button
                      onClick={() => handleOpenApprovalModal(mail, 'approve')}
                      disabled={processing}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Setujui</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval Modal - Updated dengan unified reason field */}
      {showApprovalModal && selectedMail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {approvalAction === 'approve' ? 'Setujui Surat' : 'Tolak Surat'}
            </h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Surat:</p>
              <p className="font-medium text-gray-900">{selectedMail.subject_surat}</p>
              <p className="text-sm text-gray-500">
                oleh {selectedMail.user?.username || 'Unknown User'} ({selectedMail.user?.nim || 'N/A'})
              </p>
            </div>
            
            {/* Unified reason field for both approve and reject */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {approvalAction === 'approve' ? 'Alasan Persetujuan *' : 'Alasan Penolakan *'}
              </label>
              <textarea
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
                placeholder={approvalAction === 'approve' 
                  ? "Jelaskan alasan persetujuan (misal: Dokumen lengkap dan sesuai prosedur)"
                  : "Jelaskan alasan penolakan surat ini..."
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {approvalAction === 'approve' 
                  ? 'Alasan persetujuan akan dikirimkan kepada pengguna'
                  : 'Alasan penolakan akan dikirimkan kepada pengguna'
                }
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setError(null);
                }}
                disabled={processing}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleApprovalAction}
                disabled={processing || !approvalReason.trim()}
                className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-1 ${
                  approvalAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {approvalAction === 'approve' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span>{approvalAction === 'approve' ? 'Setujui' : 'Tolak'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedMail && (
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
                    {selectedMail.subject_surat}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pengirim
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedMail.user?.username || 'Unknown User'} ({selectedMail.user?.nim || 'N/A'})
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Pengiriman
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {formatDateTime(selectedMail.tanggal_pengiriman)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="bg-gray-50 p-2 rounded">
                    <StatusBadge status={SURAT_STATUS.DIPROSES} />
                  </div>
                </div>
              </div>

              {/* File */}
              {selectedMail.url_file_surat && (
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
                            Klik untuk melihat file
                          </p>
                        </div>
                      </div>
                      <a
                        href={selectedMail.url_file_surat}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                      >
                        <Download className="w-4 h-4" />
                        <span>Lihat File</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenApprovalModal(selectedMail, 'reject');
                  }}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2 rounded-lg transition-colors flex items-center space-x-1"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Tolak</span>
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenApprovalModal(selectedMail, 'approve');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Setujui</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MailApproval;