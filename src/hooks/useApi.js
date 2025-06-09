// src/hooks/useApi.js
import { useState } from 'react';
import { handleApiError } from '../services/utils/errorHandler';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      setLoading(false);
      return result;
    } catch (err) {
      const errorResult = handleApiError(err);
      setError(errorResult);
      setLoading(false);
      return errorResult;
    }
  };

  const clearError = () => setError(null);

  return {
    loading,  
    error,
    callApi,
    clearError
  };
};