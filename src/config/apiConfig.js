// src/config/apiConfig.js
export const API_CONFIG = {
  USER_SERVICE: {
    baseURL: 'http://localhost:3001',
    endpoints: {
      login: '/api/users/login',
      register: '/api/users/register',
      refreshToken: '/api/users/refresh-token',
      profile: '/api/users/profile',
      updateProfile: '/api/users/profile',
      getAllUsers: '/api/users',
      getUserById: '/api/users'
    }
  },
  MAIL_SERVICE: {
    baseURL: 'http://localhost:3002',
    endpoints: {
      // User endpoints
      createMail: '/api/mails',
      getUserMails: '/api/mails/user',
      getMailDetail: '/api/mails',
      getMailHistory: '/api/mails',
      
      // Admin endpoints
      getAllMails: '/api/admin',
      updateMailStatus: '/api/admin',
      getMailStats: '/api/admin/stats'
    }
  }
};

// Helper function untuk build full URL
export const buildApiUrl = (service, endpoint, params = '') => {
  const config = API_CONFIG[service];
  if (!config) {
    throw new Error(`Service ${service} not found`);
  }
  
  const endpointPath = config.endpoints[endpoint];
  if (!endpointPath) {
    throw new Error(`Endpoint ${endpoint} not found in ${service}`);
  }
  
  return `${config.baseURL}${endpointPath}${params}`;
};

// Axios instance configuration
import axios from 'axios';

// User Service Axios Instance
export const userApiClient = axios.create({
  baseURL: API_CONFIG.USER_SERVICE.baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mail Service Axios Instance  
export const mailApiClient = axios.create({
  baseURL: API_CONFIG.MAIL_SERVICE.baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token pada setiap request
const addAuthInterceptor = (apiClient) => {
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor untuk handle token expiry
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Token expired, try to refresh
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const response = await userApiClient.post(API_CONFIG.USER_SERVICE.endpoints.refreshToken, {
              refreshToken
            });
            
            const newAccessToken = response.data.data.accessToken;
            localStorage.setItem('accessToken', newAccessToken);
            
            // Retry original request with new token
            error.config.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient.request(error.config);
          } catch (refreshError) {
            // Refresh failed, logout user
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userData');
            window.location.href = '/login';
          }
        }
      }
      return Promise.reject(error);
    }
  );
};

// Apply interceptors
addAuthInterceptor(userApiClient);
addAuthInterceptor(mailApiClient);