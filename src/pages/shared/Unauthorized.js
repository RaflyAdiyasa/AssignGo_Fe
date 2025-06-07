// src/pages/shared/Unauthorized.js
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Unauthorized = () => {
  const { isAdmin } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldX className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link
            to={isAdmin() ? "/admin/dashboard" : "/dashboard"}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Kembali ke Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="block w-full text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 inline mr-1" />
            Kembali ke halaman sebelumnya
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;