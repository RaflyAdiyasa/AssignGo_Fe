// src/services/api/suratApi.js
import { mailApiClient, API_CONFIG } from '../../config/apiConfig';

export const suratApi = {
  // User functions
  createSurat: async (suratData) => {
    const response = await mailApiClient.post(API_CONFIG.MAIL_SERVICE.endpoints.createMail, suratData);
    return response.data;
  },

  getUserSurat: async (userId) => {
    const response = await mailApiClient.get(`${API_CONFIG.MAIL_SERVICE.endpoints.getUserMails}/${userId}`);
    return response.data;
  },

  getSuratDetail: async (suratId) => {
    const response = await mailApiClient.get(`${API_CONFIG.MAIL_SERVICE.endpoints.getMailDetail}/${suratId}`);
    return response.data;
  },

  getSuratHistory: async (suratId) => {
    const response = await mailApiClient.get(`${API_CONFIG.MAIL_SERVICE.endpoints.getMailHistory}/${suratId}/history`);
    return response.data;
  },

  // Admin functions
  getAllSurat: async () => {
    const response = await mailApiClient.get(API_CONFIG.MAIL_SERVICE.endpoints.getAllMails);
    return response.data;
  },

  updateSuratStatus: async (suratId, status, alasan = null) => {
    const response = await mailApiClient.put(`${API_CONFIG.MAIL_SERVICE.endpoints.updateMailStatus}/${suratId}/status`, {
      status,
      alasan
    });
    return response.data;
  },

  getSuratStats: async () => {
    const response = await mailApiClient.get(API_CONFIG.MAIL_SERVICE.endpoints.getMailStats);
    return response.data;
  }
};