// src/pages/shared/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Halaman Tidak Ditemukan</h2>
          <p className="text-gray-600">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Kembali ke Beranda
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

export default NotFound;