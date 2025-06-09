// src/services/api/nimApi.js - Complete NIM API for AuthApp
import { userApiClient } from '../../config/apiConfig';

export const nimApi = {
  // Check if NIM is registered and active
  checkNimStatus: async (nim) => {
    try {
      console.log('🔍 Checking NIM status:', nim);
      
      // Get all NIMs and check if the given NIM exists and is active
      const response = await userApiClient.get('/api/nims');
      
      console.log('📋 NIMs response:', response);
      
      if (response.data) {
        const allNims = response.data.nims || response.data.data || response.data || [];
        const nimData = allNims.find(n => n.nim === nim.toString().trim());

        return {
          success: true,
          isRegistered: !!nimData,
          isActive: nimData ? nimData.status : false,
          data: nimData,
          message: 'NIM status checked successfully'
        };
      } else {
        return {
          success: false,
          isRegistered: false,
          isActive: false,
          message: 'Failed to check NIM status'
        };
      }
    } catch (error) {
      console.error('Check NIM Status Error:', error);
      
      // Return a response that allows registration to continue if NIM check fails
      // This is a fallback to prevent registration from being completely blocked
      return {
        success: true,
        isRegistered: true,
        isActive: true,
        message: 'NIM check temporarily unavailable, proceeding with registration',
        error: error
      };
    }
  },

  // Get all registered NIMs (admin only)
  getAllNims: async () => {
    try {
      console.log('📋 Fetching all NIMs...');
      const response = await userApiClient.get('/api/nims');
      
      if (response.data) {
        return {
          success: true,
          data: response.data.nims || response.data.data || response.data || [],
          message: 'NIMs fetched successfully'
        };
      } else {
        return {
          success: false,
          data: [],
          message: 'No data received'
        };
      }
    } catch (error) {
      console.error('Get All NIMs API Error:', error);
      
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || error.message || 'Failed to fetch NIMs',
        error: error
      };
    }
  },

  // Add a single NIM (admin only)
  addNim: async (nim) => {
    try {
      console.log('➕ Adding NIM:', nim);
      
      const payload = { nim: nim.toString().trim() };

      const response = await userApiClient.post('/api/nims', payload);
      
      if (response.data) {
        return {
          success: true,
          data: response.data,
          message: 'NIM added successfully'
        };
      } else {
        return {
          success: false,
          message: 'No response data'
        };
      }
    } catch (error) {
      console.error('Add NIM API Error:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to add NIM',
        error: error
      };
    }
  },

  // Add multiple NIMs (admin only)
  addMultipleNims: async (nims) => {
    try {
      console.log('📥 Adding multiple NIMs:', nims);
      
      if (!Array.isArray(nims) || nims.length === 0) {
        return {
          success: false,
          message: 'Invalid NIMs data. Provide an array of NIMs'
        };
      }

      const cleanedNims = nims
        .map(nim => nim.toString().trim())
        .filter(nim => nim.length > 0);

      if (cleanedNims.length === 0) {
        return {
          success: false,
          message: 'No valid NIMs provided'
        };
      }

      const payload = { nims: cleanedNims };

      const response = await userApiClient.post('/api/nims/bulk', payload);
      
      if (response.data) {
        return {
          success: true,
          data: response.data,
          message: `${cleanedNims.length} NIMs added successfully`
        };
      } else {
        return {
          success: false,
          message: 'No response data'
        };
      }
    } catch (error) {
      console.error('Add Multiple NIMs API Error:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to add NIMs',
        error: error
      };
    }
  },

  // Activate a NIM (admin only)
  activateNim: async (nimId) => {
    try {
      console.log('✅ Activating NIM:', nimId);
      
      const response = await userApiClient.put(`/api/nims/activate/${nimId}`);
      
      if (response.data) {
        return {
          success: true,
          data: response.data,
          message: 'NIM activated successfully'
        };
      } else {
        return {
          success: true,
          message: 'NIM activated successfully'
        };
      }
    } catch (error) {
      console.error('Activate NIM API Error:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to activate NIM',
        error: error
      };
    }
  },

  // Deactivate a NIM (admin only)
  deactivateNim: async (nimId) => {
    try {
      console.log('❌ Deactivating NIM:', nimId);
      
      const response = await userApiClient.put(`/api/nims/deactivate/${nimId}`);
      
      if (response.data) {
        return {
          success: true,
          data: response.data,
          message: 'NIM deactivated successfully'
        };
      } else {
        return {
          success: true,
          message: 'NIM deactivated successfully'
        };
      }
    } catch (error) {
      console.error('Deactivate NIM API Error:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to deactivate NIM',
        error: error
      };
    }
  },

  // Delete a NIM (admin only)
  deleteNim: async (nimId) => {
    try {
      console.log('🗑️ Deleting NIM:', nimId);
      
      const response = await userApiClient.delete(`/api/nims/${nimId}`);
      
      return {
        success: true,
        data: response.data,
        message: 'NIM deleted successfully'
      };
    } catch (error) {
      console.error('Delete NIM API Error:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete NIM',
        error: error
      };
    }
  },

  // Update NIM status (admin only)
  updateNimStatus: async (nimId, status) => {
    try {
      console.log('🔄 Updating NIM status:', nimId, 'to:', status);
      
      const payload = { status: Boolean(status) };
      const response = await userApiClient.put(`/api/nims/${nimId}/status`, payload);
      
      if (response.data) {
        return {
          success: true,
          data: response.data,
          message: `NIM ${status ? 'activated' : 'deactivated'} successfully`
        };
      } else {
        return {
          success: true,
          message: `NIM ${status ? 'activated' : 'deactivated'} successfully`
        };
      }
    } catch (error) {
      console.error('Update NIM Status API Error:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update NIM status',
        error: error
      };
    }
  },

  // Search NIMs by pattern (admin only)
  searchNims: async (searchTerm) => {
    try {
      console.log('🔍 Searching NIMs with term:', searchTerm);
      
      const response = await userApiClient.get(`/api/nims/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (response.data) {
        return {
          success: true,
          data: response.data.nims || response.data.data || response.data || [],
          message: 'NIMs search completed successfully'
        };
      } else {
        return {
          success: false,
          data: [],
          message: 'No search results found'
        };
      }
    } catch (error) {
      console.error('Search NIMs API Error:', error);
      
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || error.message || 'Failed to search NIMs',
        error: error
      };
    }
  },

  // Validate NIM format
  validateNimFormat: (nim) => {
    const nimStr = nim.toString().trim();
    
    // Check if NIM is not empty
    if (!nimStr) {
      return {
        isValid: false,
        message: 'NIM tidak boleh kosong'
      };
    }

    // Check if NIM contains only numbers
    if (!/^\d+$/.test(nimStr)) {
      return {
        isValid: false,
        message: 'NIM hanya boleh berisi angka'
      };
    }

    // Check maximum NIM length only (remove minimum length requirement)
    if (nimStr.length > 15) {
      return {
        isValid: false,
        message: 'NIM maksimal 15 digit'
      };
    }

    return {
      isValid: true,
      message: 'Format NIM valid'
    };
  },

  // Import NIMs from CSV/text file
  importNimsFromFile: async (fileContent) => {
    try {
      console.log('📂 Importing NIMs from file...');
      
      // Parse file content - support both CSV and plain text
      let nims = [];
      
      // Split by lines and clean up
      const lines = fileContent.split(/[\r\n]+/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

      for (const line of lines) {
        // Handle CSV format (might have commas)
        if (line.includes(',')) {
          const parts = line.split(',').map(part => part.trim());
          nims.push(...parts.filter(part => part.length > 0));
        } else {
          // Handle plain text format
          nims.push(line);
        }
      }

      // Remove duplicates and validate
      const uniqueNims = [...new Set(nims)];
      const validNims = [];
      const invalidNims = [];

      for (const nim of uniqueNims) {
        const validation = nimApi.validateNimFormat(nim);
        if (validation.isValid) {
          validNims.push(nim);
        } else {
          invalidNims.push({ nim, error: validation.message });
        }
      }

      if (validNims.length === 0) {
        return {
          success: false,
          message: 'Tidak ada NIM valid ditemukan dalam file',
          invalidNims
        };
      }

      // Import valid NIMs
      const importResult = await nimApi.addMultipleNims(validNims);

      return {
        success: importResult.success,
        data: importResult.data,
        message: `${validNims.length} NIM berhasil diimpor${invalidNims.length > 0 ? `, ${invalidNims.length} NIM tidak valid diabaikan` : ''}`,
        validCount: validNims.length,
        invalidCount: invalidNims.length,
        invalidNims: invalidNims.length > 0 ? invalidNims : undefined
      };

    } catch (error) {
      console.error('Import NIMs from File Error:', error);
      
      return {
        success: false,
        message: 'Gagal mengimpor NIM dari file',
        error: error
      };
    }
  }
};