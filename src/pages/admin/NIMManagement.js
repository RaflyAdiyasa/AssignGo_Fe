// src/pages/admin/NIMManagement.js - New page for managing NIM whitelist
import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Search, 
  Plus, 
  Trash2, 
  RefreshCw,
  Shield,
  ShieldOff,
  Upload,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Eye,
  Calendar,
  Filter
} from 'lucide-react';
import { nimApi } from '../../services/api/nimApi';
import LoadingSpinner, { SkeletonTable } from '../../components/common/LoadingSpinner';
import { formatDate, getRelativeTime } from '../../utils/dateUtils';
import { handleApiError } from '../../services/utils/errorHandler';

const NIMManagement = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [nims, setNims] = useState([]);
  const [filteredNims, setFilteredNims] = useState([]);
  const [error, setError] = useState(null);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [sortBy, setSortBy] = useState('newest');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNim, setSelectedNim] = useState(null);
  
  // Form data
  const [singleNim, setSingleNim] = useState('');
  const [bulkNims, setBulkNims] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch NIMs data
  const fetchNims = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await nimApi.getAllNims();
      
      if (response.success) {
        const nimsList = response.data || [];
        setNims(nimsList);
        setFilteredNims(nimsList);
      } else {
        throw new Error(response.message || 'Failed to fetch NIMs');
      }
    } catch (error) {
      console.error('Fetch NIMs error:', error);
      const errorResult = handleApiError(error);
      setError(errorResult.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNims();
  }, []);

  // Filter and search effect
  useEffect(() => {
    let filtered = [...nims];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(nim => 
        nim.nim.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(nim => 
        statusFilter === 'active' ? nim.status : !nim.status
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at);
        case 'oldest':
          return new Date(a.createdAt || a.created_at) - new Date(b.createdAt || b.created_at);
        case 'nim':
          return a.nim.localeCompare(b.nim);
        case 'status':
          return (b.status ? 1 : 0) - (a.status ? 1 : 0);
        default:
          return 0;
      }
    });

    setFilteredNims(filtered);
  }, [nims, searchTerm, statusFilter, sortBy]);

  // Handle add single NIM
  const handleAddSingleNim = async (e) => {
    e.preventDefault();
    
    if (!singleNim.trim()) {
      setError('NIM tidak boleh kosong');
      return;
    }

    try {
      setProcessing(true);
      
      const response = await nimApi.addNim(singleNim.trim());
      
      if (response.success) {
        setShowAddModal(false);
        setSingleNim('');
        setSuccessMessage('NIM berhasil ditambahkan');
        await fetchNims(true);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Add NIM error:', error);
      const errorResult = handleApiError(error);
      setError(errorResult.message);
      setTimeout(() => setError(null), 10000);
    } finally {
      setProcessing(false);
    }
  };

  // Handle add bulk NIMs
  const handleAddBulkNims = async (e) => {
    e.preventDefault();
    
    if (!bulkNims.trim()) {
      setError('Daftar NIM tidak boleh kosong');
      return;
    }

    // Parse NIMs from textarea
    const nimsList = bulkNims
      .split('\n')
      .map(nim => nim.trim())
      .filter(nim => nim.length > 0);

    if (nimsList.length === 0) {
      setError('Tidak ada NIM yang valid');
      return;
    }

    try {
      setProcessing(true);
      
      const response = await nimApi.addMultipleNims(nimsList);
      
      if (response.success) {
        setShowBulkModal(false);
        setBulkNims('');
        setSuccessMessage(`${nimsList.length} NIM berhasil ditambahkan`);
        await fetchNims(true);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Add bulk NIMs error:', error);
      const errorResult = handleApiError(error);
      setError(errorResult.message);
      setTimeout(() => setError(null), 10000);
    } finally {
      setProcessing(false);
    }
  };

  // Handle activate/deactivate NIM
  const handleToggleNimStatus = async (nim) => {
    try {
      setProcessing(true);
      
      const response = nim.status 
        ? await nimApi.deactivateNim(nim.id)
        : await nimApi.activateNim(nim.id);
      
      if (response.success) {
        setSuccessMessage(`NIM ${nim.nim} berhasil ${nim.status ? 'dinonaktifkan' : 'diaktifkan'}`);
        await fetchNims(true);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Toggle NIM status error:', error);
      const errorResult = handleApiError(error);
      setError(errorResult.message);
      setTimeout(() => setError(null), 10000);
    } finally {
      setProcessing(false);
    }
  };

  // Handle delete NIM (if backend supports it)
  const handleDeleteNim = async () => {
    if (!selectedNim) return;
    
    try {
      setProcessing(true);
      
      // Since backend doesn't have delete endpoint, we'll deactivate instead
      const response = await nimApi.deactivateNim(selectedNim.id);
      
      if (response.success) {
        setShowDeleteModal(false);
        setSelectedNim(null);
        setSuccessMessage(`NIM ${selectedNim.nim} berhasil dinonaktifkan`);
        await fetchNims(true);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Delete NIM error:', error);
      const errorResult = handleApiError(error);
      setError(errorResult.message);
      setTimeout(() => setError(null), 10000);
    } finally {
      setProcessing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchNims(true);
    setSuccessMessage('');
    setError(null);
  };

  // Handle export NIMs
  const handleExportNims = () => {
    const csvContent = [
      'NIM,Status,Tanggal Dibuat',
      ...filteredNims.map(nim => [
        nim.nim,
        nim.status ? 'Aktif' : 'Non-aktif',
        formatDate(nim.createdAt || nim.created_at)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nim-whitelist-${formatDate(new Date())}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Get stats
  const stats = {
    total: nims.length,
    active: nims.filter(nim => nim.status).length,
    inactive: nims.filter(nim => !nim.status).length
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Kelola NIM</h1>
            <p className="text-gray-600">
              Kelola whitelist NIM yang diizinkan mendaftar ke sistem
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportNims}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Bulk Import</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah NIM</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total NIM</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">NIM Aktif</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <ShieldOff className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">NIM Non-aktif</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari NIM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            <option value="nim">NIM A-Z</option>
            <option value="status">Status</option>
          </select>

          {/* Stats */}
          <div className="flex items-center justify-end text-sm text-gray-600">
            <span>
              Menampilkan {filteredNims.length} dari {nims.length} NIM
            </span>
          </div>
        </div>
      </div>

      {/* NIMs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NIM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Dibuat
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredNims.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">
                      {searchTerm ? 'Tidak ada NIM yang sesuai dengan pencarian' : 'Belum ada NIM'}
                    </p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      Tambah NIM Pertama
                    </button>
                  </td>
                </tr>
              ) : (
                filteredNims.map((nim) => (
                  <tr key={nim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          nim.status ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {nim.status ? (
                            <Shield className="w-5 h-5 text-green-600" />
                          ) : (
                            <ShieldOff className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {nim.nim}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {nim.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        nim.status 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {nim.status ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(nim.createdAt || nim.created_at)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getRelativeTime(nim.createdAt || nim.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggleNimStatus(nim)}
                          disabled={processing}
                          className={`p-1 rounded transition-colors ${
                            nim.status
                              ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                              : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                          } disabled:opacity-50`}
                          title={nim.status ? 'Nonaktifkan NIM' : 'Aktifkan NIM'}
                        >
                          {nim.status ? (
                            <ShieldOff className="w-4 h-4" />
                          ) : (
                            <Shield className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedNim(nim);
                            setShowDeleteModal(true);
                          }}
                          disabled={processing}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors disabled:opacity-50"
                          title="Hapus NIM"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Single NIM Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tambah NIM Baru</h2>
            
            <form onSubmit={handleAddSingleNim} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIM
                </label>
                <input
                  type="text"
                  value={singleNim}
                  onChange={(e) => setSingleNim(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Contoh: 20210001"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  NIM yang ditambahkan akan dapat digunakan untuk registrasi
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={processing}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processing || !singleNim.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-1"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Tambah</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Bulk NIM</h2>
            
            <form onSubmit={handleAddBulkNims} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daftar NIM
                </label>
                <textarea
                  value={bulkNims}
                  onChange={(e) => setBulkNims(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="10"
                  placeholder="Masukkan satu NIM per baris:&#10;20210001&#10;20210002&#10;20210003"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Masukkan satu NIM per baris. NIM yang sudah ada akan diabaikan.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  disabled={processing}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processing || !bulkNims.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-1"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Mengimpor...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Import</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedNim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Nonaktifkan NIM</h2>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menonaktifkan NIM <strong>{selectedNim.nim}</strong>? 
              NIM yang dinonaktifkan tidak dapat digunakan untuk registrasi.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedNim(null);
                }}
                disabled={processing}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteNim}
                disabled={processing}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-1"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <ShieldOff className="w-4 h-4" />
                    <span>Nonaktifkan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NIMManagement;