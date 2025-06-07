// src/utils/constants.js
export const SURAT_STATUS = {
  DIPROSES: 'diproses',
  DISETUJUI: 'disetujui',
  DITOLAK: 'ditolak'
};

export const SURAT_STATUS_LABELS = {
  [SURAT_STATUS.DIPROSES]: 'Sedang Diproses',
  [SURAT_STATUS.DISETUJUI]: 'Disetujui',
  [SURAT_STATUS.DITOLAK]: 'Ditolak'
};

export const SURAT_STATUS_COLORS = {
  [SURAT_STATUS.DIPROSES]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [SURAT_STATUS.DISETUJUI]: 'bg-green-100 text-green-800 border-green-200',
  [SURAT_STATUS.DITOLAK]: 'bg-red-100 text-red-800 border-red-200'
};

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  
  // User routes
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SURAT_LIST: '/surat',
  SURAT_CREATE: '/surat/create',
  SURAT_DETAIL: '/surat/:id',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_SURAT: '/admin/surat',
  ADMIN_STATS: '/admin/stats',
  
  // Error pages
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized'
};