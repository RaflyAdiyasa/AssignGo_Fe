// src/config/menuItems.js - Fixed structure and added NIM Management
import { 
  Home, 
  FileText, 
  Plus, 
  User, 
  Settings,
  Users,
  CheckSquare,
  BarChart3,
  Shield,
  Mail,
  Hash,
  Database,
  UserCheck,
  PlusCircle,
  Edit,
  Trash2
} from 'lucide-react';

// User Menu Items
export const userMenuItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: Home,
    description: 'Halaman utama dan ringkasan'
  },
  {
    label: 'Surat Saya',
    path: '/surat',
    icon: FileText,
    badge: null, // Will be populated with count
    description: 'Daftar semua surat yang saya buat'
  },
  {
    label: 'Buat Surat Baru',
    path: '/surat/create',
    icon: Plus,
    description: 'Membuat surat tugas baru'
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: User,
    description: 'Pengaturan profil pengguna'
  },
  {
    label: 'Pengaturan',
    path: '/settings',
    icon: Settings,
    description: 'Pengaturan aplikasi'
  }
];

// Admin Menu Items - Fixed structure to match user menu
export const adminMenuItems = [
  {
    label: 'Dashboard Admin',
    path: '/admin/dashboard',
    icon: Home,
    description: 'Dashboard administratif'
  },
  {
    label: 'Kelola User',
    path: '/admin/users',
    icon: Users,
    badge: null, // Will be populated with user count
    description: 'Manajemen pengguna sistem'
  },
  {
    label: 'Kelola NIM',
    path: '/admin/nim-management',
    icon: Hash,
    badge: null, // Will be populated with NIM count
    description: 'Manajemen database NIM mahasiswa'
  },
  {
    label: 'Kelola Surat',
    path: '/admin/surat',
    icon: Mail,
    badge: null, // Will be populated with mail count
    description: 'Manajemen semua surat dalam sistem'
  },
  {
    label: 'Persetujuan Surat',
    path: '/admin/approval',
    icon: CheckSquare,
    badge: null, // Will be populated with pending approvals
    description: 'Approve atau tolak surat masuk'
  },
  {
    label: 'Statistik & Laporan',
    path: '/admin/reports',
    icon: BarChart3,
    description: 'Laporan dan analisis sistem'
  },
  {
    label: 'Pengaturan Sistem',
    path: '/admin/settings',
    icon: Settings,
    description: 'Konfigurasi sistem global'
  }
];

// Sub-menu items for NIM Management (for nested navigation if needed)
export const nimManagementSubItems = [
  {
    label: 'Daftar NIM',
    path: '/admin/nim-management',
    icon: Database,
    description: 'Lihat semua NIM terdaftar'
  },
  {
    label: 'Tambah NIM',
    path: '/admin/nim-management/add',
    icon: PlusCircle,
    description: 'Tambah NIM baru'
  },
  {
    label: 'Import NIM',
    path: '/admin/nim-management/import',
    icon: Plus,
    description: 'Import NIM dari file'
  },
  {
    label: 'Validasi NIM',
    path: '/admin/nim-management/validate',
    icon: UserCheck,
    description: 'Validasi status NIM'
  }
];

// Quick action items for dashboard
export const quickActionItems = {
  user: [
    {
      label: 'Buat Surat Baru',
      path: '/surat/create',
      icon: PlusCircle,
      color: 'blue',
      description: 'Membuat surat tugas baru'
    },
    {
      label: 'Lihat Surat Saya',
      path: '/surat',
      icon: FileText,
      color: 'green',
      description: 'Lihat semua surat saya'
    },
    {
      label: 'Update Profile',
      path: '/profile',
      icon: User,
      color: 'purple',
      description: 'Perbarui informasi profil'
    }
  ],
  admin: [
    {
      label: 'Kelola User',
      path: '/admin/users',
      icon: Users,
      color: 'blue',
      description: 'Manajemen pengguna'
    },
    {
      label: 'Kelola NIM',
      path: '/admin/nim-management',
      icon: Hash,
      color: 'green',
      description: 'Manajemen NIM mahasiswa'
    },
    {
      label: 'Persetujuan Surat',
      path: '/admin/approval',
      icon: CheckSquare,
      color: 'yellow',
      description: 'Review surat masuk'
    },
    {
      label: 'Lihat Laporan',
      path: '/admin/reports',
      icon: BarChart3,
      color: 'purple',
      description: 'Statistik dan laporan'
    }
  ]
};

// Navigation breadcrumb configurations
export const breadcrumbConfig = {
  '/dashboard': [{ label: 'Dashboard', path: '/dashboard' }],
  '/profile': [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Profile', path: '/profile' }
  ],
  '/surat': [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Surat Saya', path: '/surat' }
  ],
  '/surat/create': [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Surat Saya', path: '/surat' },
    { label: 'Buat Surat Baru', path: '/surat/create' }
  ],
  '/admin/dashboard': [{ label: 'Dashboard Admin', path: '/admin/dashboard' }],
  '/admin/users': [
    { label: 'Dashboard Admin', path: '/admin/dashboard' },
    { label: 'Kelola User', path: '/admin/users' }
  ],
  '/admin/nim-management': [
    { label: 'Dashboard Admin', path: '/admin/dashboard' },
    { label: 'Kelola NIM', path: '/admin/nim-management' }
  ],
  '/admin/nim-management/add': [
    { label: 'Dashboard Admin', path: '/admin/dashboard' },
    { label: 'Kelola NIM', path: '/admin/nim-management' },
    { label: 'Tambah NIM', path: '/admin/nim-management/add' }
  ],
  '/admin/surat': [
    { label: 'Dashboard Admin', path: '/admin/dashboard' },
    { label: 'Kelola Surat', path: '/admin/surat' }
  ],
  '/admin/approval': [
    { label: 'Dashboard Admin', path: '/admin/dashboard' },
    { label: 'Persetujuan Surat', path: '/admin/approval' }
  ],
  '/admin/reports': [
    { label: 'Dashboard Admin', path: '/admin/dashboard' },
    { label: 'Statistik & Laporan', path: '/admin/reports' }
  ],
  '/admin/settings': [
    { label: 'Dashboard Admin', path: '/admin/dashboard' },
    { label: 'Pengaturan Sistem', path: '/admin/settings' }
  ]
};

// Function to get menu items based on user role
export const getMenuItems = (isAdmin) => {
  return isAdmin ? adminMenuItems : userMenuItems;
};

// Function to get quick actions based on user role
export const getQuickActions = (isAdmin) => {
  return isAdmin ? quickActionItems.admin : quickActionItems.user;
};

// Function to get breadcrumbs for a given path
export const getBreadcrumbs = (path) => {
  return breadcrumbConfig[path] || [{ label: 'Dashboard', path: '/dashboard' }];
};

// Function to find menu item by path
export const findMenuItemByPath = (path, isAdmin = false) => {
  const menuItems = getMenuItems(isAdmin);
  return menuItems.find(item => item.path === path);
};

// Function to check if path requires admin access
export const requiresAdminAccess = (path) => {
  return path.startsWith('/admin/');
};

// Function to get menu item with badge count
export const getMenuItemWithBadge = (item, badgeCount) => {
  return {
    ...item,
    badge: badgeCount > 0 ? badgeCount : null
  };
};

// Navigation helpers
export const navigationHelpers = {
  isActive: (currentPath, itemPath) => {
    if (itemPath === '/dashboard' || itemPath === '/admin/dashboard') {
      return currentPath === itemPath;
    }
    return currentPath.startsWith(itemPath);
  },
  
  getDefaultPath: (isAdmin) => {
    return isAdmin ? '/admin/dashboard' : '/dashboard';
  },
  
  getMenuItemIcon: (iconName) => {
    const icons = {
      Home,
      FileText,
      Plus,
      User,
      Settings,
      Users,
      CheckSquare,
      BarChart3,
      Shield,
      Mail,
      Hash,
      Database,
      UserCheck,
      PlusCircle,
      Edit,
      Trash2
    };
    
    return icons[iconName] || Home;
  }
};

// Export default menu configurations
export default {
  userMenuItems,
  adminMenuItems,
  nimManagementSubItems,
  quickActionItems,
  breadcrumbConfig,
  getMenuItems,
  getQuickActions,
  getBreadcrumbs,
  findMenuItemByPath,
  requiresAdminAccess,
  getMenuItemWithBadge,
  navigationHelpers
};