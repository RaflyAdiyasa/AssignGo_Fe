// src/pages/admin/StatisticsReports.js - Fixed to use backend latestStatus like MailManagement
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Users, 
  FileText, 
  Download, 
  RefreshCw,
  Filter,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { suratApi } from '../../services/api/suratApi';
import { userApi } from '../../services/api/userApi';
import LoadingSpinner, { SkeletonCard } from '../../components/common/LoadingSpinner';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import { handleApiError } from '../../services/utils/errorHandler';
import { SURAT_STATUS } from '../../utils/constants';

const StatisticsReports = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('month'); // week, month, quarter, year
  
  // Data
  const [overviewStats, setOverviewStats] = useState({
    totalUsers: 0,
    totalMails: 0,
    approvalRate: 0,
    averageProcessingTime: 0,
    pendingMails: 0,
    completedMails: 0
  });
  
  const [statusDistribution, setStatusDistribution] = useState({
    diproses: 0,
    disetujui: 0,
    ditolak: 0
  });
  
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  
  // Computed stats
  const [trends, setTrends] = useState({
    mailsGrowth: 0,
    usersGrowth: 0,
    approvalRateChange: 0
  });

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

  // Fetch all statistics data - using same approach as MailManagement
  const fetchStatisticsData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('📊 Fetching all surat and users for statistics...');

      // Fetch both surat and users data in parallel - same as MailManagement
      const [suratResponse, usersResponse] = await Promise.all([
        suratApi.getAllSurat(),
        userApi.getAllUsers()
      ]);

      console.log('📊 Raw responses:', { suratResponse, usersResponse });

      // Safely extract arrays from responses - same as MailManagement
      const allMails = extractArrayFromResponse(suratResponse, []);
      const allUsers = extractArrayFromResponse(usersResponse, []);

      console.log('📊 Extracted data:', { 
        mailsCount: allMails.length, 
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

      // Process statistics using the mapped data
      await processStatistics(mailsWithUserData, allUsers);

    } catch (error) {
      console.error('❌ Fetch statistics error:', error);
      const errorResult = handleApiError(error);
      setError(errorResult.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Process all statistics - using latestStatus from backend like MailManagement
  const processStatistics = async (mails, users) => {
    const totalUsers = users.length;
    const totalMails = mails.length;
    
    // Status distribution - use latestStatus from backend like MailManagement
    const statusDist = { diproses: 0, disetujui: 0, ditolak: 0 };
    const processedMails = [];
    
    mails.forEach(mail => {
      try {
        // Backend already provides latestStatus - same logic as MailManagement
        const latestStatus = mail.latestStatus || 'diproses'; // default status
        
        if (statusDist.hasOwnProperty(latestStatus)) {
          statusDist[latestStatus]++;
        } else {
          statusDist.diproses++; // fallback for unknown status
        }
        
        // Collect processed mails for timing analysis
        if (latestStatus !== 'diproses') {
          processedMails.push(mail);
        }
      } catch (error) {
        console.warn('Error processing mail stats:', mail.id, error);
        statusDist.diproses++; // fallback
      }
    });

    const approvalRate = totalMails > 0 ? Math.round((statusDist.disetujui / totalMails) * 100) : 0;
    const pendingMails = statusDist.diproses;
    const completedMails = statusDist.disetujui + statusDist.ditolak;

    // Calculate average processing time
    let avgProcessingTime = 0;
    if (processedMails.length > 0) {
      const totalProcessingTime = processedMails.reduce((acc, mail) => {
        try {
          const startTime = new Date(mail.tanggal_pengiriman || mail.createdAt || '1970-01-01');
          const endTime = new Date(mail.updatedAt || mail.tanggal_update || startTime);
          const timeDiff = endTime - startTime;
          return acc + Math.max(timeDiff, 0);
        } catch (error) {
          return acc;
        }
      }, 0);
      avgProcessingTime = Math.round(totalProcessingTime / processedMails.length / (1000 * 60 * 60 * 24)); // days
    }

    // Set overview stats
    setOverviewStats({
      totalUsers,
      totalMails,
      approvalRate,
      averageProcessingTime: Math.max(avgProcessingTime, 0),
      pendingMails,
      completedMails
    });

    setStatusDistribution(statusDist);

    console.log('📊 Stats calculated:', { 
      statusDist, 
      approvalRate, 
      avgProcessingTime,
      pendingMails,
      completedMails 
    });

    // Generate time series data
    generateTimeSeriesData(mails);

    // Generate top users
    generateTopUsers(mails, users);

    // Generate recent activity
    generateRecentActivity(mails);

    // Calculate trends (mock data for now - you can implement actual trend calculation)
    setTrends({
      mailsGrowth: 12.5,
      usersGrowth: 8.3,
      approvalRateChange: -2.1
    });
  };

  // Generate time series data for charts
  const generateTimeSeriesData = (mails) => {
    const now = new Date();
    const timeData = [];
    
    // Generate data points based on selected range
    let days = 30;
    if (dateRange === 'week') days = 7;
    else if (dateRange === 'quarter') days = 90;
    else if (dateRange === 'year') days = 365;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const dayMails = mails.filter(mail => {
        try {
          const mailDate = new Date(mail.tanggal_pengiriman || mail.createdAt || '1970-01-01');
          return mailDate.toDateString() === date.toDateString();
        } catch (error) {
          return false;
        }
      });

      // Use latestStatus from backend like MailManagement
      timeData.push({
        date: formatDate(date),
        mails: dayMails.length,
        approved: dayMails.filter(m => (m.latestStatus || 'diproses') === 'disetujui').length,
        rejected: dayMails.filter(m => (m.latestStatus || 'diproses') === 'ditolak').length,
        pending: dayMails.filter(m => (m.latestStatus || 'diproses') === 'diproses').length
      });
    }

    setTimeSeriesData(timeData);
  };

  // Generate top users by mail count
  const generateTopUsers = (mails, users) => {
    const userMailCounts = {};
    
    mails.forEach(mail => {
      const userId = mail.user?.id || mail.id_pengirim;
      if (userId) {
        userMailCounts[userId] = (userMailCounts[userId] || 0) + 1;
      }
    });

    const topUsersList = Object.entries(userMailCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([userId, count]) => {
        const user = users.find(u => u.id.toString() === userId.toString()) || 
                    { username: 'Unknown', nim: 'N/A' };
        
        const userMails = mails.filter(m => 
          (m.user?.id || m.id_pengirim).toString() === userId.toString()
        );
        
        const approvedCount = userMails.filter(m => 
          (m.latestStatus || 'diproses') === 'disetujui'
        ).length;
        
        return {
          user,
          mailCount: count,
          approvedCount
        };
      });

    setTopUsers(topUsersList);
  };

  // Generate recent activity
  const generateRecentActivity = (mails) => {
    const activities = [];
    
    // Create activities based on mail status and update times
    mails.forEach(mail => {
      try {
        const latestStatus = mail.latestStatus || 'diproses';
        const updateDate = mail.updatedAt || mail.tanggal_update || mail.tanggal_pengiriman || mail.createdAt;
        
        activities.push({
          id: `${mail.id}-${latestStatus}`,
          type: 'status_change',
          mail: mail,
          status: latestStatus,
          date: updateDate,
          user: mail.user
        });
      } catch (error) {
        console.warn('Error processing activity:', error);
      }
    });

    // Sort by date and take recent 10
    const recentActivities = activities
      .sort((a, b) => {
        try {
          return new Date(b.date) - new Date(a.date);
        } catch (error) {
          return 0;
        }
      })
      .slice(0, 10);

    setRecentActivity(recentActivities);
  };

  // Initial load
  useEffect(() => {
    fetchStatisticsData();
  }, []);

  // Reload when date range changes
  useEffect(() => {
    if (!loading) {
      fetchStatisticsData(true);
    }
  }, [dateRange]);

  // Handle refresh
  const handleRefresh = () => {
    fetchStatisticsData(true);
  };

  // Export data functionality
  const handleExportData = () => {
    const exportData = {
      overview: overviewStats,
      statusDistribution,
      timeSeriesData,
      topUsers,
      exportDate: new Date().toISOString(),
      dateRange
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `surat-statistics-${formatDate(new Date())}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Statistik & Laporan</h1>
            <p className="text-gray-600">
              Analisis mendalam tentang penggunaan sistem surat tugas
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">7 Hari Terakhir</option>
              <option value="month">30 Hari Terakhir</option>
              <option value="quarter">3 Bulan Terakhir</option>
              <option value="year">1 Tahun Terakhir</option>
            </select>
            <button
              onClick={handleExportData}
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
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-3" />
            <div>
              <p className="text-red-800 font-medium">Gagal memuat data statistik</p>
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

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total User</p>
              <p className="text-2xl font-bold text-gray-900">{overviewStats.totalUsers}</p>
              <div className="flex items-center mt-1">
                <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{trends.usersGrowth}%</span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Surat</p>
              <p className="text-2xl font-bold text-gray-900">{overviewStats.totalMails}</p>
              <div className="flex items-center mt-1">
                <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{trends.mailsGrowth}%</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approval Rate</p>
              <p className="text-2xl font-bold text-gray-900">{overviewStats.approvalRate}%</p>
              <div className="flex items-center mt-1">
                <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">{trends.approvalRateChange}%</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Processing Time</p>
              <p className="text-2xl font-bold text-gray-900">{overviewStats.averageProcessingTime}</p>
              <p className="text-sm text-gray-500">hari</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Status Surat</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
              <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-yellow-700 mb-1">{statusDistribution.diproses}</p>
              <p className="text-sm text-yellow-600 font-medium">Diproses</p>
              <p className="text-xs text-gray-500 mt-1">
                {overviewStats.totalMails > 0 ? Math.round((statusDistribution.diproses / overviewStats.totalMails) * 100) : 0}% dari total
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-green-700 mb-1">{statusDistribution.disetujui}</p>
              <p className="text-sm text-green-600 font-medium">Disetujui</p>
              <p className="text-xs text-gray-500 mt-1">
                {overviewStats.totalMails > 0 ? Math.round((statusDistribution.disetujui / overviewStats.totalMails) * 100) : 0}% dari total
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-red-700 mb-1">{statusDistribution.ditolak}</p>
              <p className="text-sm text-red-600 font-medium">Ditolak</p>
              <p className="text-xs text-gray-500 mt-1">
                {overviewStats.totalMails > 0 ? Math.round((statusDistribution.ditolak / overviewStats.totalMails) * 100) : 0}% dari total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Series Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Tren Surat - {dateRange === 'week' ? '7 Hari' : dateRange === 'month' ? '30 Hari' : dateRange === 'quarter' ? '3 Bulan' : '1 Tahun'} Terakhir</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          {timeSeriesData.length > 0 ? (
            <div className="space-y-4">
              {/* Simple bar chart representation */}
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {timeSeriesData.slice(-10).map((data, index) => (
                  <div key={index} className="flex items-center space-x-3 py-2">
                    <div className="w-20 text-xs text-gray-500">{data.date}</div>
                    <div className="flex-1 flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.max((data.mails / Math.max(...timeSeriesData.map(d => d.mails))) * 100, 5)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{data.mails}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-center space-x-6 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">Total Surat</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">Disetujui</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">Ditolak</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada data untuk ditampilkan</p>
            </div>
          )}
        </div>

        {/* Top Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Users</h2>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          
          {topUsers.length > 0 ? (
            <div className="space-y-4">
              {topUsers.map((userStat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {userStat.user.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {userStat.user.nim}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {userStat.mailCount} surat
                    </p>
                    <p className="text-xs text-green-600">
                      {userStat.approvedCount} disetujui
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada data user</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h2>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        
        {recentActivity.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentActivity.map((activity, index) => (
              <div key={activity.id} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100">
                  {activity.status === 'disetujui' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : activity.status === 'ditolak' ? (
                    <XCircle className="w-4 h-4 text-red-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      Surat "{activity.mail.subject_surat || 'Tanpa Subjek'}" 
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        activity.status === 'disetujui' ? 'bg-green-100 text-green-800' :
                        activity.status === 'ditolak' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.status}
                      </span>
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(activity.date)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    oleh {activity.user?.username || 'Unknown User'} ({activity.user?.nim || 'N/A'})
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada aktivitas terbaru</p>
          </div>
        )}
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Performa</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-blue-700">{overviewStats.completedMails}</p>
              <p className="text-sm text-blue-600 font-medium">Surat Selesai</p>
              <p className="text-xs text-gray-500 mt-1">Disetujui + Ditolak</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-yellow-700">{overviewStats.pendingMails}</p>
              <p className="text-sm text-yellow-600 font-medium">Pending Review</p>
              <p className="text-xs text-gray-500 mt-1">Memerlukan tindakan</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-green-700">{overviewStats.averageProcessingTime}</p>
              <p className="text-sm text-green-600 font-medium">Rata-rata Waktu</p>
              <p className="text-xs text-gray-500 mt-1">Hari untuk proses</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-purple-700">
                {overviewStats.totalMails > 0 ? Math.round((overviewStats.completedMails / overviewStats.totalMails) * 100) : 0}%
              </p>
              <p className="text-sm text-purple-600 font-medium">Completion Rate</p>
              <p className="text-xs text-gray-500 mt-1">Surat yang diselesaikan</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsReports;