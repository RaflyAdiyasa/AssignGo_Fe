// src/components/surat/StatusBadge.js - Consistent status badge component
import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { SURAT_STATUS } from '../../utils/constants';

const StatusBadge = ({ 
  status, 
  size = 'md', 
  showIcon = true, 
  className = '' 
}) => {
  // Normalize status to handle different formats
  const normalizedStatus = status?.toLowerCase() || 'diproses';
  
  // Size configurations
  const sizeClasses = {
    xs: {
      badge: 'px-1.5 py-0.5 text-xs',
      icon: 'w-3 h-3'
    },
    sm: {
      badge: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3'
    },
    md: {
      badge: 'px-2.5 py-1.5 text-sm',
      icon: 'w-4 h-4'
    },
    lg: {
      badge: 'px-3 py-2 text-base',
      icon: 'w-5 h-5'
    }
  };

  // Status configurations
  const statusConfig = {
    [SURAT_STATUS.DIPROSES]: {
      label: 'Diproses',
      icon: Clock,
      classes: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      description: 'Surat sedang dalam proses review'
    },
    [SURAT_STATUS.DISETUJUI]: {
      label: 'Disetujui',
      icon: CheckCircle,
      classes: 'bg-green-100 text-green-800 border-green-200',
      description: 'Surat telah disetujui'
    },
    [SURAT_STATUS.DITOLAK]: {
      label: 'Ditolak',
      icon: XCircle,
      classes: 'bg-red-100 text-red-800 border-red-200',
      description: 'Surat ditolak'
    }
  };

  // Get status config or default
  const config = statusConfig[normalizedStatus] || {
    label: 'Unknown',
    icon: AlertCircle,
    classes: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Status tidak dikenal'
  };

  const Icon = config.icon;
  const sizeConfig = sizeClasses[size] || sizeClasses.md;

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${config.classes}
        ${sizeConfig.badge}
        ${className}
      `}
      title={config.description}
    >
      {showIcon && (
        <Icon className={`${sizeConfig.icon} mr-1`} />
      )}
      {config.label}
    </span>
  );
};

export default StatusBadge;

// src/components/surat/StatusIcon.js - Icon-only status display
export const StatusIcon = ({ status, size = 'md', className = '' }) => {
  const normalizedStatus = status?.toLowerCase() || 'diproses';
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const statusConfig = {
    [SURAT_STATUS.DIPROSES]: {
      icon: Clock,
      classes: 'text-yellow-600',
      description: 'Sedang diproses'
    },
    [SURAT_STATUS.DISETUJUI]: {
      icon: CheckCircle,
      classes: 'text-green-600',
      description: 'Disetujui'
    },
    [SURAT_STATUS.DITOLAK]: {
      icon: XCircle,
      classes: 'text-red-600',
      description: 'Ditolak'
    }
  };

  const config = statusConfig[normalizedStatus] || {
    icon: AlertCircle,
    classes: 'text-gray-600',
    description: 'Status tidak dikenal'
  };

  const Icon = config.icon;
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <Icon 
      className={`${sizeClass} ${config.classes} ${className}`}
      title={config.description}
    />
  );
};

// src/components/surat/StatusProgress.js - Progress bar for status
export const StatusProgress = ({ status, className = '' }) => {
  const normalizedStatus = status?.toLowerCase() || 'diproses';
  
  const steps = [
    { key: 'submitted', label: 'Diajukan', active: true },
    { key: 'processing', label: 'Diproses', active: normalizedStatus !== 'diproses' },
    { 
      key: 'completed', 
      label: normalizedStatus === SURAT_STATUS.DISETUJUI ? 'Disetujui' : 'Ditolak',
      active: normalizedStatus === SURAT_STATUS.DISETUJUI || normalizedStatus === SURAT_STATUS.DITOLAK,
      isRejected: normalizedStatus === SURAT_STATUS.DITOLAK
    }
  ];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={step.key}>
          <div className="flex flex-col items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                step.active 
                  ? step.isRejected 
                    ? 'bg-red-600 text-white' 
                    : 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index + 1}
            </div>
            <span className={`text-xs mt-1 ${
              step.active ? 'text-gray-900 font-medium' : 'text-gray-500'
            }`}>
              {step.label}
            </span>
          </div>
          
          {index < steps.length - 1 && (
            <div 
              className={`flex-1 h-1 rounded ${
                steps[index + 1].active 
                  ? steps[index + 1].isRejected 
                    ? 'bg-red-600' 
                    : 'bg-green-600'
                  : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// src/components/surat/StatusFilter.js - Filter by status
export const StatusFilter = ({ 
  value, 
  onChange, 
  includeAll = true, 
  className = '' 
}) => {
  const options = [];
  
  if (includeAll) {
    options.push({ value: 'all', label: 'Semua Status' });
  }
  
  options.push(
    { value: SURAT_STATUS.DIPROSES, label: 'Diproses' },
    { value: SURAT_STATUS.DISETUJUI, label: 'Disetujui' },
    { value: SURAT_STATUS.DITOLAK, label: 'Ditolak' }
  );

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// src/components/surat/StatusCard.js - Card with status info
export const StatusCard = ({ 
  title, 
  count, 
  status, 
  description, 
  onClick, 
  className = '' 
}) => {
  const statusConfig = {
    [SURAT_STATUS.DIPROSES]: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-900',
      countColor: 'text-yellow-700',
      icon: Clock,
      iconColor: 'text-yellow-600'
    },
    [SURAT_STATUS.DISETUJUI]: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-900',
      countColor: 'text-green-700',
      icon: CheckCircle,
      iconColor: 'text-green-600'
    },
    [SURAT_STATUS.DITOLAK]: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      countColor: 'text-red-700',
      icon: XCircle,
      iconColor: 'text-red-600'
    }
  };

  const config = statusConfig[status] || {
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-900',
    countColor: 'text-gray-700',
    icon: AlertCircle,
    iconColor: 'text-gray-600'
  };

  const Icon = config.icon;

  return (
    <div
      className={`
        ${config.bgColor} ${config.borderColor} border rounded-lg p-6 text-center
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <Icon className={`w-8 h-8 ${config.iconColor} mx-auto mb-3`} />
      <p className={`text-2xl font-bold ${config.countColor} mb-1`}>
        {count}
      </p>
      <p className={`text-sm font-medium ${config.textColor} mb-1`}>
        {title}
      </p>
      {description && (
        <p className={`text-xs ${config.textColor} opacity-75`}>
          {description}
        </p>
      )}
    </div>
  );
};

// Export utility function to get status display text
export const getStatusDisplayText = (status) => {
  const statusConfig = {
    [SURAT_STATUS.DIPROSES]: 'Diproses',
    [SURAT_STATUS.DISETUJUI]: 'Disetujui',
    [SURAT_STATUS.DITOLAK]: 'Ditolak'
  };
  
  return statusConfig[status?.toLowerCase()] || 'Unknown';
};

// Export utility function to get status color classes
export const getStatusColorClasses = (status) => {
  const statusConfig = {
    [SURAT_STATUS.DIPROSES]: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200'
    },
    [SURAT_STATUS.DISETUJUI]: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200'
    },
    [SURAT_STATUS.DITOLAK]: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200'
    }
  };
  
  return statusConfig[status?.toLowerCase()] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  };
};