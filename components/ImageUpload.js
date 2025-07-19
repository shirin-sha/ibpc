import { useRef } from "react";

export default function ImageUpload ({ label, name, onFileChange, preview }) {
    const fileInputRef = useRef(null);

    const triggerFileSelect = () => fileInputRef.current.click();

    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="flex items-center space-x-2">
                <button
                    type="button"
                    onClick={triggerFileSelect}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Choose File
                </button>
                {preview && (
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-14 h-14 rounded-full object-cover"
                    />
                )}
                <input
                    ref={fileInputRef}
                    id={name}
                    name={name}
                    type="file"
                    className="hidden"
                    onChange={onFileChange}
                    accept="image/*"
                />
                {/* <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p> */}
            </div>
        </div>
    );
};