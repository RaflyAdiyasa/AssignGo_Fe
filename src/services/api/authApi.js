import { userApiClient, API_CONFIG } from '../../config/apiConfig';

export const authApi = {
  login: async (nim, password) => {
    const response = await userApiClient.post(API_CONFIG.USER_SERVICE.endpoints.login, {
      nim,
      password
    });
    return response.data;
  },

  register: async (nim, username, password, isAdmin = false) => {
    const response = await userApiClient.post(API_CONFIG.USER_SERVICE.endpoints.register, {
      nim,
      username,
      password,
      isAdmin
    });
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await userApiClient.post(API_CONFIG.USER_SERVICE.endpoints.refreshToken, {
      refreshToken
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await userApiClient.get(API_CONFIG.USER_SERVICE.endpoints.profile);
    return response.data;
  },

  updateProfile: async (updateData) => {
    const response = await userApiClient.put(API_CONFIG.USER_SERVICE.endpoints.updateProfile, updateData);
    return response.data;
  }
};
