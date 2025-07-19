// components/ui/TextAreaField.js
import React from 'react';

const TextAreaField = ({ label, name, value, onChange, disabled = false, placeholder = '', rows = 4 }) => {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            {disabled ? (
                <div className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-600 whitespace-pre-wrap">
                    {value || 'N/A'}
                </div>
            ) : (
                <textarea
                    name={name}
                    id={name}
                    rows={rows}
                    value={value || ''}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            )}
        </div>
    );
};

export default TextAreaField;