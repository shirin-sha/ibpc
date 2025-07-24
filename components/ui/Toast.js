'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastItem = ({ toast, onRemove }) => {
  const icons = {
    success: <CheckCircleIcon className="w-6 h-6 text-success-600" />,
    error: <XCircleIcon className="w-6 h-6 text-error-600" />,
    warning: <ExclamationTriangleIcon className="w-6 h-6 text-warning-600" />,
    info: <InformationCircleIcon className="w-6 h-6 text-primary-600" />,
  };

  const bgColors = {
    success: 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800',
    error: 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800',
    warning: 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800',
    info: 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800',
  };

  const textColors = {
    success: 'text-success-800 dark:text-success-200',
    error: 'text-error-800 dark:text-error-200',
    warning: 'text-warning-800 dark:text-warning-200',
    info: 'text-primary-800 dark:text-primary-200',
  };

  return (
    <div className={`relative flex items-start space-x-3 p-4 rounded-lg border shadow-soft ${bgColors[toast.type]} animate-slide-up`}>
      <div className="flex-shrink-0">
        {icons[toast.type]}
      </div>
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className={`text-sm font-medium ${textColors[toast.type]} mb-1`}>
            {toast.title}
          </div>
        )}
        <div className={`text-sm ${textColors[toast.type]}`}>
          {toast.message}
        </div>
      </div>
      
      <button
        onClick={() => onRemove(toast.id)}
        className={`flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors ${textColors[toast.type]}`}
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = { id, ...toast };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 5000);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = {
    success: (message, options = {}) => addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) => addToast({ type: 'error', message, ...options }),
    warning: (message, options = {}) => addToast({ type: 'warning', message, ...options }),
    info: (message, options = {}) => addToast({ type: 'info', message, ...options }),
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onRemove={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;