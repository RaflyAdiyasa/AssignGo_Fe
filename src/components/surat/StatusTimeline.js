// src/components/surat/StatusTimeline.js
import React from 'react';
import { Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { formatDateTime, getRelativeTime } from '../../utils/dateUtils';
import { SURAT_STATUS } from '../../utils/constants';

const StatusTimeline = ({ history = [] }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case SURAT_STATUS.DIPROSES:
        return <Clock className="w-4 h-4" />;
      case SURAT_STATUS.DISETUJUI:
        return <CheckCircle className="w-4 h-4" />;
      case SURAT_STATUS.DITOLAK:
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case SURAT_STATUS.DIPROSES:
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-300',
          line: 'bg-yellow-300'
        };
      case SURAT_STATUS.DISETUJUI:
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-300',
          line: 'bg-green-300'
        };
      case SURAT_STATUS.DITOLAK:
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-300',
          line: 'bg-red-300'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-300',
          line: 'bg-gray-300'
        };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case SURAT_STATUS.DIPROSES:
        return 'Sedang Diproses';
      case SURAT_STATUS.DISETUJUI:
        return 'Disetujui';
      case SURAT_STATUS.DITOLAK:
        return 'Ditolak';
      default:
        return 'Unknown Status';
    }
  };

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-6">
        <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">Belum ada riwayat status</p>
      </div>
    );
  }

  // Sort history by date (newest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.tanggal_update) - new Date(a.tanggal_update)
  );

  return (
    <div className="space-y-0">
      {sortedHistory.map((item, index) => {
        const colors = getStatusColor(item.status);
        const isLast = index === sortedHistory.length - 1;
        const isFirst = index === 0;
        
        return (
          <div key={item.id} className="relative">
            {/* Timeline Line */}
            {!isLast && (
              <div 
                className={`absolute left-4 top-10 w-0.5 h-16 ${colors.line}`}
                style={{ transform: 'translateX(-50%)' }}
              />
            )}
            
            {/* Timeline Item */}
            <div className="flex items-start space-x-4 pb-6">
              {/* Icon */}
              <div className={`
                w-8 h-8 rounded-full border-2 flex items-center justify-center
                ${colors.bg} ${colors.border} ${colors.text}
                ${isFirst ? 'ring-2 ring-blue-200' : ''}
              `}>
                {getStatusIcon(item.status)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-medium ${colors.text}`}>
                    {getStatusText(item.status)}
                  </h4>
                  {isFirst && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Terbaru
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <div>{formatDateTime(item.tanggal_update)}</div>
                  <div className="text-xs text-gray-500">
                    {getRelativeTime(item.tanggal_update)}
                  </div>
                </div>
                
                {item.alasan && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                    <p className="text-sm font-medium text-red-800 mb-1">Alasan:</p>
                    <p className="text-sm text-red-700">{item.alasan}</p>
                  </div>
                )}
                
                {item.status === SURAT_STATUS.DIPROSES && isFirst && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                    <p className="text-sm text-yellow-800">
                      Surat sedang dalam proses review. Mohon menunggu konfirmasi dari admin.
                    </p>
                  </div>
                )}
                
                {item.status === SURAT_STATUS.DISETUJUI && isFirst && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                    <p className="text-sm text-green-800">
                      Selamat! Surat tugas Anda telah disetujui dan siap digunakan.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Initial submission (always at bottom) */}
      <div className="relative">
        <div className="flex items-start space-x-4">
          <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
            <FileText className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-800 mb-1">Surat Diajukan</h4>
            <p className="text-sm text-gray-600">
              Surat tugas telah berhasil diajukan ke sistem
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusTimeline;