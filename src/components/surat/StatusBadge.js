// src/components/surat/StatusBadge.js
import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { SURAT_STATUS, SURAT_STATUS_LABELS, SURAT_STATUS_COLORS } from '../../utils/constants';

const StatusBadge = ({ status, size = 'sm', showIcon = true }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case SURAT_STATUS.DIPROSES:
        return <Clock className="w-4 h-4" />;
      case SURAT_STATUS.DISETUJUI:
        return <CheckCircle className="w-4 h-4" />;
      case SURAT_STATUS.DITOLAK:
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-sm'
  };

  const colorClass = SURAT_STATUS_COLORS[status] || SURAT_STATUS_COLORS[SURAT_STATUS.DIPROSES];
  const sizeClass = sizeClasses[size] || sizeClasses.sm;
  const label = SURAT_STATUS_LABELS[status] || 'Unknown';

  return (
    <span className={`inline-flex items-center space-x-1 rounded-full border font-medium ${colorClass} ${sizeClass}`}>
      {showIcon && getStatusIcon(status)}
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;