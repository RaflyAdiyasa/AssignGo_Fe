// src/utils/constants.js - Updated to match backend status enum
export const AUTH_MODES = {
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT_PASSWORD: 'forgot_password',
  RESET_PASSWORD: 'reset_password'
};

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator'
};

export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  VERIFY_EMAIL: '/api/auth/verify-email',
  REFRESH_TOKEN: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
  USER_PROFILE: '/api/user/profile',
  NIMS: '/api/nims'
};

export const STORAGE_KEYS = {
  TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  REMEMBER_ME: 'rememberMe',
  LAST_LOGIN: 'lastLogin'
};

export const VALIDATION_RULES = {
  EMAIL: {
    REQUIRED: 'Email wajib diisi',
    INVALID: 'Format email tidak valid'
  },
  PASSWORD: {
    REQUIRED: 'Password wajib diisi',
    MIN_LENGTH: 'Password minimal 6 karakter',
    WEAK: 'Password terlalu lemah'
  },
  NAME: {
    REQUIRED: 'Nama wajib diisi',
    MIN_LENGTH: 'Nama minimal 2 karakter'
  },
  NIM: {
    REQUIRED: 'NIM wajib diisi',
    INVALID_FORMAT: 'Format NIM tidak valid',
    NOT_REGISTERED: 'NIM belum terdaftar dalam sistem',
    NOT_ACTIVE: 'NIM tidak aktif',
    ALREADY_EXISTS: 'NIM sudah terdaftar oleh user lain'
  },
  USERNAME: {
    REQUIRED: 'Username wajib diisi',
    MIN_LENGTH: 'Username minimal 3 karakter',
    INVALID_FORMAT: 'Username hanya boleh berisi huruf, angka, dan underscore',
    ALREADY_EXISTS: 'Username sudah digunakan'
  }
};

export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login berhasil!',
    REGISTER: 'Registrasi berhasil!',
    LOGOUT: 'Logout berhasil!',
    PASSWORD_RESET: 'Password berhasil direset!',
    EMAIL_SENT: 'Email verifikasi telah dikirim!'
  },
  ERROR: {
    LOGIN_FAILED: 'Login gagal. Periksa NIM dan password Anda.',
    REGISTER_FAILED: 'Registrasi gagal. Silakan coba lagi.',
    NETWORK_ERROR: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
    SERVER_ERROR: 'Terjadi kesalahan server. Silakan coba lagi.',
    INVALID_TOKEN: 'Token tidak valid atau sudah kedaluwarsa.',
    NIM_CHECK_FAILED: 'Gagal memverifikasi NIM. Silakan coba lagi.'
  }
};

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
  NIM: /^.+$/, // Updated: Accepts any non-empty string
  NIM_NUMERIC: /^\d+$/, // Helper: Only digits
  NIM_ALPHANUMERIC: /^[a-zA-Z0-9]+$/, // Helper: Letters and numbers only
  USERNAME: /^[a-zA-Z0-9_]{3,}$/, // Username: letters, numbers, underscore, min 3 chars
  PHONE: /^(\+62|62|0)8[1-9][0-9]{6,9}$/
};

export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

export const DEFAULT_CONFIG = {
  ENABLE_NIM_VALIDATION: false, // Updated: Disabled strict NIM validation
  ENABLE_EMAIL_VERIFICATION: false, // Updated: Disabled for easier testing
  ENABLE_REMEMBER_ME: true,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_TOKEN_THRESHOLD: 5 * 60 * 1000, // 5 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  NIM_MIN_LENGTH: 1, // Updated: Minimum 1 character
  NIM_MAX_LENGTH: 20, // Updated: Maximum 20 characters
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30
};

// SURAT (Mail/Letter) Status Constants - FIXED to match backend ENUM
export const SURAT_STATUS = {
  DIPROSES: 'diproses',    // Fixed: Match backend enum exactly
  DISETUJUI: 'disetujui',  // Fixed: Match backend enum exactly
  DITOLAK: 'ditolak'       // Fixed: Match backend enum exactly
};

// API Messages for different operations
export const API_MESSAGES = {
  SUCCESS: {
    LOGIN_SUCCESS: 'Login berhasil',
    LOGOUT_SUCCESS: 'Logout berhasil',
    USER_CREATED: 'User berhasil dibuat',
    CREATE: 'Data berhasil dibuat',
    UPDATE: 'Data berhasil diperbarui',
    DELETE: 'Data berhasil dihapus',
    FETCH: 'Data berhasil dimuat',
    APPROVE: 'Surat berhasil disetujui',
    REJECT: 'Surat berhasil ditolak',
    SUBMIT: 'Surat berhasil diajukan',
    UPLOAD: 'File berhasil diunggah'
  },
  ERROR: {
    LOGIN_FAILED: 'Login gagal',
    REGISTRATION_FAILED: 'Registrasi gagal',
    NIM_ALREADY_EXISTS: 'NIM sudah terdaftar oleh user lain',
    NIM_NOT_REGISTERED: 'NIM belum terdaftar dalam sistem',
    NIM_NOT_ACTIVE: 'NIM tidak aktif',
    USERNAME_EXISTS: 'Username sudah digunakan',
    INVALID_CREDENTIALS: 'NIM atau password salah',
    USER_NOT_FOUND: 'User tidak ditemukan',
    CREATE: 'Gagal membuat data',
    UPDATE: 'Gagal memperbarui data',
    DELETE: 'Gagal menghapus data',
    FETCH: 'Gagal memuat data',
    APPROVE: 'Gagal menyetujui surat',
    REJECT: 'Gagal menolak surat',
    SUBMIT: 'Gagal mengajukan surat',
    UPLOAD: 'Gagal mengunggah file',
    VALIDATION: 'Data tidak valid',
    PERMISSION: 'Akses ditolak',
    NOT_FOUND: 'Data tidak ditemukan'
  }
};

// Error Messages for error handling
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Terjadi kesalahan jaringan. Periksa koneksi internet Anda.',
  SERVER_ERROR: 'Terjadi kesalahan server. Silakan coba lagi nanti.',
  TIMEOUT_ERROR: 'Permintaan timeout. Silakan coba lagi.',
  UNAUTHORIZED: 'Sesi Anda telah berakhir. Silakan login kembali.',
  FORBIDDEN: 'Anda tidak memiliki akses untuk melakukan tindakan ini.',
  NOT_FOUND: 'Data yang diminta tidak ditemukan.',
  VALIDATION_ERROR: 'Data yang dimasukkan tidak valid.',
  FILE_TOO_LARGE: 'Ukuran file terlalu besar.',
  INVALID_FILE_TYPE: 'Tipe file tidak didukung.',
  UPLOAD_FAILED: 'Gagal mengunggah file.',
  DOWNLOAD_FAILED: 'Gagal mengunduh file.',
  DUPLICATE_ERROR: 'Data sudah ada.',
  QUOTA_EXCEEDED: 'Batas maksimum telah tercapai.',
  RATE_LIMIT: 'Terlalu banyak permintaan. Silakan tunggu sebentar.',
  MAINTENANCE: 'Sistem sedang dalam pemeliharaan.',
  UNKNOWN_ERROR: 'Terjadi kesalahan yang tidak diketahui.'
};

// Surat Types
export const SURAT_TYPES = {
  IZIN: 'izin',
  CUTI: 'cuti',
  SAKIT: 'sakit',
  TUGAS: 'tugas',
  PENELITIAN: 'penelitian',
  KEGIATAN: 'kegiatan',
  LAINNYA: 'lainnya'
};

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// File Types
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  DOCUMENTS: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
  SPREADSHEETS: ['xls', 'xlsx', 'csv'],
  PRESENTATIONS: ['ppt', 'pptx'],
  ARCHIVES: ['zip', 'rar', '7z']
};

// File Size Limits (in bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  ARCHIVE: 50 * 1024 * 1024 // 50MB
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD MMMM YYYY',
  INPUT: 'YYYY-MM-DD',
  DATETIME: 'DD MMMM YYYY HH:mm',
  TIME: 'HH:mm',
  API: 'YYYY-MM-DD HH:mm:ss'
};

// Status Colors for UI
export const STATUS_COLORS = {
  [SURAT_STATUS.DIPROSES]: 'yellow',    // Fixed: Match new status
  [SURAT_STATUS.DISETUJUI]: 'green',    // Fixed: Match new status
  [SURAT_STATUS.DITOLAK]: 'red'         // Fixed: Match new status
};

// Status Labels in Indonesian
export const STATUS_LABELS = {
  [SURAT_STATUS.DIPROSES]: 'Diproses',      // Fixed: Match new status
  [SURAT_STATUS.DISETUJUI]: 'Disetujui',    // Fixed: Match new status
  [SURAT_STATUS.DITOLAK]: 'Ditolak'         // Fixed: Match new status
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Modal Types
export const MODAL_TYPES = {
  CONFIRM: 'confirm',
  ALERT: 'alert',
  FORM: 'form',
  VIEW: 'view'
};

// NIM Validation Helpers
export const NIM_VALIDATION = {
  // Flexible validation function - accepts any format
  validate: (nim) => {
    if (!nim || nim.trim().length === 0) {
      return { valid: false, message: VALIDATION_RULES.NIM.REQUIRED };
    }
    
    const trimmedNim = nim.trim();
    
    // Check length
    if (trimmedNim.length < DEFAULT_CONFIG.NIM_MIN_LENGTH) {
      return { valid: false, message: `NIM minimal ${DEFAULT_CONFIG.NIM_MIN_LENGTH} karakter` };
    }
    
    if (trimmedNim.length > DEFAULT_CONFIG.NIM_MAX_LENGTH) {
      return { valid: false, message: `NIM maksimal ${DEFAULT_CONFIG.NIM_MAX_LENGTH} karakter` };
    }
    
    // No format restriction - accept any characters
    // Just check if it's not empty and within length limits
    return { valid: true, message: '' };
  },
  
  // Format NIM (remove extra spaces, etc.)
  format: (nim) => {
    if (!nim) return '';
    return nim.toString().trim().replace(/\s+/g, ' '); // Replace multiple spaces with single space
  },
  
  // Check if NIM is numeric (optional helper)
  isNumeric: (nim) => {
    return /^\d+$/.test(nim);
  },
  
  // Check if NIM is alphanumeric (optional helper)
  isAlphanumeric: (nim) => {
    return /^[a-zA-Z0-9]+$/.test(nim);
  }
};