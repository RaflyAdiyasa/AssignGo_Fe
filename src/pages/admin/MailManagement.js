// src/pages/admin/MailManagement.js - Fixed to use backend latestStatus
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  RefreshCw,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
  Archive,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { suratApi } from '../../services/api/suratApi';
import { userApi } from '../../services/api/userApi';
import LoadingSpinner, { SkeletonTable } from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/surat/StatusBadge';
import { formatDate, formatDateTime, getRelativeTime } from '../../utils/dateUtils';
import { handleApiError } from '../../services/utils/errorHandler';
import { SURAT_STATUS } from '../../utils/constants';

const MailManagement = () => {
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mails, setMails] = useState([]);
  const [filteredMails, setFilteredMails] = useState([]);
  const [error, setError] = useState(null);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    diproses: 0,
    disetujui: 0,
    ditolak: 0
  });

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMail, setSelectedMail] = useState(null);

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

  // Fetch mails data
  const fetchMails = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('📧 Fetching all surat and users for mail management...');

      // Fetch both surat and users data in parallel
      const [suratResponse, usersResponse] = await Promise.all([
        suratApi.getAllSurat(),
        userApi.getAllUsers()
      ]);

      console.log('📧 Raw responses:', { suratResponse, usersResponse });

      // Safely extract arrays from responses
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

      setMails(mailsWithUserData);
      setFilteredMails(mailsWithUserData);
      
      // Calculate stats - use latestStatus from backend
      const newStats = {
        total: mailsWithUserData.length,
        diproses: 0,
        disetujui: 0,
        ditolak: 0
      };

      mailsWithUserData.forEach(mail => {
        try {
          // Backend already provides latestStatus
          const latestStatus = mail.latestStatus || 'diproses'; // default status
          
          if (newStats.hasOwnProperty(latestStatus)) {
            newStats[latestStatus]++;
          } else {
            newStats.diproses++; // fallback for unknown status
          }
        } catch (error) {
          console.warn('Error processing mail stats:', mail.id, error);
          newStats.diproses++; // fallback
        }
      });

      setStats(newStats);
      console.log('📊 Stats calculated:', newStats);

    } catch (error) {
      console.error('❌ Fetch mails error:', error);
      const errorResult = handleApiError(error);
      setError(errorResult.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMails();
  }, []);

  // Filter and search effect
  useEffect(() => {
    let filtered = [...mails];

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

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(mail => {
        try {
          // Use latestStatus from backend
          const latestStatus = mail.latestStatus || 'diproses';
          return latestStatus === selectedStatus;
        } catch (error) {
          console.warn('Error in status filter:', error);
          return selectedStatus === 'diproses'; // fallback
        }
      });
    }

    // Date range filter
    if (selectedDateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (selectedDateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          filterDate = null;
      }
      
      if (filterDate) {
        filtered = filtered.filter(mail => {
          try {
            const mailDate = new Date(mail.tanggal_pengiriman || '1970-01-01');
            return mailDate >= filterDate;
          } catch (error) {
            console.warn('Error in date filter:', error);
            return true;
          }
        });
      }
    }

    // Sort
    filtered.sort((a, b) => {
      try {
        switch (sortBy) {
          case 'newest':
            const dateA = new Date(a.tanggal_pengiriman || '1970-01-01');
            const dateB = new Date(b.tanggal_pengiriman || '1970-01-01');
            return dateB - dateA;
          case 'oldest':
            const dateA2 = new Date(a.tanggal_pengiriman || '1970-01-01');
            const dateB2 = new Date(b.tanggal_pengiriman || '1970-01-01');
            return dateA2 - dateB2;
          case 'subject':
            const subjectA = a.subject_surat || '';
            const subjectB = b.subject_surat || '';
            return subjectA.localeCompare(subjectB);
          case 'user':
            const userA = a.user?.username || '';
            const userB = b.user?.username || '';
            return userA.localeCompare(userB);
          case 'status':
            const statusA = a.latestStatus || 'diproses';
            const statusB = b.latestStatus || 'diproses';
            return statusA.localeCompare(statusB);
          default:
            return 0;
        }
      } catch (error) {
        console.warn('Error in sort:', error);
        return 0;
      }
    });

    setFilteredMails(filtered);
  }, [mails, searchTerm, selectedStatus, selectedDateRange, sortBy]);

  // Handle refresh
  const handleRefresh = () => {
    fetchMails(true);
  };

  // Handle view detail
  const handleViewDetail = (mail) => {
    setSelectedMail(mail);
    setShowDetailModal(true);
  };

  // Handle navigate to approval
  const handleNavigateToApproval = (mailId) => {
    navigate(`/admin/approval?mail=${mailId}`);
  };

  // Get status color for table row
  const getStatusRowColor = (status) => {
    switch (status) {
      case SURAT_STATUS.DIPROSES:
        return 'border-l-4 border-yellow-400';
      case SURAT_STATUS.DISETUJUI:
        return 'border-l-4 border-green-400';
      case SURAT_STATUS.DITOLAK:
        return 'border-l-4 border-red-400';
      default:
        return 'border-l-4 border-gray-400';
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <SkeletonTable rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola Surat</h1>
            <p className="text-gray-600">
              Kelola semua surat tugas yang diajukan pengguna
            </p>
          </div>
          <div className="flex items-center space-x-3">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-3" />
            <div>
              <p className="text-red-800 font-medium">Gagal memuat data surat</p>
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

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Status</option>
            <option value="diproses">Diproses</option>
            <option value="disetujui">Disetujui</option>
            <option value="ditolak">Ditolak</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Tanggal</option>
            <option value="today">Hari Ini</option>
            <option value="week">7 Hari Terakhir</option>
            <option value="month">1 Bulan Terakhir</option>
            <option value="year">1 Tahun Terakhir</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="subject">Subjek A-Z</option>
            <option value="user">User A-Z</option>
            <option value="status">Status</option>
          </select>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <p>
            Menampilkan {filteredMails.length} dari {mails.length} surat
          </p>
          <div className="flex items-center space-x-4">
            <span>Perlu Review: {stats.diproses}</span>
            <span>Rate Approval: {stats.total > 0 ? Math.round((stats.disetujui / stats.total) * 100) : 0}%</span>
          </div>
        </div>
      </div>

      {/* Mails Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subjek Surat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pengirim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMails.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">
                      {searchTerm ? 'Tidak ada surat yang sesuai dengan pencarian' : 'Belum ada surat'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMails.map((mail) => {
                  try {
                    // Use latestStatus from backend
                    const status = mail.latestStatus || 'diproses';
                    
                    return (
                      <tr key={mail.id} className={`hover:bg-gray-50 ${getStatusRowColor(status)}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {mail.subject_surat || 'Tanpa Subjek'}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {mail.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {mail.user?.username || 'Unknown User'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {mail.user?.nim || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(mail.tanggal_pengiriman)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getRelativeTime(mail.tanggal_pengiriman)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={status} />
                          {status === SURAT_STATUS.DIPROSES && (
                            <div className="mt-1">
                              <button
                                onClick={() => handleNavigateToApproval(mail.id)}
                                className="text-xs text-yellow-600 hover:text-yellow-700 flex items-center"
                              >
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Perlu Review
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {mail.url_file_surat ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                                <FileText className="w-3 h-3 text-green-600" />
                              </div>
                              <span className="text-xs text-green-600">Ada File</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                                <XCircle className="w-3 h-3 text-gray-400" />
                              </div>
                              <span className="text-xs text-gray-400">Tidak Ada</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewDetail(mail)}
                              className="text-blue-600 hover:text-blue-700 p-1 rounded"
                              title="Lihat detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {mail.url_file_surat && (
                              <button
                                onClick={() => window.open(mail.url_file_surat, '_blank')}
                                className="text-green-600 hover:text-green-700 p-1 rounded"
                                title="Download file"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                            {status === SURAT_STATUS.DIPROSES && (
                              <button
                                onClick={() => handleNavigateToApproval(mail.id)}
                                className="text-yellow-600 hover:text-yellow-700 p-1 rounded"
                                title="Review surat"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  } catch (error) {
                    console.warn('Error rendering mail row:', error);
                    return (
                      <tr key={mail.id || Math.random()}>
                        <td colSpan="6" className="px-6 py-4 text-center text-red-500 text-sm">
                          Error loading mail data
                        </td>
                      </tr>
                    );
                  }
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                    {selectedMail.subject_surat || 'Tanpa Subjek'}
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
                    Status Saat Ini
                  </label>
                  <div className="bg-gray-50 p-2 rounded">
                    <StatusBadge status={selectedMail.latestStatus || 'diproses'} />
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
                            Klik download untuk melihat file
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(selectedMail.url_file_surat, '_blank')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
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

export default MailManagement;