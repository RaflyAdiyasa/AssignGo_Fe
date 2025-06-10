// src/config/apiConfig.js - Simplified with correct endpoints
import axios from 'axios';

export const API_CONFIG = {
  USER_SERVICE: {
    baseURL: 'https://assigngo-user-424905547173.us-central1.run.app',
    endpoints: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      refreshToken: '/api/auth/refresh-token',
      profile: '/api/users/profile',
      updateProfile: '/api/users/profile',
      getAllUsers: '/api/users',
      getUserById: '/api/users'
    }
  },
  MAIL_SERVICE: {
    baseURL: 'https://assigngo-mail-424905547173.us-central1.run.app',
    endpoints: {
      createMail: '/api/mails',
      getUserMails: '/api/mails/user',
      getMailDetail: '/api/mails/details',
      getMailTemplate: '/api/mails/template',
      getMailHistory: '/api/history',
      updateMailStatus: '/api/history',
      getAllMails: '/api/mails',
      getMailStats: '/api/mails/stats'
    }
  }
};

// User Service Axios Instance
export const userApiClient = axios.create({
  baseURL: API_CONFIG.USER_SERVICE.baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Mail Service Axios Instance  
export const mailApiClient = axios.create({
  baseURL: API_CONFIG.MAIL_SERVICE.baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Request interceptor to add auth token
const addAuthInterceptor = (apiClient, serviceName) => {
  // Request interceptor
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      console.log(`🚀 [${serviceName}] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error(`❌ [${serviceName}] Request Error:`, error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  apiClient.interceptors.response.use(
    (response) => {
      console.log(`✅ [${serviceName}] ${response.status} ${response.config.url}`);
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      
      console.error(`❌ [${serviceName}] ${error.response?.status || 'Network Error'} ${originalRequest?.url}`);
      
      // Handle 401 Unauthorized with token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const response = await axios.post(
              `${API_CONFIG.USER_SERVICE.baseURL}/api/auth/refresh-token`, 
              { refreshToken }
            );
            
            if (response.data?.accessToken) {
              localStorage.setItem('accessToken', response.data.accessToken);
              originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
              return apiClient.request(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            handleAuthFailure();
          }
        } else {
          handleAuthFailure();
        }
      }

      return Promise.reject(error);
    }
  );
};

// Handle authentication failure
const handleAuthFailure = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');
  
  // Only redirect if not already on login page
  if (!window.location.pathname.includes('/login')) {
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  }
};

// Apply interceptors
addAuthInterceptor(userApiClient, 'USER_SERVICE');
addAuthInterceptor(mailApiClient, 'MAIL_SERVICE');

// Health check functions
export const testConnection = async () => {
  try {
    const response = await fetch(`${API_CONFIG.USER_SERVICE.baseURL}/health`, {
      timeout: 5000
    });
    
    if (response.ok) {
      return { success: true, message: 'Backend connection OK' };
    } else {
      return { success: false, message: `Backend returned ${response.status}` };
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Cannot connect to backend: ${error.message}` 
    };
  }
};

export default userApiClient;