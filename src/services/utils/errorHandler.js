// src/services/utils/errorHandler.js - Enhanced version with robust API response handling

/**
 * Enhanced error handler with better API response parsing and connection handling
 */

// API Response validation and extraction utilities
export const validateApiResponse = (data, expectedType = 'object') => {
  try {
    if (data === null || data === undefined) {
      return {
        isValid: false,
        data: expectedType === 'array' ? [] : null,
        error: 'No data received'
      };
    }

    // Type validation
    switch (expectedType) {
      case 'array':
        if (Array.isArray(data)) {
          return { isValid: true, data, error: null };
        }
        return {
          isValid: false,
          data: [],
          error: 'Expected array but received ' + typeof data
        };
        
      case 'object':
        if (typeof data === 'object' && !Array.isArray(data)) {
          return { isValid: true, data, error: null };
        }
        return {
          isValid: false,
          data: {},
          error: 'Expected object but received ' + typeof data
        };
        
      default:
        return { isValid: true, data, error: null };
    }
  } catch (error) {
    return {
      isValid: false,
      data: expectedType === 'array' ? [] : null,
      error: 'Validation error: ' + error.message
    };
  }
};

// Safe API call wrapper
export const safeApiCall = async (apiFunction, fallbackData = null, serviceName = 'API Service') => {
  try {
    console.log(`🔄 [${serviceName}] Making API call...`);
    
    const result = await apiFunction();
    
    if (result && result.success) {
      console.log(`✅ [${serviceName}] API call successful`);
      return result;
    } else {
      console.warn(`⚠️ [${serviceName}] API returned unsuccessful result:`, result);
      return {
        success: false,
        data: fallbackData,
        message: result?.message || `${serviceName} returned unsuccessful result`,
        error: new Error(`${serviceName} API call failed`)
      };
    }
  } catch (error) {
    console.error(`❌ [${serviceName}] API call failed:`, error);
    
    // Categorize the error
    let errorCategory = 'unknown';
    let userMessage = `${serviceName} tidak tersedia`;
    
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      errorCategory = 'connection';
      userMessage = `${serviceName} tidak dapat dihubungi. Periksa apakah server berjalan.`;
    } else if (error.code === 'ENOTFOUND' || error.message.includes('ENOTFOUND')) {
      errorCategory = 'dns';
      userMessage = `${serviceName} tidak ditemukan. Periksa konfigurasi jaringan.`;
    } else if (error.response) {
      errorCategory = 'response';
      const status = error.response.status;
      
      if (status >= 500) {
        userMessage = `${serviceName} mengalami masalah server (${status})`;
      } else if (status >= 400) {
        userMessage = error.response.data?.message || `${serviceName} menolak permintaan (${status})`;
      }
    } else if (error.request) {
      errorCategory = 'timeout';
      userMessage = `${serviceName} tidak merespons. Coba lagi nanti.`;
    }
    
    return {
      success: false,
      data: fallbackData,
      message: userMessage,
      error: error,
      category: errorCategory
    };
  }
};

// Enhanced API error handler
export const handleApiError = (error, context = 'API') => {
  console.error(`❌ [${context}] Error:`, error);
  
  // If error is already a processed error result
  if (error && typeof error === 'object' && error.hasOwnProperty('success') && !error.success) {
    return {
      message: error.message || 'Terjadi kesalahan',
      type: 'api_error',
      details: error
    };
  }
  
  // Handle different error types
  if (error?.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    let message = 'Terjadi kesalahan server';
    
    switch (status) {
      case 400:
        message = data?.message || 'Permintaan tidak valid';
        break;
      case 401:
        message = 'Sesi telah berakhir. Silakan login ulang';
        break;
      case 403:
        message = 'Anda tidak memiliki akses untuk melakukan tindakan ini';
        break;
      case 404:
        message = 'Data atau halaman tidak ditemukan';
        break;
      case 422:
        message = data?.message || 'Data tidak memenuhi syarat';
        break;
      case 429:
        message = 'Terlalu banyak permintaan. Coba lagi nanti';
        break;
      case 500:
        message = 'Terjadi kesalahan server internal';
        break;
      case 502:
        message = 'Server gateway bermasalah';
        break;
      case 503:
        message = 'Layanan sedang tidak tersedia';
        break;
      default:
        message = data?.message || `Error ${status}: ${error.response.statusText}`;
    }
    
    return {
      message,
      type: 'http_error',
      status,
      details: data
    };
  } else if (error?.request) {
    // Network error - no response received
    return {
      message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda',
      type: 'network_error',
      details: error.code || 'NETWORK_ERROR'
    };
  } else if (error?.code) {
    // Specific error codes
    switch (error.code) {
      case 'ECONNREFUSED':
        return {
          message: 'Server menolak koneksi. Pastikan server berjalan',
          type: 'connection_error',
          details: error.code
        };
      case 'ENOTFOUND':
        return {
          message: 'Server tidak ditemukan. Periksa konfigurasi jaringan',
          type: 'dns_error',
          details: error.code
        };
      case 'ETIMEDOUT':
        return {
          message: 'Koneksi timeout. Server tidak merespons',
          type: 'timeout_error',
          details: error.code
        };
      default:
        return {
          message: `Kesalahan jaringan: ${error.code}`,
          type: 'network_error',
          details: error.code
        };
    }
  } else if (error?.message) {
    // Generic error with message
    return {
      message: error.message,
      type: 'generic_error',
      details: error
    };
  } else {
    // Unknown error
    return {
      message: 'Terjadi kesalahan yang tidak diketahui',
      type: 'unknown_error',
      details: error
    };
  }
};

// Connection error handler for services
export const handleConnectionError = (error, serviceName = 'Service') => {
  console.error(`❌ [${serviceName}] Connection error:`, error);
  
  if (error?.code === 'ECONNREFUSED' || error?.message?.includes('ECONNREFUSED')) {
    return {
      message: `${serviceName} tidak dapat dihubungi. Pastikan backend berjalan`,
      type: 'connection_refused',
      service: serviceName
    };
  }
  
  if (error?.code === 'ENOTFOUND' || error?.message?.includes('ENOTFOUND')) {
    return {
      message: `${serviceName} tidak ditemukan. Periksa konfigurasi`,
      type: 'service_not_found',
      service: serviceName
    };
  }
  
  if (error?.request && !error?.response) {
    return {
      message: `${serviceName} tidak merespons. Coba lagi nanti`,
      type: 'no_response',
      service: serviceName
    };
  }
  
  return handleApiError(error, serviceName);
};

// Form validation error handler
export const handleFormError = (error, fieldName = null) => {
  if (error?.response?.status === 422) {
    const validationErrors = error.response.data?.errors || {};
    
    if (fieldName && validationErrors[fieldName]) {
      return {
        message: validationErrors[fieldName][0] || 'Validasi gagal',
        field: fieldName,
        type: 'validation_error'
      };
    }
    
    // Return first validation error
    const firstField = Object.keys(validationErrors)[0];
    if (firstField) {
      return {
        message: validationErrors[firstField][0] || 'Validasi gagal',
        field: firstField,
        type: 'validation_error'
      };
    }
  }
  
  return handleApiError(error, 'Form Validation');
};

// File upload error handler
export const handleFileError = (error) => {
  if (error?.response?.status === 413) {
    return {
      message: 'File terlalu besar. Maksimal 5MB',
      type: 'file_too_large'
    };
  }
  
  if (error?.response?.status === 415) {
    return {
      message: 'Format file tidak didukung',
      type: 'unsupported_format'
    };
  }
  
  return handleApiError(error, 'File Upload');
};

// Auth error handler
export const handleAuthError = (error) => {
  const result = handleApiError(error, 'Authentication');
  
  // Add specific auth handling
  if (result.status === 401) {
    // Clear stored tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return {
      ...result,
      message: 'Sesi telah berakhir. Silakan login ulang',
      shouldRedirectToLogin: true
    };
  }
  
  return result;
};

// Retry logic for failed API calls
export const retryApiCall = async (apiFunction, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 API call attempt ${attempt}/${maxRetries}`);
      const result = await apiFunction();
      
      if (result.success) {
        console.log(`✅ API call succeeded on attempt ${attempt}`);
        return result;
      }
      
      lastError = new Error(result.message || 'API call unsuccessful');
    } catch (error) {
      console.warn(`❌ API call attempt ${attempt} failed:`, error.message);
      lastError = error;
      
      // Don't retry on certain errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        break;
      }
      
      // Wait before retrying (except on last attempt)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  console.error(`❌ All ${maxRetries} API call attempts failed`);
  throw lastError;
};

// Helper to extract arrays from API responses with multiple possible formats
export const extractArrayFromResponse = (response, defaultArray = []) => {
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
    const possibleArrayKeys = [
      'data', 'items', 'results', 'list',
      'users', 'mails', 'surat', 'messages',
      'records', 'entries', 'content'
    ];
    
    for (const key of possibleArrayKeys) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }
    
    // If data has a nested structure, try to find arrays in common patterns
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    if (data.result && Array.isArray(data.result)) {
      return data.result;
    }
    
    // If data is an object but not an array, return empty array
    return defaultArray;
  }
  
  return defaultArray;
};

// Debug helper for API responses
export const debugApiResponse = (response, context = 'API Response') => {
  console.group(`🔍 [${context}] Debug Info`);
  console.log('Response object:', response);
  console.log('Response type:', typeof response);
  console.log('Is success:', response?.success);
  console.log('Data type:', typeof response?.data);
  console.log('Data is array:', Array.isArray(response?.data));
  
  if (response?.data && typeof response.data === 'object') {
    console.log('Data keys:', Object.keys(response.data));
    
    // Check for array properties
    const arrayKeys = Object.keys(response.data).filter(key => 
      Array.isArray(response.data[key])
    );
    if (arrayKeys.length > 0) {
      console.log('Array properties found:', arrayKeys);
      arrayKeys.forEach(key => {
        console.log(`  ${key}: ${response.data[key].length} items`);
      });
    }
  }
  
  console.groupEnd();
  
  return response;
};

// Export all utilities
export default {
  handleApiError,
  handleConnectionError,
  handleFormError,
  handleFileError,
  handleAuthError,
  validateApiResponse,
  safeApiCall,
  retryApiCall,
  extractArrayFromResponse,
  debugApiResponse
};