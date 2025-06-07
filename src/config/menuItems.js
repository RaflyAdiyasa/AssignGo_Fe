// src/config/menuItems.js
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
  Mail
} from 'lucide-react';

// User Menu Items
export const userMenuItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: Home
  },
  {
    label: 'Surat Saya',
    path: '/surat',
    icon: FileText,
    badge: null // Will be populated with count
  },
  {
    label: 'Buat Surat Baru',
    path: '/surat/create',
    icon: Plus
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: User
  },
  {
    label: 'Pengaturan',
    path: '/settings',
    icon: Settings
  }
];

// Admin Menu Items
export const adminMenuItems = [
  {
    label: 'Dashboard Admin',
    path: '/admin/dashboard',
    icon: Home
  },
  {
    label: 'Kelola User',
    path: '/admin/users',
    icon: Users
  },
  {
    label: 'Kelola Surat',
    path: '/admin/surat',
    icon: Mail,
    badge: null // Will be populated with pending count
  },
  {
    label: 'Persetujuan Surat',
    path: '/admin/approval',
    icon: CheckSquare,
    badge: null // Will be populated with pending approvals
  },
  {
    label: 'Statistik & Laporan',
    path: '/admin/reports',
    icon: BarChart3
  },
  {
    label: 'Pengaturan Sistem',
    path: '/admin/settings',
    icon: Shield
  }
];

// Function to get menu items based on user role
export const getMenuItems = (isAdmin) => {
  return isAdmin ? adminMenuItems : userMenuItems;
};