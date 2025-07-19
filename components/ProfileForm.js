'use client'; // Required for Next.js 13+ App Router

import { useState, useRef } from 'react';
import FormField from '../components/FormField';
import TextAreaField from '../components/TextAreaField';
import ImageUpload from '../components/ImageUpload'; // Assuming
// import { User, Briefcase, Mail, Phone, Hash, Building, Award, BookOpen, CreditCard, Link as LinkIcon, Linkedin, Instagram, Facebook } from 'lucide-react';

// Simplified small file chooser component


export default function ProfileForm({ user, isAdmin }) {
  // Initialize form state from the user prop
  const [formData, setFormData] = useState({
    ...user,
    linkedin: user.social?.linkedin || '',
    instagram: user.social?.instagram || '',
    twitter: user.social?.twitter || '',
    facebook: user.social?.facebook || '',
  });

  // State for file objects
  const [files, setFiles] = useState({ photo: null, logo: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: inputFiles } = e.target;
    if (inputFiles[0]) {
      setFiles(prev => ({ ...prev, [name]: inputFiles[0] }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    // Append form fields
    for (const key in formData) {
      if (['linkedin', 'instagram', 'twitter', 'facebook'].includes(key)) {
        data.append(`social.${key}`, formData[key]);
      } else {
        data.append(key, formData[key]);
      }
    }

    // Append files
    if (files.photo) data.append('photo', files.photo);
    if (files.logo) data.append('logo', files.logo);

    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: 'PATCH',
        body: data,
      });

      if (response.ok) {
        alert('Profile updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert('An unexpected error occurred.');
    }
  };


  const isMember = !isAdmin;

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-4 sm:p-8">
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-1"> {/* Single column layout now */}
        {/* --- MAIN CONTENT (Right Area) --- */}
        <div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {/* Non-Editable section for Members */}
            <div className="sm:col-span-6">
              <h2 className="text-xl font-semibold leading-7 text-gray-900">Personal Information</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">This information is managed by the administration.</p>
            </div>
            <div className="sm:col-span-3"><FormField label="Full Name" name="name" value={formData.name} onChange={handleChange} disabled={isMember} /></div>
            <div className="sm:col-span-3"><FormField label="Email" name="email" value={formData.email} onChange={handleChange} disabled={isMember} /></div>
            <div className="sm:col-span-3"><FormField label="Phone Number" name="mobile" value={formData.mobile} onChange={handleChange} disabled={isMember} /></div>
            <div className="sm:col-span-3"><FormField label="Member ID" name="memberId" value={formData.memberId} onChange={handleChange} disabled={isMember} /></div>
            <div className="sm:col-span-3"><FormField label="Indian Passport Number" name="passportNumber" value={formData.passportNumber} onChange={handleChange} disabled={isMember} /></div>
            <div className="sm:col-span-3"><FormField label="Kuwait Civil ID Number" name="civilId" value={formData.civilId} onChange={handleChange} disabled={isMember} /></div>

            {/* Photo Upload (Small File Chooser) - Integrated here */}
            <div className="sm:col-span-3">
              <ImageUpload
                label="Profile Photo"
                name="photo"
                onFileChange={handleFileChange}
                preview={files.photo ? URL.createObjectURL(files.photo) : null}
              />

            </div>

            {/* Company Information */}
            <div className="sm:col-span-6 pt-8">
              <h2 className="text-xl font-semibold leading-7 text-gray-900">Company & Profession</h2>
            </div>
            <div className="sm:col-span-3"><FormField label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} disabled={isMember} /></div>
            <div className="sm:col-span-3"><FormField label="Profession & Designation" name="profession" value={`${formData.profession}`} onChange={handleChange} disabled={isMember} /></div>
            <div className="sm:col-span-6"><FormField label="Type of Business Activity" name="businessActivity" value={formData.businessActivity} onChange={handleChange} disabled={isMember} /></div>

            {/* Logo Upload (Small File Chooser) - Integrated here */}
            <div className="sm:col-span-3">

              <ImageUpload
                label="Company Logo"
                name="logo"
                onFileChange={handleFileChange}
                preview={files.logo ? URL.createObjectURL(files.logo) : null}
              />
            </div>

            {/* Editable section for everyone */}
            <div className="sm:col-span-6">
              <TextAreaField label="Brief About Company" name="companyBrief" value={formData.companyBrief} onChange={handleChange} rows={5} placeholder="Tell us about your company..." />
            </div>

            {/* Social Media Links */}
            <div className="sm:col-span-6 pt-8">
              <h2 className="text-xl font-semibold leading-7 text-gray-900">Social Links</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">Update your professional and social network links.</p>
            </div>
            <div className="sm:col-span-3"><FormField label="LinkedIn" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." /></div>
            <div className="sm:col-span-3"><FormField label="Instagram" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..." /></div>
            <div className="sm:col-span-3"><FormField label="Twitter / X" name="twitter" value={formData.twitter} onChange={handleChange} placeholder="https://twitter.com/..." /></div>
            <div className="sm:col-span-3"><FormField label="Facebook" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/..." /></div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div
          className="
      flex flex-col            /* stack vertically by default */
      sm:flex-row              /* horizontal on ≥640px */
      sm:justify-end           /* right-align on desktop */
      gap-2
    "
        >
          {/* 1) SAVE should be first in mobile (order-first),  
          but second on desktop (sm:order-last) */}
          <button
            type="submit"
            className="
        order-first sm:order-last
        w-full sm:w-auto
        px-4 py-2 bg-gray-900 text-white rounded-lg
        hover:bg-gray-800 transition-colors text-sm
      "
          >
            Save Profile
          </button>

          {/* 2) CANCEL should be last in mobile (order-last),  
          but first on desktop (sm:order-first) */}
          <button
            type="button"
            className="
        order-last sm:order-first
        w-full sm:w-auto
        rounded-md bg-white
        px-3 py-2 text-sm font-semibold text-gray-900
        shadow-sm ring-1 ring-inset ring-gray-300
        hover:bg-gray-50
      "
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}