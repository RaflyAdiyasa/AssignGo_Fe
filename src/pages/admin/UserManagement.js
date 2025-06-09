// src/pages/admin/UserManagement.js - Fixed version with robust data handling
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw,
  UserPlus,
  Shield,
  User,
  Calendar,
  Mail,
  Phone,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Settings
} from 'lucide-react';
import { userApi } from '../../services/api/userApi';
import { suratApi } from '../../services/api/suratApi';
import LoadingSpinner, { SkeletonTable } from '../../components/common/LoadingSpinner';
import { formatDate, getRelativeTime } from '../../utils/dateUtils';
import { handleApiError } from '../../services/utils/errorHandler';

const UserManagement = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userSuratCounts, setUserSuratCounts] = useState({});
  const [error, setError] = useState(null);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserSurat, setSelectedUserSurat] = useState([]);
  
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

  // Fetch users data with surat counts
  const fetchUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('👥 Fetching users and surat data...');

      // Fetch both users and surat data in parallel
      const [usersResponse, suratResponse] = await Promise.all([
        userApi.getAllUsers(),
        suratApi.getAllSurat()
      ]);

      console.log('👥 API Responses:', { usersResponse, suratResponse });

      // Safely extract arrays from responses
      const usersList = extractArrayFromResponse(usersResponse, []);
      const allSurat = extractArrayFromResponse(suratResponse, []);

      console.log('👥 Extracted data:', { 
        usersCount: usersList.length, 
        suratCount: allSurat.length 
      });
      
      // Filter out invalid users
      const validUsers = usersList.filter(user => user && user.id);
      
      setUsers(validUsers);
      setFilteredUsers(validUsers);

      // Calculate surat counts per user
      if (allSurat.length > 0) {
        const suratCounts = {};
        
        // Count surat per user
        allSurat.forEach(surat => {
          try {
            const userId = surat.id_pengirim;
            if (!userId) return;

            if (!suratCounts[userId]) {
              suratCounts[userId] = {
                total: 0,
                diproses: 0,
                disetujui: 0,
                ditolak: 0
              };
            }
            
            suratCounts[userId].total++;
            
            // Get latest status
            let latestStatus = 'diproses';
            if (surat.histories && Array.isArray(surat.histories) && surat.histories.length > 0) {
              const sortedHistories = surat.histories.sort((a, b) => {
                const dateA = new Date(a.tanggal_update || a.updatedAt || a.created_at || '1970-01-01');
                const dateB = new Date(b.tanggal_update || b.updatedAt || b.created_at || '1970-01-01');
                return dateB - dateA;
              });
              latestStatus = sortedHistories[0].status || 'diproses';
            }
            
            if (suratCounts[userId][latestStatus] !== undefined) {
              suratCounts[userId][latestStatus]++;
            }
          } catch (error) {
            console.warn('Error processing surat for user counts:', error);
          }
        });
        
        setUserSuratCounts(suratCounts);
        console.log('📊 Surat counts calculated for', Object.keys(suratCounts).length, 'users');
      }

    } catch (error) {
      console.error('❌ Fetch users error:', error);
      const errorResult = handleApiError(error);
      setError(errorResult.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter and search effect
  useEffect(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => {
        try {
          const username = (user.username || '').toLowerCase();
          const nim = (user.nim || '').toLowerCase();
          const searchLower = searchTerm.toLowerCase();
          
          return username.includes(searchLower) || nim.includes(searchLower);
        } catch (error) {
          console.warn('Error in search filter:', error);
          return false;
        }
      });
    }

    // Role filter
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => {
        try {
          const isAdmin = user.role === 'admin' || user.isAdmin;
          return selectedRole === 'admin' ? isAdmin : !isAdmin;
        } catch (error) {
          console.warn('Error in role filter:', error);
          return true;
        }
      });
    }

    // Status filter (you can add active/inactive status to users)
    if (selectedStatus !== 'all') {
      // Add status filtering logic when backend supports it
      // For now, assume all users are active
    }

    // Sort
    filtered.sort((a, b) => {
      try {
        switch (sortBy) {
          case 'newest':
            const dateA = new Date(a.created_at || a.tanggal_daftar || a.createdAt || '1970-01-01');
            const dateB = new Date(b.created_at || b.tanggal_daftar || b.createdAt || '1970-01-01');
            return dateB - dateA;
          case 'oldest':
            const dateA2 = new Date(a.created_at || a.tanggal_daftar || a.createdAt || '1970-01-01');
            const dateB2 = new Date(b.created_at || b.tanggal_daftar || b.createdAt || '1970-01-01');
            return dateA2 - dateB2;
          case 'name':
            const nameA = a.username || '';
            const nameB = b.username || '';
            return nameA.localeCompare(nameB);
          case 'nim':
            const nimA = a.nim || '';
            const nimB = b.nim || '';
            return nimA.localeCompare(nimB);
          case 'surat_count':
            const countA = userSuratCounts[a.id]?.total || 0;
            const countB = userSuratCounts[b.id]?.total || 0;
            return countB - countA;
          default:
            return 0;
        }
      } catch (error) {
        console.warn('Error in sort:', error);
        return 0;
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole, selectedStatus, sortBy, userSuratCounts]);

  // Handle view user detail
  const handleViewDetail = async (user) => {
    setSelectedUser(user);
    
    // Fetch user's surat
    try {
      const suratResponse = await suratApi.getAllSurat();
      if (suratResponse.success) {
        const allSurat = extractArrayFromResponse(suratResponse, []);
        const userSurat = allSurat.filter(surat => 
          surat.id_pengirim === user.id
        );
        setSelectedUserSurat(userSurat);
      }
    } catch (error) {
      console.error('Failed to fetch user surat:', error);
      setSelectedUserSurat([]);
    }
    
    setShowDetailModal(true);
  };

  // Handle delete user (if needed - might want to disable instead)
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      
      const response = await userApi.deleteUser(selectedUser.id);
      
      if (response.success) {
        setShowDeleteModal(false);
        setSelectedUser(null);
        setSuccessMessage(`User ${selectedUser.username} berhasil dihapus`);
        fetchUsers(true);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Delete user error:', error);
      const errorResult = handleApiError(error);
      setError(errorResult.message);
      setTimeout(() => setError(null), 10000);
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchUsers(true);
    setSuccessMessage('');
    setError(null);
  };

  // Get user stats
  const getUserStats = () => {
    const totalUsers = users.length;
    const adminUsers = users.filter(user => {
      try {
        return user.role === 'admin' || user.isAdmin;
      } catch (error) {
        return false;
      }
    }).length;
    const regularUsers = totalUsers - adminUsers;
    const usersWithSurat = Object.keys(userSuratCounts).length;
    
    return {
      total: totalUsers,
      admin: adminUsers,
      regular: regularUsers,
      withSurat: usersWithSurat
    };
  };

  const stats = getUserStats();

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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola User</h1>
            <p className="text-gray-600">
              Kelola akun pengguna yang sudah terdaftar di sistem
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/admin/nim-management"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Kelola NIM</span>
            </Link>
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
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total User</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admin</p>
              <p className="text-2xl font-bold text-gray-900">{stats.admin}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">User Biasa</p>
              <p className="text-2xl font-bold text-gray-900">{stats.regular}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Punya Surat</p>
              <p className="text-2xl font-bold text-gray-900">{stats.withSurat}</p>
            </div>
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
              <p className="text-red-800 font-medium">Gagal memuat data user</p>
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

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Informasi User Management</h3>
            <p className="text-sm text-blue-800">
              User baru dapat mendaftar sendiri jika NIM mereka sudah terdaftar dalam whitelist. 
              Kelola whitelist NIM melalui halaman <strong>Kelola NIM</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari username atau NIM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Non-aktif</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="name">Nama A-Z</option>
            <option value="nim">NIM</option>
            <option value="surat_count">Jumlah Surat</option>
          </select>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <p>
            Menampilkan {filteredUsers.length} dari {users.length} user
          </p>
          <div className="flex items-center space-x-4">
            <span>Admin: {stats.admin}</span>
            <span>User: {stats.regular}</span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NIM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Daftar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Surat
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">
                      {searchTerm ? 'Tidak ada user yang sesuai dengan pencarian' : 'Belum ada user'}
                    </p>
                    <Link
                      to="/admin/nim-management"
                      className="mt-3 inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      Kelola NIM untuk Registrasi
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  try {
                    const isAdmin = user.role === 'admin' || user.isAdmin;
                    const suratCount = userSuratCounts[user.id] || { total: 0, diproses: 0, disetujui: 0, ditolak: 0 };
                    
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isAdmin ? 'bg-purple-100' : 'bg-blue-100'
                            }`}>
                              {isAdmin ? (
                                <Shield className="w-5 h-5 text-purple-600" />
                              ) : (
                                <User className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.username || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {user.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.nim || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            isAdmin 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(user.created_at || user.tanggal_daftar || user.createdAt || '1970-01-01')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getRelativeTime(user.created_at || user.tanggal_daftar || user.createdAt || '1970-01-01')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {suratCount.total} surat
                          </div>
                          {suratCount.total > 0 && (
                            <div className="text-xs text-gray-500">
                              {suratCount.disetujui} disetujui, {suratCount.diproses} pending
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewDetail(user)}
                              className="text-blue-600 hover:text-blue-700 p-1 rounded"
                              title="Lihat detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {!isAdmin && (
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDeleteModal(true);
                                }}
                                className="text-red-600 hover:text-red-700 p-1 rounded"
                                title="Hapus user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  } catch (error) {
                    console.warn('Error rendering user row:', error);
                    return (
                      <tr key={user.id || Math.random()}>
                        <td colSpan="6" className="px-6 py-4 text-center text-red-500 text-sm">
                          Error loading user data
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

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Detail User</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedUser.username || 'Unknown'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIM
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedUser.nim || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      (selectedUser.role === 'admin' || selectedUser.isAdmin)
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {(selectedUser.role === 'admin' || selectedUser.isAdmin) ? 'Admin' : 'User'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Daftar
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {formatDate(selectedUser.created_at || selectedUser.tanggal_daftar || selectedUser.createdAt || '1970-01-01')}
                  </p>
                </div>
              </div>

              {/* Surat Statistics */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statistik Surat
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {['total', 'diproses', 'disetujui', 'ditolak'].map(status => {
                    const count = userSuratCounts[selectedUser.id]?.[status] || 0;
                    const colors = {
                      total: 'bg-blue-50 text-blue-700 border-blue-200',
                      diproses: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                      disetujui: 'bg-green-50 text-green-700 border-green-200',
                      ditolak: 'bg-red-50 text-red-700 border-red-200'
                    };
                    
                    return (
                      <div key={status} className={`border rounded-lg p-3 text-center ${colors[status]}`}>
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-xs capitalize">{status}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Surat */}
              {selectedUserSurat.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Surat Terbaru (5 terakhir)
                  </label>
                  <div className="space-y-2">
                    {selectedUserSurat.slice(0, 5).map(surat => {
                      try {
                        const latestStatus = surat.histories?.[0]?.status || 'diproses';
                        return (
                          <div key={surat.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{surat.subject_surat || 'Tanpa Subjek'}</p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(surat.tanggal_pengiriman || surat.createdAt)}
                                </p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                latestStatus === 'disetujui' ? 'bg-green-100 text-green-800' :
                                latestStatus === 'ditolak' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {latestStatus}
                              </span>
                            </div>
                          </div>
                        );
                      } catch (error) {
                        return (
                          <div key={surat.id || Math.random()} className="border border-red-200 rounded-lg p-3 bg-red-50">
                            <p className="text-red-600 text-sm">Error loading surat data</p>
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hapus User</h2>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus user <strong>{selectedUser.username}</strong>? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;