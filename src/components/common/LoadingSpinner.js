// src/components/common/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const spinnerClass = sizeClasses[size] || sizeClasses.medium;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div className="text-center">
          <div className={`${spinnerClass} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto`} />
          {message && (
            <p className="mt-4 text-gray-600 font-medium">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`${spinnerClass} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
      {message && (
        <p className="ml-3 text-gray-600">{message}</p>
      )}
    </div>
  );
};

// Skeleton Loading Components
export const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="px-6 py-4 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/6"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default LoadingSpinner;