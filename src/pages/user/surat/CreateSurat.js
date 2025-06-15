// src/pages/user/surat/CreateSurat.js - Complete Fixed Version
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
import { suratApi } from '../../../services/api/suratApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { handleApiError } from '../../../services/utils/errorHandler';

const CreateSurat = () => {
  const navigate = useNavigate();
  const { getUserId, getToken, user } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    subject_surat: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isDragOver, setIsDragOver] = useState(false);

  // File upload progress
  const [uploadProgress, setUploadProgress] = useState(0);

  // API Base URL
  const API_BASE_URL = 'https://assigngo-mail-424905547173.us-central1.run.app/api';

  // Handle back button
  const handleBack = () => {
    navigate(-1);
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

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  // Format file size utility
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 1. IMPROVED FILE HANDLING FUNCTIONS
  const validateFile = (file) => {
    console.log('🔍 Validating file:', file);
    
    if (!file) {
      return { valid: false, message: 'File wajib dipilih' };
    }
    
    // Check if it's actually a File object - using safer method
    if (!file || typeof file !== 'object' || !file.name || !file.size === undefined) {
      console.error('❌ Not a File object:', file);
      return { valid: false, message: 'Object bukan File yang valid' };
    }
    
    // Additional check for File-like properties
    if (!file.name || typeof file.size !== 'number' || !file.type) {
      console.error('❌ Missing File properties:', file);
      return { valid: false, message: 'File tidak memiliki properti yang valid' };
    }
    
    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, message: 'File terlalu besar. Maksimal 5MB' };
    }
    
    if (file.size === 0) {
      return { valid: false, message: 'File kosong atau rusak' };
    }
    
    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg', 
      'image/png'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ Invalid file type:', file.type);
      return { 
        valid: false, 
        message: 'Format file tidak didukung. Gunakan PDF, DOC, DOCX, JPG, atau PNG' 
      };
    }
    
    console.log('✅ File validation passed');
    return { valid: true };
  };

  // 2. IMPROVED FILE CHANGE HANDLER
  const handleFileChange = (e) => {
    console.log('📁 File input changed');
    
    const file = e.target.files[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }
    
    console.log('📎 File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      constructor: file.constructor?.name || 'unknown',
      isFileType: file.constructor?.name === 'File' || file.toString() === '[object File]',
      hasFileProperties: !!(file.name && typeof file.size === 'number' && file.type)
    });
    
    // Validate file immediately
    const validation = validateFile(file);
    if (!validation.valid) {
      setErrors(prev => ({ ...prev, file: validation.message }));
      setSelectedFile(null);
      return;
    }
    
    // Clear errors and set file
    setErrors(prev => ({ ...prev, file: '' }));
    setSelectedFile(file);
    
    console.log('✅ File set successfully in state');
  };

  // 3. IMPROVED DRAG AND DROP HANDLER
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    console.log('📁 File dropped');
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (!file) {
      console.log('❌ No file in drop event');
      return;
    }
    
    console.log('📎 File dropped:', {
      name: file.name,
      size: file.size,
      type: file.type,
      constructor: file.constructor?.name || 'unknown',
      isFileType: file.constructor?.name === 'File' || file.toString() === '[object File]',
      hasFileProperties: !!(file.name && typeof file.size === 'number' && file.type)
    });
    
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setErrors(prev => ({ ...prev, file: validation.message }));
      setSelectedFile(null);
      return;
    }
    
    // Clear errors and set file
    setErrors(prev => ({ ...prev, file: '' }));
    setSelectedFile(file);
    
    console.log('✅ Dropped file set successfully in state');
  };

  // 4. COMPREHENSIVE DEBUG FUNCTION
  const debugFileUpload = (file, formData = null) => {
    console.log('=== COMPREHENSIVE FILE DEBUG ===');
    
    // Debug file object
    if (file) {
      console.log('📁 File Object Analysis:');
      console.log('  - Name:', file.name);
      console.log('  - Size:', file.size);
      console.log('  - Type:', file.type);
      console.log('  - LastModified:', file.lastModified);
      console.log('  - Constructor:', file.constructor?.name || 'unknown');
      console.log('  - Is File-like:', !!(file.name && typeof file.size === 'number' && file.type));
      console.log('  - toString():', file.toString());
      console.log('  - Has stream method:', typeof file.stream === 'function');
      console.log('  - Has arrayBuffer method:', typeof file.arrayBuffer === 'function');
      
      // Test file reading capabilities
      try {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          console.log('  - FileReader test: SUCCESS');
        };
        fileReader.onerror = () => {
          console.log('  - FileReader test: FAILED');
        };
        fileReader.readAsArrayBuffer(file.slice(0, 100)); // Test with small chunk
      } catch (error) {
        console.log('  - FileReader test: ERROR -', error.message);
      }
    } else {
      console.log('❌ No file provided to debug');
    }
    
    // Debug FormData if provided
    if (formData) {
      console.log('📦 FormData Analysis:');
      console.log('  - Has entries method:', typeof formData.entries === 'function');
      console.log('  - Has file_surat field:', formData.has('file_surat'));
      
      try {
        for (let [key, value] of formData.entries()) {
          if (value && typeof value === 'object' && value.name && typeof value.size === 'number') {
            console.log(`  - ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
          } else {
            console.log(`  - ${key}: ${value}`);
          }
        }
      } catch (error) {
        console.log('  - FormData iteration error:', error.message);
      }
    }
    
    console.log('=== END DEBUG ===');
  };

  // 5. IMPROVED API CALL FUNCTION
  const createSuratAPI = async (subjectSurat, file) => {
    console.log('🚀 Starting API call...');
    console.log('📋 Subject:', subjectSurat);
    console.log('📎 File before API call:', file ? {
      name: file.name,
      size: file.size,
      type: file.type,
      isFileType: file.constructor?.name === 'File' || file.toString() === '[object File]',
      hasFileProperties: !!(file.name && typeof file.size === 'number' && file.type)
    } : 'NO FILE');
    
    // Final file validation before API call - using safer checks
    if (!file) {
      throw new Error('File tidak ditemukan saat akan dikirim ke API');
    }
    
    // Check if file has required properties instead of instanceof
    if (!file.name || typeof file.size !== 'number' || !file.type) {
      throw new Error('Object bukan File yang valid saat akan dikirim ke API');
    }
    
    if (file.size === 0) {
      throw new Error('File kosong atau rusak saat akan dikirim ke API');
    }
    
    // Debug file before creating FormData
    debugFileUpload(file);
    
    try {
      // Try using existing suratApi first
      console.log('🔄 Attempting suratApi.createSurat...');
      
      const result = await suratApi.createSurat({
        subject_surat: subjectSurat.trim()
      }, file);
      
      console.log('✅ suratApi.createSurat succeeded:', result);
      return result;
      
    } catch (apiError) {
      console.log('⚠️ suratApi failed, trying fallback approach...');
      console.error('API Error details:', apiError);
      
      // Fallback to direct fetch API dengan debugging ekstra
      const token = getToken();
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }
      
      // Create FormData with extra care dan berbagai field name untuk test
      const formDataPayload = new FormData();
      
      // Add subject
      formDataPayload.append('subject_surat', subjectSurat.trim());
      
      // Try multiple field names for compatibility
      formDataPayload.append('file_surat', file, file.name);
      formDataPayload.append('file', file, file.name); // Alternative field name
      formDataPayload.append('upload', file, file.name); // Another alternative
      
      // Debug FormData after creation
      debugFileUpload(file, formDataPayload);
      
      // Verify FormData contents
      console.log('📦 Final FormData verification:');
      let hasFile = false;
      let hasSubject = false;
      
      for (let [key, value] of formDataPayload.entries()) {
        console.log(`  - ${key}:`, value && typeof value === 'object' && value.name ? `File(${value.name})` : value);
        if ((key === 'file_surat' || key === 'file' || key === 'upload') && value && value.name && typeof value.size === 'number') hasFile = true;
        if (key === 'subject_surat') hasSubject = true;
      }
      
      console.log('  - Has valid file:', hasFile);
      console.log('  - Has valid subject:', hasSubject);
      
      if (!hasFile) {
        throw new Error('File tidak berhasil ditambahkan ke FormData');
      }
      
      if (!hasSubject) {
        throw new Error('Subject tidak berhasil ditambahkan ke FormData');
      }
      
      // Make API request
      console.log('📡 Making fetch request to:', API_BASE_URL + '/mails');
      
      const response = await fetch(API_BASE_URL + '/mails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          // DO NOT set Content-Type for multipart/form-data - let browser handle it
        },
        body: formDataPayload
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Parse response
      let result;
      try {
        result = await response.json();
        console.log('📡 Response data:', result);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        const textResponse = await response.text();
        console.log('📡 Raw response:', textResponse);
        throw new Error('Server returned invalid JSON response');
      }
      
      if (!response.ok) {
        console.error('❌ API request failed with status:', response.status);
        throw new Error(result?.message || result?.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return result;
    }
  };

  // 6. IMPROVED FORM VALIDATION
  const validateForm = () => {
    console.log('🔍 Validating form...');
    console.log('📋 Current formData:', formData);
    console.log('📎 Current selectedFile:', selectedFile);
    
    const newErrors = {};

    // Subject validation
    if (!formData.subject_surat?.trim()) {
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
      const fileValidation = validateFile(selectedFile);
      if (!fileValidation.valid) {
        newErrors.file = fileValidation.message;
      }
    }

    console.log('🔍 Validation errors:', newErrors);
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 7. IMPROVED SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 Form submitted');
    console.log('📋 Form data at submit:', formData);
    console.log('📎 Selected file at submit:', selectedFile);
    
    // Validate form
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      setMessage({ 
        text: 'Silakan perbaiki kesalahan pada form', 
        type: 'error' 
      });
      return;
    }
    
    // Double-check file exists and is valid - using safer checks
    if (!selectedFile) {
      console.error('❌ No file selected at submit time');
      setMessage({ 
        text: 'File tidak ditemukan. Silakan pilih file lagi.', 
        type: 'error' 
      });
      return;
    }
    
    // Check if file has required properties instead of instanceof
    if (!selectedFile.name || typeof selectedFile.size !== 'number' || !selectedFile.type) {
      console.error('❌ Selected file is not valid:', selectedFile);
      setMessage({ 
        text: 'File tidak valid. Silakan pilih file lagi.', 
        type: 'error' 
      });
      return;
    }
    
    setLoading(true);
    setUploading(true);
    setUploadProgress(0);
    setMessage({ text: '', type: '' });

    try {
      const userId = getUserId();
      console.log('👤 User ID:', userId);
      
      // Final debug before API call
      console.log('🔍 Final pre-API debug:');
      console.log('  - Subject:', formData.subject_surat);
      console.log('  - File name:', selectedFile.name);
      console.log('  - File size:', selectedFile.size);
      console.log('  - File type:', selectedFile.type);
      console.log('  - File instanceof File:', selectedFile.constructor?.name === 'File');
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 90) return prev + 10;
          return prev;
        });
      }, 200);

      // Call API with current file reference
      console.log('🚀 Calling API...');
      const result = await createSuratAPI(formData.subject_surat.trim(), selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('✅ API call completed:', result);

      // Check success conditions
      const isSuccess = result && (
        result.success === true || 
        result.status === 'success' || 
        result.message?.includes('berhasil') || 
        result.message?.includes('successfully') || 
        result.mail
      );
      
      if (isSuccess) {
        setMessage({ 
          text: 'Surat berhasil diajukan! Anda akan diarahkan ke halaman surat.', 
          type: 'success' 
        });

        // Reset form
        setFormData({ subject_surat: '' });
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
        throw new Error(result?.message || result?.error || 'Gagal mengajukan surat - response tidak dikenal');
      }

    } catch (error) {
      console.error('❌ Submit error:', error);
      
      setUploadProgress(0);
      
      // Handle specific error messages
      let errorMessage = 'Gagal mengajukan surat';
      
      if (error.message?.includes('No file uploaded') || error.message?.includes('no file')) {
        errorMessage = 'File tidak terdeteksi di server. Pastikan file telah dipilih dengan benar dan coba lagi.';
        // Reset file selection to force re-selection
        setSelectedFile(null);
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
          fileInput.value = '';
        }
      } else if (error.message?.includes('Token tidak ditemukan')) {
        errorMessage = 'Sesi berakhir. Silakan login ulang.';
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.message?.includes('File terlalu besar')) {
        errorMessage = 'File terlalu besar. Maksimal 5MB.';
      } else if (error.message?.includes('Format file')) {
        errorMessage = 'Format file tidak didukung. Gunakan PDF, DOC, DOCX, JPG, atau PNG.';
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Koneksi bermasalah. Periksa koneksi internet Anda.';
      } else {
        errorMessage = error.message || 'Terjadi kesalahan tidak terduga';
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

  // 8. ENHANCED DEBUG FUNCTION FOR DEVELOPMENT
  const debugFile = () => {
    if (selectedFile) {
      console.log('🔍 === MANUAL FILE DEBUG ===');
      debugFileUpload(selectedFile);
      
      // Test FormData creation
      const testFormData = new FormData();
      testFormData.append('file_surat', selectedFile, selectedFile.name);
      testFormData.append('subject_surat', 'test subject');
      
      console.log('🧪 Test FormData creation:');
      debugFileUpload(selectedFile, testFormData);
      
      // Test file reading
      if (selectedFile.size > 0) {
        const reader = new FileReader();
        reader.onload = () => {
          console.log('✅ File readable - first 100 chars:', 
            reader.result.toString().substring(0, 100));
        };
        reader.onerror = () => {
          console.error('❌ File not readable');
        };
        reader.readAsText(selectedFile.slice(0, 100));
      }
    } else {
      console.log('❌ No file selected to debug');
    }
  };

  // 9. REMOVE FILE FUNCTION
  const removeFile = () => {
    console.log('🗑️ Removing file');
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
                  errors.file 
                    ? 'border-red-300 bg-red-50' 
                    : isDragOver 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
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
                        style={{ width: uploadProgress + '%' }}
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