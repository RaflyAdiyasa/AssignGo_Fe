// src/App.js - Updated with Layout Integration
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout Components
import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicRoute from './components/common/PublicRoute';

// Pages
import AuthApp from './pages/auth/AuthApp';
import Dashboard from './pages/user/Dashboard';
import Profile from './pages/user/Profile';
import CreateSurat from './pages/user/surat/CreateSurat';
import ListSurat from './pages/user/surat/ListSurat';
import DetailSurat from './pages/user/surat/DetailSurat';
import NotFound from './pages/shared/NotFound';
import Unauthorized from './pages/shared/Unauthorized';

// Placeholder Dashboard Components (will be created next)
const AdminDashboard = () => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Admin</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <h3 className="text-sm font-medium text-purple-800">Total User</h3>
        <p className="text-2xl font-bold text-purple-900">45</p>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-sm font-medium text-blue-800">Total Surat</h3>
        <p className="text-2xl font-bold text-blue-900">127</p>
      </div>
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h3 className="text-sm font-medium text-yellow-800">Perlu Review</h3>
        <p className="text-2xl font-bold text-yellow-900">8</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h3 className="text-sm font-medium text-green-800">Approval Rate</h3>
        <p className="text-2xl font-bold text-green-900">94%</p>
      </div>
    </div>
    <div className="mt-6">
      <p className="text-gray-600">Selamat datang di Dashboard Admin! ⚡</p>
      <p className="text-sm text-gray-500 mt-2">
        Layout admin sudah siap. Fitur management lengkap akan dibuat selanjutnya.
      </p>
    </div>
  </div>
);

// Placeholder components for other pages
const ProfilePage = () => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile</h1>
    <p className="text-gray-600">Halaman profile akan dibuat selanjutnya.</p>
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
                    <Profile />
                  </UserLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/surat" 
              element={
                <ProtectedRoute>
                  <UserLayout>
                    <ListSurat />
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
                    <DetailSurat />
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
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Kelola User</h1>
                      <p className="text-gray-600">User management akan dibuat selanjutnya.</p>
                    </div>
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/surat" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Kelola Surat</h1>
                      <p className="text-gray-600">Surat management akan dibuat selanjutnya.</p>
                    </div>
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/approval" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Persetujuan Surat</h1>
                      <p className="text-gray-600">Approval system akan dibuat selanjutnya.</p>
                    </div>
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/reports" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Statistik & Laporan</h1>
                      <p className="text-gray-600">Reports akan dibuat selanjutnya.</p>
                    </div>
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Pengaturan Sistem</h1>
                      <p className="text-gray-600">System settings akan dibuat selanjutnya.</p>
                    </div>
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Error Pages */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/404" element={<NotFound />} />
            
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