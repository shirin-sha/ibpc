import { memo, useCallback } from 'react';
import IndustrySectorSelect from './IndustrySectorSelect';

// Memoized form input component
const FormInput = memo(({ 
  type = "text", 
  name, 
  value, 
  onChange, 
  id, 
  label, 
  placeholder, 
  required = false, 
  className = "",
  rows = 1 
}) => {
  const inputClass = `w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-gray-500 focus:border-gray-500 placeholder-gray-400 text-gray-900 ${className}`;
  
  const InputComponent = rows > 1 ? 'textarea' : 'input';
  
  return (
    <div className="relative">
      <InputComponent
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        id={id}
        className={`${inputClass} peer pt-6 placeholder-transparent`}
        placeholder={placeholder}
        required={required}
        rows={rows > 1 ? rows : undefined}
      />
      <label 
        htmlFor={id} 
        className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none"
      >
        {label} {required && <span style={{ color: '#061E3E' }}>*</span>}
      </label>
    </div>
  );
});

FormInput.displayName = 'FormInput';

// Memoized select component
const FormSelect = memo(({ 
  name, 
  value, 
  onChange, 
  id, 
  label, 
  required = false,
  children 
}) => {
  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-gray-500 focus:border-gray-500 placeholder-gray-400 text-gray-900 peer pt-6 placeholder-transparent";
  
  return (
    <div className="relative">
      <select 
        name={name} 
        value={value} 
        onChange={onChange} 
        id={id} 
        className={inputClass}
        required={required}
      >
        {children}
      </select>
      <label 
        htmlFor={id} 
        className="absolute left-3 top-2 text-xs text-gray-500 transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 bg-white px-1 pointer-events-none"
      >
        {label} {required && <span style={{ color: '#061E3E' }}>*</span>}
      </label>
    </div>
  );
});

FormSelect.displayName = 'FormSelect';

// Photo upload component
const PhotoUpload = memo(({ photoPreview, onChange, onRemove }) => {
  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      onChange(file);
    }
  }, [onChange]);

  return (
    <div className="flex flex-col gap-2">
      <label className="cursor-pointer inline-flex items-center gap-2">
        <input 
          type="file" 
          name="photo" 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        <span className="px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 border border-gray-300 rounded hover:bg-gray-300">
          Upload Photo
        </span>
      </label>
      {photoPreview ? (
        <div className="flex items-center gap-3">
          <img src={photoPreview} alt="Preview" className="w-20 h-20 object-cover rounded-md border" />
          <button type="button" onClick={onRemove} className="text-xs hover:underline" style={{ color: '#061E3E' }}>
            Remove
          </button>
        </div>
      ) : (
        <span className="text-xs text-gray-500">No file selected</span>
      )}
    </div>
  );
});

PhotoUpload.displayName = 'PhotoUpload';

export { FormInput, FormSelect, PhotoUpload };
