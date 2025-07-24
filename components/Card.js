import React from 'react';

const Card = ({ 
  title, 
  value, 
  icon, 
  className = '', 
  onClick, 
  loading = false,
  trend = null, // { value: '+12%', direction: 'up' }
  children,
  variant = 'default'
}) => {
  const baseClasses = 'bg-white dark:bg-secondary-800 rounded-xl shadow-soft border border-secondary-100 dark:border-secondary-700 transition-all duration-200';
  
  const variantClasses = {
    default: 'hover:shadow-medium',
    primary: 'border-primary-200 dark:border-primary-800 bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/20 dark:to-secondary-800',
    success: 'border-success-200 dark:border-success-800 bg-gradient-to-br from-success-50 to-white dark:from-success-900/20 dark:to-secondary-800',
    warning: 'border-warning-200 dark:border-warning-800 bg-gradient-to-br from-warning-50 to-white dark:from-warning-900/20 dark:to-secondary-800',
    error: 'border-error-200 dark:border-error-800 bg-gradient-to-br from-error-50 to-white dark:from-error-900/20 dark:to-secondary-800',
  };

  const interactiveClasses = onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : '';
  
  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${className}`;

  const handleClick = () => {
    if (onClick && !loading) {
      onClick();
    }
  };

  if (loading) {
    return (
      <div className={cardClasses}>
        <div className="p-6 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-secondary-200 dark:bg-secondary-700 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-1/3" />
              <div className="h-6 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cardClasses}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="p-6">
        {children ? (
          children
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {icon && (
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary-100 dark:bg-secondary-700 text-2xl">
                    {icon}
                  </div>
                </div>
              )}
              <div className="flex-1">
                {title && (
                  <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400 mb-1">
                    {title}
                  </p>
                )}
                {value && (
                  <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                    {value}
                  </p>
                )}
              </div>
            </div>
            
            {trend && (
              <div className={`flex items-center space-x-1 text-sm font-medium ${
                trend.direction === 'up' 
                  ? 'text-success-600 dark:text-success-400' 
                  : trend.direction === 'down'
                  ? 'text-error-600 dark:text-error-400'
                  : 'text-secondary-600 dark:text-secondary-400'
              }`}>
                {trend.direction === 'up' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l7-7 7 7" />
                  </svg>
                )}
                {trend.direction === 'down' && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-7 7-7-7" />
                  </svg>
                )}
                <span>{trend.value}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;