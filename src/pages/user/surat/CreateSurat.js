// src/pages/user/surat/CreateSurat.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Link as LinkIcon, 
  Send, 
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { suratApi } from '../../../services/api/suratApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { handleApiError } from '../../../services/utils/errorHandler';

const CreateSurat = () => {
  const navigate = useNavigate();
  const { getUserId } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    subject_surat: '',
    url_file_surat: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Subject validation
    if (!formData.subject_surat.trim()) {
      newErrors.subject_surat = 'Subject surat wajib diisi';
    } else if (formData.subject_surat.trim().length < 5) {
      newErrors.subject_surat = 'Subject minimal 5 karakter';
    } else if (formData.subject_surat.trim().length > 200) {
      newErrors.subject_surat = 'Subject maksimal 200 karakter';
    }

    // URL validation
    if (!formData.url_file_surat.trim()) {
      newErrors.url_file_surat = 'URL file surat wajib diisi';
    } else {
      // Basic URL validation
      try {
        new URL(formData.url_file_surat);
      } catch {
        newErrors.url_file_surat = 'Format URL tidak valid';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ 
        text: 'Silakan perbaiki kesalahan pada form', 
        type: 'error' 
      });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID tidak ditemukan');
      }

      const payload = {
        id_pengirim: userId,
        subject_surat: formData.subject_surat.trim(),
        url_file_surat: formData.url_file_surat.trim()
      };

      const result = await suratApi.createSurat(payload);

      if (result.success) {
        setMessage({ 
          text: 'Surat berhasil diajukan!', 
          type: 'success' 
        });

        // Reset form
        setFormData({
          subject_surat: '',
          url_file_surat: ''
        });

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/surat');
        }, 2000);
      } else {
        throw new Error(result.message || 'Gagal mengajukan surat');
      }
    } catch (error) {
      console.error('Create surat error:', error);
      const errorResult = handleApiError(error);
      setMessage({ 
        text: errorResult.message, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    navigate(-1);
  };

  // Test URL function
  const testUrl = () => {
    if (formData.url_file_surat) {
      window.open(formData.url_file_surat, '_blank');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Buat Surat Tugas Baru</h1>
            <p className="text-gray-600">Ajukan permohonan surat tugas Anda</p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Petunjuk Pengajuan</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Pastikan file surat sudah di-upload ke Google Drive atau cloud storage</li>
              <li>• Salin URL/link file surat yang dapat diakses</li>
              <li>• Gunakan subject yang jelas dan deskriptif</li>
              <li>• Surat akan diproses oleh admin dalam 1-3 hari kerja</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <p className={`font-medium ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message.text}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Surat *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="subject_surat"
                value={formData.subject_surat}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.subject_surat 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
                placeholder="Contoh: Permohonan Izin Penelitian Tugas Akhir"
                disabled={loading}
              />
            </div>
            {errors.subject_surat && (
              <p className="mt-2 text-sm text-red-600">{errors.subject_surat}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.subject_surat.length}/200 karakter
            </p>
          </div>

          {/* URL Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL File Surat *
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="url"
                name="url_file_surat"
                value={formData.url_file_surat}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.url_file_surat 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
                placeholder="https://drive.google.com/file/d/... atau https://..."
                disabled={loading}
              />
              {formData.url_file_surat && (
                <button
                  type="button"
                  onClick={testUrl}
                  className="absolute right-3 top-3 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Test URL"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
            </div>
            {errors.url_file_surat && (
              <p className="mt-2 text-sm text-red-600">{errors.url_file_surat}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Pastikan URL dapat diakses oleh admin untuk review
            </p>
          </div>

          {/* Example URLs */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Contoh format URL yang didukung:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Google Drive: https://drive.google.com/file/d/1ABC.../view</li>
              <li>• Dropbox: https://www.dropbox.com/s/abc123/document.pdf</li>
              <li>• OneDrive: https://1drv.ms/b/s!ABC123...</li>
              <li>• URL langsung: https://example.com/document.pdf</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !formData.subject_surat.trim() || !formData.url_file_surat.trim()}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Ajukan Surat</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSurat;