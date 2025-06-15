// src/services/api/suratApi.js - Fixed to match backend multer exactly
import { mailApiClient, API_CONFIG } from '../../config/apiConfig';

export const suratApi = {
  // User functions - create surat dengan file upload - FIXED VERSION
  createSurat: async (suratData, file) => {
    try {
      console.log('📤 Creating surat with data:', suratData);
      console.log('📎 File:', file ? { name: file.name, size: file.size, type: file.type } : 'No file');

      if (!file) {
        throw new Error('File surat wajib dipilih');
      }

      // Create FormData for multipart upload - EXACTLY as backend expects
      const formData = new FormData();
      
      // Append data in the exact order backend expects
      if (suratData.subject_surat) {
        formData.append('subject_surat', suratData.subject_surat);
      }
      
      // CRITICAL: Append file with exact field name that multer expects
      formData.append('file_surat', file, file.name);

      // Debug FormData contents
      console.log('📦 FormData being sent:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value.name ? `File(${value.name})` : value);
      }

      // Use direct fetch instead of axios to avoid any axios processing
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      console.log('📡 Making direct fetch request...');
      const response = await fetch(
        `${API_CONFIG.MAIL_SERVICE.baseURL}${API_CONFIG.MAIL_SERVICE.endpoints.createMail}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // CRITICAL: Do NOT set Content-Type - let browser handle multipart boundary
          },
          body: formData
        }
      );

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      // Parse response
      let result;
      try {
        result = await response.json();
        console.log('✅ Create surat response:', result);
      } catch (parseError) {
        const textResponse = await response.text();
        console.error('❌ Failed to parse JSON, raw response:', textResponse);
        throw new Error('Invalid JSON response from server');
      }

      // Handle response based on backend format
      if (response.ok) {
        // Backend returns: { message, mail }
        return {
          success: true,
          data: result.mail || result,
          message: result.message || 'Surat berhasil diajukan'
        };
      } else {
        // Handle error response
        throw new Error(result.message || result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      console.error('❌ CreateSurat API Error:', error);
      
      // Enhanced error handling
      let errorMessage = 'Gagal mengajukan surat';
      
      if (error.message?.includes('No access token')) {
        errorMessage = 'Sesi berakhir. Silakan login ulang.';
      } else if (error.message?.includes('No file uploaded')) {
        errorMessage = 'File tidak terdeteksi oleh server. Coba pilih file lagi.';
      } else if (error.message?.includes('File upload error')) {
        errorMessage = 'Error saat upload file. Periksa ukuran dan format file.';
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Koneksi bermasalah. Periksa koneksi internet Anda.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: errorMessage,
        error: error
      };
    }
  },

  // Get user's surat
  getUserSurat: async () => {
    try {
      console.log('📋 Fetching user surat...');
      
      const response = await mailApiClient.get(
        API_CONFIG.MAIL_SERVICE.endpoints.getUserMails
      );
      
      console.log('📋 User surat response:', response);
      
      if (response.data) {
        // Backend returns: { mails: [...] }
        const mails = response.data.mails || [];
        
        if (Array.isArray(mails)) {
          return {
            success: true,
            data: mails,
            message: 'Surat berhasil dimuat'
          };
        } else {
          return {
            success: true,
            data: [],
            message: 'Tidak ada surat ditemukan'
          };
        }
      } else {
        return {
          success: false,
          data: [],
          message: 'No response data'
        };
      }
    } catch (error) {
      console.error('❌ GetUserSurat API Error:', error);
      
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || error.message || 'Gagal memuat surat',
        error: error
      };
    }
  },

  // Get surat detail
  getSuratDetail: async (mailId) => {
    try {
      console.log('🔍 Fetching surat detail for ID:', mailId);
      
      const response = await mailApiClient.get(
        `${API_CONFIG.MAIL_SERVICE.endpoints.getMailDetail}/${mailId}`
      );
      
      console.log('🔍 Surat detail response:', response);
      
      if (response.data) {
        // Backend returns: { mail: {...} }
        return {
          success: true,
          data: response.data.mail || response.data,
          message: 'Detail surat berhasil dimuat'
        };
      } else {
        return {
          success: false,
          data: null,
          message: 'No response data'
        };
      }
    } catch (error) {
      console.error('❌ GetSuratDetail API Error:', error);
      
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || error.message || 'Gagal memuat detail surat',
        error: error
      };
    }
  },

  // Get surat history
  getSuratHistory: async (mailId) => {
    try {
      console.log('📚 Fetching surat history for ID:', mailId);
      
      const response = await mailApiClient.get(
        `${API_CONFIG.MAIL_SERVICE.endpoints.getMailHistory}/${mailId}`
      );
      
      console.log('📚 Surat history response:', response);
      
      if (response.data) {
        // Backend returns: { history: [...] }
        const histories = response.data.history || [];
        
        if (Array.isArray(histories)) {
          return {
            success: true,
            data: histories,
            message: 'History berhasil dimuat'
          };
        } else {
          return {
            success: true,
            data: [],
            message: 'Tidak ada history ditemukan'
          };
        }
      } else {
        return {
          success: true,
          data: [],
          message: 'No history data'
        };
      }
    } catch (error) {
      console.error('❌ GetSuratHistory API Error:', error);
      
      // Don't fail hard on history errors, return empty array
      return {
        success: true,
        data: [],
        message: 'History tidak tersedia',
        error: error
      };
    }
  },

  // Admin functions - get all surat with enhanced error handling
  getAllSurat: async () => {
    try {
      console.log('📊 Fetching all surat (admin)...');
      
      const response = await mailApiClient.get(
        API_CONFIG.MAIL_SERVICE.endpoints.getAllMails,
        {
          timeout: 15000 // 15 second timeout
        }
      );
      
      console.log('📊 All surat response:', response);
      
      if (response.data) {
        // Backend returns: { mails: [...] }
        // Backend already processes latestStatus for each mail
        const suratData = response.data.mails || [];
        
        // Ensure it's an array
        if (!Array.isArray(suratData)) {
          console.warn('Expected array but got:', typeof suratData, suratData);
          return {
            success: true,
            data: [],
            message: 'No surat data available'
          };
        }
        
        console.log(`📊 Processed ${suratData.length} surat records`);
        
        return {
          success: true,
          data: suratData,
          message: `${suratData.length} surat berhasil dimuat`
        };
      } else {
        return {
          success: false,
          data: [],
          message: 'No data received from server'
        };
      }
    } catch (error) {
      console.error('❌ GetAllSurat API Error:', error);
      
      let errorMessage = 'Gagal memuat data surat';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 401:
            errorMessage = 'Akses ditolak. Login sebagai admin.';
            break;
          case 403:
            errorMessage = 'Anda tidak memiliki akses admin.';
            break;
          case 404:
            errorMessage = 'Endpoint tidak ditemukan.';
            break;
          case 500:
            errorMessage = 'Server error. Coba lagi nanti.';
            break;
          default:
            errorMessage = data.message || `Error ${status}`;
        }
      } else if (error.request) {
        errorMessage = 'Koneksi ke Mail Service bermasalah';
      }
      
      return {
        success: false,
        data: [],
        message: errorMessage,
        error: error
      };
    }
  },

  // Update surat status (admin only) - FIXED to ensure reason is always sent
  updateSuratStatus: async (mailId, status, alasan = null) => {
    try {
      console.log('🔄 Updating surat status:', { mailId, status, alasan });
      
      if (!mailId) {
        throw new Error('Mail ID is required');
      }
      
      if (!status) {
        throw new Error('Status is required');
      }
      
      // FIXED: Always include alasan in payload, even if it's an empty string
      const payload = { 
        status: status.toString().trim()
      };
      
      // Always include alasan, even for approve action
      if (alasan !== null && alasan !== undefined) {
        payload.alasan = alasan.toString().trim();
      } else {
        // Set empty string if no reason provided (shouldn't happen with new validation)
        payload.alasan = '';
      }
      
      console.log('📤 Sending payload to backend:', payload);
      console.log('📤 Payload details:', {
        mailId: mailId,
        payloadKeys: Object.keys(payload),
        statusType: typeof payload.status,
        alasanType: typeof payload.alasan,
        alasanLength: payload.alasan ? payload.alasan.length : 0
      });
      
      // Fixed: Use correct endpoint format POST /api/history/:mailId
      const response = await mailApiClient.post(
        `${API_CONFIG.MAIL_SERVICE.endpoints.updateMailStatus}/${mailId}`,
        payload,
        {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Update status response:', response);
      console.log('✅ Response data details:', {
        status: response.status,
        dataKeys: response.data ? Object.keys(response.data) : [],
        data: response.data
      });
      
      if (response.data) {
        // Backend returns: { message, history }
        return {
          success: true,
          data: response.data.history || response.data,
          message: response.data.message || `Status berhasil diubah ke ${status}`
        };
      } else {
        return {
          success: true,
          message: `Status berhasil diubah ke ${status}`
        };
      }
    } catch (error) {
      console.error('❌ UpdateSuratStatus API Error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      let errorMessage = 'Gagal mengubah status surat';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        console.log('❌ Backend error response:', { status, data });
        
        switch (status) {
          case 400:
            errorMessage = data.message || 'Data tidak valid';
            break;
          case 401:
            errorMessage = 'Akses ditolak. Login sebagai admin.';
            break;
          case 403:
            errorMessage = 'Anda tidak memiliki akses untuk mengubah status.';
            break;
          case 404:
            errorMessage = 'Surat tidak ditemukan.';
            break;
          case 422:
            errorMessage = data.message || 'Data tidak memenuhi syarat.';
            break;
          case 500:
            errorMessage = 'Server error. Coba lagi nanti.';
            break;
          default:
            errorMessage = data.message || `Error ${status}`;
        }
      } else if (error.request) {
        errorMessage = 'Koneksi ke Mail Service bermasalah';
      } else {
        errorMessage = error.message || 'Terjadi kesalahan tidak terduga';
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error
      };
    }
  },

  // Get surat statistics (admin only)
  getSuratStats: async () => {
    try {
      console.log('📈 Fetching surat statistics...');
      
      const response = await mailApiClient.get(
        `${API_CONFIG.MAIL_SERVICE.endpoints.getMailStats}`,
        { timeout: 10000 }
      );
      
      console.log('📈 Surat stats response:', response);
      
      if (response.data) {
        return {
          success: true,
          data: response.data,
          message: 'Statistik berhasil dimuat'
        };
      } else {
        return {
          success: false,
          data: null,
          message: 'No stats data received'
        };
      }
    } catch (error) {
      console.error('❌ GetSuratStats API Error:', error);
      
      // Try to calculate stats from getAllSurat if stats endpoint fails
      console.log('🔄 Trying to calculate stats from getAllSurat...');
      
      try {
        const allSuratResponse = await this.getAllSurat();
        
        if (allSuratResponse.success) {
          const allSurat = allSuratResponse.data || [];
          
          const stats = {
            totalMails: allSurat.length,
            mailsByStatus: [],
            monthlyStats: []
          };
          
          // Count by status - use latestStatus from processed backend data
          const statusCounts = { diproses: 0, disetujui: 0, ditolak: 0 };
          
          allSurat.forEach(surat => {
            const latestStatus = surat.latestStatus || 'diproses';
            if (statusCounts.hasOwnProperty(latestStatus)) {
              statusCounts[latestStatus]++;
            }
          });
          
          stats.mailsByStatus = Object.keys(statusCounts).map(status => ({
            status,
            count: statusCounts[status]
          }));
          
          // Calculate monthly stats for last 6 months
          const now = new Date();
          for (let i = 5; i >= 0; i--) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            
            const count = allSurat.filter(surat => {
              const suratDate = new Date(surat.tanggal_pengiriman);
              return suratDate >= month && suratDate < nextMonth;
            }).length;
            
            stats.monthlyStats.push({
              month: month.toLocaleString('default', { month: 'long' }),
              year: month.getFullYear(),
              count: count
            });
          }
          
          return {
            success: true,
            data: stats,
            message: 'Statistik berhasil dihitung'
          };
        }
      } catch (calcError) {
        console.error('❌ Failed to calculate stats:', calcError);
      }
      
      return {
        success: false,
        data: null,
        message: 'Statistik tidak tersedia',
        error: error
      };
    }
  },

  // Get mail template (if backend supports it)
  getMailTemplate: async () => {
    try {
      console.log('📄 Fetching mail template...');
      
      const response = await mailApiClient.get(
        API_CONFIG.MAIL_SERVICE.endpoints.getMailTemplate
      );
      
      console.log('📄 Mail template response:', response);
      
      if (response.data) {
        return {
          success: true,
          data: response.data,
          message: 'Template berhasil dimuat'
        };
      } else {
        return {
          success: false,
          data: null,
          message: 'Template tidak tersedia'
        };
      }
    } catch (error) {
      console.error('❌ GetMailTemplate API Error:', error);
      
      return {
        success: false,
        data: null,
        message: 'Template tidak tersedia',
        error: error
      };
    }
  },

  // Download surat file
  downloadSuratFile: async (fileUrl) => {
    try {
      if (!fileUrl) {
        throw new Error('File URL is required');
      }
      
      // If it's a full URL, open directly
      if (fileUrl.startsWith('http')) {
        window.open(fileUrl, '_blank');
        return {
          success: true,
          message: 'File dibuka di tab baru'
        };
      }
      
      // Otherwise, construct the download URL
      const response = await mailApiClient.get(fileUrl, {
        responseType: 'blob'
      });
      
      // Create blob URL and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `surat-${Date.now()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      return {
        success: true,
        message: 'File berhasil didownload'
      };
    } catch (error) {
      console.error('❌ DownloadSuratFile Error:', error);
      
      return {
        success: false,
        message: 'Gagal mendownload file',
        error: error
      };
    }
  },

  // Validate file before upload
  validateFile: (file) => {
    const errors = [];
    
    if (!file) {
      errors.push('File wajib dipilih');
      return { isValid: false, errors };
    }
    
    // File size validation (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push('Ukuran file tidak boleh lebih dari 5MB');
    }
    
    // File type validation
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('Format file tidak didukung. Gunakan PDF, DOC, DOCX, JPG, atau PNG');
    }
    
    // File name validation
    if (file.name.length > 255) {
      errors.push('Nama file terlalu panjang');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
};