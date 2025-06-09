// src/App.js - Updated with Complete Admin Pages
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout Components
import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';

// Auth Pages
import AuthApp from './pages/auth/AuthApp';

// User Pages
import Dashboard from './pages/user/Dashboard';
import Profile from './pages/user/Profile';
import CreateSurat from './pages/user/surat/CreateSurat';
import ListSurat from './pages/user/surat/ListSurat';
import DetailSurat from './pages/user/surat/DetailSurat';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import MailManagement from './pages/admin/MailManagement';
import MailApproval from './pages/admin/MailApproval';
import StatisticsReports from './pages/admin/StatisticsReports';
import NIMManagement from './pages/admin/NIMManagement';
// Shared Pages
import NotFound from './pages/shared/NotFound';
import Unauthorized from './pages/shared/Unauthorized';


// Admin Settings placeholder
const AdminSettings = () => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Pengaturan Sistem</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Konfigurasi Email</h3>
        <p className="text-sm text-blue-600">Pengaturan SMTP dan template email</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h3 className="text-sm font-medium text-green-800 mb-2">Backup & Restore</h3>
        <p className="text-sm text-green-600">Kelola backup database sistem</p>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">Keamanan</h3>
        <p className="text-sm text-yellow-600">Pengaturan keamanan dan log audit</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <h3 className="text-sm font-medium text-purple-800 mb-2">Integrasi</h3>
        <p className="text-sm text-purple-600">API keys dan webhook settings</p>
      </div>
    </div>
    <div className="mt-6">
      <p className="text-gray-600">Pengaturan sistem akan dibuat selanjutnya. 🛠️</p>
    </div>
  </div>
);

// Error page components
const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Halaman tidak ditemukan</p>
      <button 
        onClick={() => window.history.back()}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
      >
        Kembali
      </button>
    </div>
  </div>
);

const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
      <p className="text-xl text-gray-600 mb-8">Akses tidak diizinkan</p>
      <button 
        onClick={() => window.history.back()}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
      >
        Kembali
      </button>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <AuthApp />
                </PublicRoute>
              } 
            />
            
            {/* Protected User Routes with UserLayout */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserLayout>
                    <Dashboard />
                  </UserLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <UserLayout>
                    <Profile/>
                  </UserLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/surat" 
              element={
                <ProtectedRoute>
                  <UserLayout>
                    <ListSurat/>
                  </UserLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/surat/create" 
              element={
                <ProtectedRoute>
                  <UserLayout>
                    <CreateSurat />
                  </UserLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/surat/:id" 
              element={
                <ProtectedRoute>
                  <UserLayout>
                    <DetailSurat/>
                  </UserLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <UserLayout>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Pengaturan</h1>
                      <p className="text-gray-600">Pengaturan user akan dibuat selanjutnya.</p>
                    </div>
                  </UserLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Admin Routes with AdminLayout */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <UserManagement />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/admin/nim-management" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <NIMManagement />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />

            
            <Route 
              path="/admin/surat" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <MailManagement />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/approval" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <MailApproval />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/reports" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <StatisticsReports />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <AdminSettings />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Error Pages */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            
            {/* Default Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;