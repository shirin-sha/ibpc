import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  error = '',
  disabled = false,
  required = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const baseClasses = 'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';
  
  const sizeClasses = 'px-4 py-3 text-sm';
  
  const stateClasses = error
    ? 'border-error-300 text-error-900 placeholder-error-400 focus:border-error-500 focus:ring-error-500'
    : 'border-secondary-300 text-secondary-900 placeholder-secondary-400 focus:border-primary-500 focus:ring-primary-500';
    
  const darkClasses = error
    ? 'dark:border-error-600 dark:text-error-100 dark:placeholder-error-500 dark:focus:border-error-400 dark:focus:ring-error-400'
    : 'dark:border-secondary-600 dark:text-secondary-100 dark:placeholder-secondary-500 dark:focus:border-primary-400 dark:focus:ring-primary-400';
    
  const bgClasses = disabled
    ? 'bg-secondary-50 dark:bg-secondary-800'
    : 'bg-white dark:bg-secondary-900';

  const iconPadding = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-secondary-700 dark:text-secondary-300"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-secondary-400 dark:text-secondary-500">
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          name={name}
          id={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={`${baseClasses} ${sizeClasses} ${stateClasses} ${darkClasses} ${bgClasses} ${iconPadding} ${className}`}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-secondary-400 dark:text-secondary-500">
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-error-600 dark:text-error-400 animate-slide-up">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;