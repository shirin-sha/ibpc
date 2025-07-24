import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '', 
  text = '', 
  fullScreen = false 
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    white: 'text-white',
    gray: 'text-gray-600'
  };

  const spinnerElement = (
    <div className={`${fullScreen ? 'fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50' : 'flex items-center justify-center'} ${className}`}>
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <svg 
            className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        {text && (
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );

  return spinnerElement;
};

// Skeleton loader for table rows
export const TableSkeleton = ({ rows = 5, columns = 6 }) => (
  <div className="animate-pulse">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                backgroundSize: '200% 100%',
              }}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Card skeleton loader
export const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  </div>
);

export default LoadingSpinner;