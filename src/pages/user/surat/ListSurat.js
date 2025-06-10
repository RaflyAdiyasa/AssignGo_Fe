// src/pages/user/surat/ListSurat.js - FIXED version
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Calendar,
  RefreshCw,
  ExternalLink,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { suratApi } from '../../../services/api/suratApi';
import LoadingSpinner, { SkeletonTable } from '../../../components/common/LoadingSpinner';
import StatusBadge from '../../../components/surat/StatusBadge';
import { formatDate, getRelativeTime } from '../../../utils/dateUtils';
import { handleApiError } from '../../../services/utils/errorHandler';
import { SURAT_STATUS } from '../../../utils/constants';

const ListSurat = () => {
  const navigate = useNavigate();
  const { getUserId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [suratList, setSuratList] = useState([]);
  const [filteredSurat, setFilteredSurat] = useState([]);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // FIXED: Fetch surat data dengan proper handling response wrapper
  const fetchSuratData = async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      console.log('📋 Fetching user surat data...');

      // FIXED: Call API dan handle response wrapper
      const response = await suratApi.getUserSurat();
      
      // FIXED: Extract data dari response wrapper
      let suratData = [];
      if (response && response.success && response.data) {
        suratData = response.data;
      } else if (response && Array.isArray(response)) {
        // Fallback jika API mengembalikan array langsung
        suratData = response;
      } else {
        console.warn('Unexpected surat response format:', response);
        suratData = [];
      }

      console.log('📋 List surat data:', suratData);

      // FIXED: Validasi array
      if (!Array.isArray(suratData)) {
        console.error('Expected array but got:', typeof suratData, suratData);
        throw new Error('Format data surat tidak valid - bukan array');
      }

      // Set data dengan array yang sudah diekstrak
      setSuratList(suratData);
      setFilteredSurat(suratData);

    } catch (e) {
      console.error('❌ Fetch surat error:', e);
      const handled = handleApiError(e);
      setError(handled.message);
      
      // Set empty arrays on error
      setSuratList([]);
      setFilteredSurat([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuratData();
  }, []);

  // FIXED: Filter logic dengan handling latestStatus
  useEffect(() => {
    let filtered = suratList;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(surat =>
        surat.subject_surat.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(surat => {
        // FIXED: Get latest status dengan proper fallback
        let latestStatus = 'diproses'; // default
        
        if (surat.latestStatus) {
          // Backend sudah provide latestStatus
          latestStatus = surat.latestStatus;
        } else if (surat.histories && Array.isArray(surat.histories) && surat.histories.length > 0) {
          // Ambil status terbaru dari histories
          latestStatus = surat.histories[0].status || 'diproses';
        }
        
        return latestStatus === statusFilter;
      });
    }
    
    setFilteredSurat(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, suratList]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredSurat.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSurat = filteredSurat.slice(startIndex, endIndex);

  // Handlers
  const handleRefresh = () => {
    fetchSuratData(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const handleViewDetail = (suratId) => {
    navigate(`/surat/${suratId}`);
  };

  const handleOpenUrl = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // FIXED: Get status from latest history atau latestStatus
  const getLatestStatus = (surat) => {
    if (surat.latestStatus) {
      return surat.latestStatus;
    } else if (surat.histories && Array.isArray(surat.histories) && surat.histories.length > 0) {
      return surat.histories[0].status || 'diproses';
    }
    return 'diproses';
  };

  if (loading) {
    return <SkeletonTable rows={8} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Surat Saya</h1>
          <p className="text-gray-600">Kelola dan pantau status surat tugas Anda</p>
        </div>
        <Link
          to="/surat/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 w-fit"
        >
          <Plus className="w-5 h-5" />
          <span>Buat Surat Baru</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cari berdasarkan subject surat..."
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'all' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => handleStatusFilter('diproses')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'diproses' 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Diproses
                </button>
                <button
                  onClick={() => handleStatusFilter('disetujui')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'disetujui' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Disetujui
                </button>
                <button
                  onClick={() => handleStatusFilter('ditolak')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === 'ditolak' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Ditolak
                </button>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Results Info */}
        <div className="mt-3 text-sm text-gray-600">
          Menampilkan {currentSurat.length} dari {filteredSurat.length} surat
          {searchTerm && ` untuk "${searchTerm}"`}
          {statusFilter !== 'all' && ` dengan status ${statusFilter}`}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Gagal memuat data</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Surat Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {currentSurat.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium mb-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tidak ada surat yang sesuai filter' 
                : 'Belum ada surat yang diajukan'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link
                to="/surat/create"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Surat Pertama</span>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject Surat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentSurat.map((surat) => {
                    const status = getLatestStatus(surat);
                    
                    return (
                      <tr key={surat.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{surat.subject_surat}</p>
                            <p className="text-sm text-gray-500">{getRelativeTime(surat.tanggal_pengiriman)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(surat.tanggal_pengiriman)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetail(surat.id)}
                              className="bg-blue-100 text-blue-700 p-2 rounded-lg hover:bg-blue-200 transition-colors"
                              title="Lihat Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {surat.url_file_surat && (
                              <button
                                onClick={() => handleOpenUrl(surat.url_file_surat)}
                                className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                                title="Buka File"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {currentSurat.map((surat) => {
                const status = getLatestStatus(surat);
                
                return (
                  <div 
                    key={surat.id} 
                    className="border-b border-gray-200 p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewDetail(surat.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 flex-1 pr-2">
                        {surat.subject_surat}
                      </h3>
                      <StatusBadge status={status} size="xs" />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(surat.tanggal_pengiriman)}
                      </div>
                      <div className="flex items-center space-x-2">
                        {surat.url_file_surat && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenUrl(surat.url_file_surat);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        <Eye className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Halaman {currentPage} dari {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListSurat;