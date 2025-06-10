// src/pages/user/surat/CreateSurat.js - Fixed to match backend API
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Upload,
  Send, 
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  X,
  File,
  Cloud,
  Loader
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const CreateSurat = () => {
  const navigate = useNavigate();
  const { getToken, user } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    subject_surat: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });

  // File upload progress
  const [uploadProgress, setUploadProgress] = useState(0);

  // API Base URL
  const API_BASE_URL = 'https://assigngo-mail-424905547173.us-central1.run.app/api';

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

    // File validation
    if (!selectedFile) {
      newErrors.file = 'File surat wajib dipilih';
    } else {
      // File size validation (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        newErrors.file = 'Ukuran file tidak boleh lebih dari 5MB';
      }
      
      // File type validation
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/jpg'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        newErrors.file = 'Format file tidak didukung. Gunakan PDF, DOC, DOCX, JPG, atau PNG';
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

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('📎 File selected:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      setSelectedFile(file);
      
      // Clear file error when file is selected
      if (errors.file) {
        setErrors(prev => ({
          ...prev,
          file: ''
        }));
      }
    }
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.value = '';
    }
    
    // Clear any file-related errors
    if (errors.file) {
      setErrors(prev => ({
        ...prev,
        file: ''
      }));
    }
  };

  // FIXED: API call function sesuai dokumentasi backend
  const createSuratAPI = async (subjectSurat, file) => {
    const token = getToken();
    
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }

    // Buat FormData sesuai format backend
    const formData = new FormData();
    formData.append('subject_surat', subjectSurat);
    formData.append('file_surat', file, file.name);

    // Debug FormData
    console.log('📦 FormData being sent:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    // Kirim request ke backend
    const response = await fetch(`${API_BASE_URL}/mails`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // JANGAN set Content-Type untuk FormData, biarkan browser yang set
      },
      body: formData
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    // Parse response
    const result = await response.json();
    console.log('📡 Response data:', result);

    if (!response.ok) {
      throw new Error(result.message || result.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return result;
  };

  // Handle form submit - FIXED VERSION
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 Submitting surat form...');
    
    if (!validateForm()) {
      setMessage({ 
        text: 'Silakan perbaiki kesalahan pada form', 
        type: 'error' 
      });
      return;
    }

    setLoading(true);
    setUploading(true);
    setUploadProgress(0);
    setMessage({ text: '', type: '' });

    try {
      console.log('📋 Form data:', formData);
      console.log('📎 Selected file:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });

      // Pastikan file valid
      if (!selectedFile || selectedFile.size === 0) {
        throw new Error('File tidak valid atau kosong');
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 200);

      // Call API
      console.log('🚀 Calling backend API...');
      const result = await createSuratAPI(formData.subject_surat.trim(), selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('✅ API Response:', result);

      // Check if request was successful
      if (result) {
        setMessage({ 
          text: 'Surat berhasil diajukan! Anda akan diarahkan ke halaman surat.', 
          type: 'success' 
        });

        // Reset form
        setFormData({
          subject_surat: ''
        });
        setSelectedFile(null);
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
          fileInput.value = '';
        }

        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/surat');
        }, 3000);
      } else {
        throw new Error('Respon tidak valid dari server');
      }

    } catch (error) {
      console.error('❌ Create surat error:', error);
      
      setUploadProgress(0);
      
      let errorMessage = error.message || 'Terjadi kesalahan tidak dikenal';
      
      // Handle specific error cases
      if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Koneksi bermasalah. Periksa koneksi internet Anda.';
      } else if (error.message?.includes('413')) {
        errorMessage = 'File terlalu besar. Maksimal 5MB.';
      } else if (error.message?.includes('415')) {
        errorMessage = 'Format file tidak didukung.';
      } else if (error.message?.includes('400')) {
        errorMessage = 'Data tidak valid. Periksa form Anda.';
      } else if (error.message?.includes('401')) {
        errorMessage = 'Sesi Anda telah berakhir. Silakan login ulang.';
      } else if (error.message?.includes('500')) {
        errorMessage = 'Terjadi kesalahan server. Coba lagi nanti.';
      } else if (error.message?.includes('Token tidak ditemukan')) {
        errorMessage = 'Sesi berakhir. Silakan login ulang.';
        // Optionally redirect to login
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
      
      setMessage({ 
        text: errorMessage, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    navigate(-1);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      console.log('📎 File dropped:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      setSelectedFile(file);
      
      // Clear file error when file is dropped
      if (errors.file) {
        setErrors(prev => ({
          ...prev,
          file: ''
        }));
      }
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Debug function for development
  const debugFile = () => {
    if (selectedFile) {
      console.log('🔍 Debug selected file:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        lastModified: selectedFile.lastModified,
        lastModifiedDate: selectedFile.lastModifiedDate,
        constructor: selectedFile.constructor.name,
        isFile: selectedFile instanceof File,
        isBlob: selectedFile instanceof Blob
      });
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
            <p className="text-gray-600">
              Ajukan permohonan surat tugas Anda. Surat akan diproses oleh admin.
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Informasi Pengirim</h3>
            <p className="text-sm text-blue-800">
              <strong>Nama:</strong> {user?.username || 'Unknown'} | 
              <strong> NIM:</strong> {user?.nim || 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-900 mb-1">Petunjuk Pengajuan</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Upload file surat dalam format PDF, DOC, DOCX, JPG, atau PNG</li>
              <li>• Ukuran file maksimal 5MB</li>
              <li>• Gunakan subject yang jelas dan deskriptif</li>
              <li>• File akan di-upload ke cloud storage secara otomatis</li>
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

          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Surat *
            </label>
            
            {!selectedFile ? (
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  errors.file ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-input"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={loading}
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    Klik untuk memilih file atau drag & drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, JPG, PNG (Maksimal 5MB)
                  </p>
                </label>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <File className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(selectedFile.size)} | {selectedFile.type}
                      </p>
                      {process.env.NODE_ENV === 'development' && (
                        <button
                          type="button"
                          onClick={debugFile}
                          className="text-xs text-blue-600 hover:underline mt-1"
                        >
                          Debug File Info
                        </button>
                      )}
                    </div>
                  </div>
                  {!loading && (
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                {/* Upload Progress */}
                {uploading && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Mengupload...</span>
                      <span className="text-blue-600">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {errors.file && (
              <p className="mt-2 text-sm text-red-600">{errors.file}</p>
            )}
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
              disabled={loading || !formData.subject_surat.trim() || !selectedFile}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : uploading ? (
                <>
                  <Cloud className="w-5 h-5" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Ajukan Surat</span>
                </>
              )}
            </button>
          </div>

          {/* Loading State Info */}
          {loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Sedang memproses pengajuan surat...
                  </p>
                  <p className="text-xs text-blue-700">
                    Harap tunggu, jangan refresh halaman.
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateSurat;