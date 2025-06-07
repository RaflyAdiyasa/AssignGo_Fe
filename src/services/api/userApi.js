// src/services/api/userApi.js
import { userApiClient, API_CONFIG } from '../../config/apiConfig';

export const userApi = {
  getAllUsers: async () => {
    const response = await userApiClient.get(API_CONFIG.USER_SERVICE.endpoints.getAllUsers);
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await userApiClient.get(`${API_CONFIG.USER_SERVICE.endpoints.getUserById}/${userId}`);
    return response.data;
  }
};