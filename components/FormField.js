// components/ui/FormField.js
import React from 'react';

const FormField = ({ label, name, value, onChange, type = 'text', disabled = false, placeholder = '', required = false }) => {
  const commonClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-600"> *</span>}
      </label>
      {disabled ? (
        <div className={`mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-600`}>
          {value || 'N/A'}
        </div>
      ) : (
        <input
          type={type}
          name={name}
          id={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className={commonClasses}
          required={required}
        />
      )}
    </div>
  );
};

export default FormField;