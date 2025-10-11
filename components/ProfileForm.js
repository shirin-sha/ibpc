'use client'; // Required for Next.js 13+ App Router

import { useState } from 'react';
import { INDUSTRY_SECTORS } from '@/lib/industrySectors';
import FormField from '../components/FormField';
import TextAreaField from '../components/TextAreaField';
import ImageUpload from '../components/ImageUpload'; // Assuming this is your component
import { useRouter } from 'next/navigation';

export default function ProfileForm({ user, isAdmin, onSaveSuccess  }) {
  // Initialize initial form data (for reset) by including all fields from registration
  const initialFormData = {
    ...user,
    // Existing fields
    linkedin: user.social?.linkedin || '',
    instagram: user.social?.instagram || '',
    twitter: user.social?.twitter || '',
    facebook: user.social?.facebook || '',
    // Newly added fields from registration form
    sponsorName: user.sponsorName || '',
    address: user.address || '',
    officePhone: user.officePhone || '',
    benefit: user.benefit || '',
    contribution: user.contribution || '',
    proposer1: user.proposer1 || '',
    proposer2: user.proposer2 || '',
    // Additional new fields
    nationality: user.nationality || '',
    membershipType: user.membershipType || '',
    alternateMobile: user.alternateMobile || '',
    alternateEmail: user.alternateEmail || '',
    industrySector: user.industrySector || '',
    alternateIndustrySector: user.alternateIndustrySector || '',
    companyAddress: user.companyAddress || '',
    companyWebsite: user.companyWebsite || '',
    about: user.about || '',
  };

  // Form state
  const [formData, setFormData] = useState(initialFormData);
  const [files, setFiles] = useState({ photo: null, logo: null });
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: inputFiles } = e.target;
    if (inputFiles[0]) {
      setFiles((prev) => ({ ...prev, [name]: inputFiles[0] }));
    }
  };

  // New: Reset function for Cancel button
  const handleCancel = () => {
    setFormData(initialFormData); // Reset to initial user data
    setFiles({ photo: null, logo: null }); // Clear any uploaded files
    router.back(); // Navigate back
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const data = new FormData();

    // Append form fields
    for (const key in formData) {
      if (['linkedin', 'instagram', 'twitter', 'facebook'].includes(key)) {
        data.append(`social.${key}`, formData[key]);
      } else {
        // This dynamic loop handles all fields, including the new ones
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
        if (onSaveSuccess) {
          onSaveSuccess(); // Call the refetch function
        }
        setFiles({ photo: null, logo: null });
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert('An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const isMember = !isAdmin;

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-4 sm:p-8">
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-1">
        {/* --- MAIN CONTENT (Right Area) --- */}
        <div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            {/* Non-Editable section for Members */}
            <div className="sm:col-span-6">
              <h2 className="text-xl font-semibold leading-7 text-gray-900">Personal Information</h2>
          
            </div>
            
            {/* About Field - First field, Editable by Members */}
            <div className="sm:col-span-6">
              <TextAreaField 
                label="About You" 
                name="about" 
                value={formData.about} 
                onChange={handleChange} 
                rows={4} 
                placeholder="Tell us about yourself, your background, interests, and expertise..." 
              />
            </div>
            
            <div className="sm:col-span-3"><FormField label="Full Name" name="name" value={formData.name} onChange={handleChange} disabled={isMember} /></div>
            <div className="sm:col-span-3"><FormField label="Email" name="email" value={formData.email} onChange={handleChange} disabled={isMember} /></div>
            <div className="sm:col-span-3"><FormField label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} disabled={isMember} /></div>
            <div className="sm:col-span-3"><FormField label="Office Phone" name="officePhone" value={formData.officePhone} onChange={handleChange} disabled={isMember} /></div>
            <div className="sm:col-span-6"><TextAreaField label="Address in Kuwait" name="address" value={formData.address} onChange={handleChange} rows={2} disabled={isMember} /></div>
            <div className="sm:col-span-3"><FormField label="Member ID" name="memberId" value={formData.memberId} onChange={handleChange} disabled={isMember} /></div>
            <div className="sm:col-span-3"><FormField label="Unique ID" name="uniqueId" value={formData.uniqueId} onChange={handleChange} disabled={isMember} /></div>
            <div className="sm:col-span-3"><FormField label="Passport Number" name="passportNumber" value={formData.passportNumber} onChange={handleChange} disabled={isMember} /></div>
            <div className="sm:col-span-3"><FormField label="Kuwait Civil ID Number" name="civilId" value={formData.civilId} onChange={handleChange} disabled={isMember} /></div>
            
            {/* New: Alternate Mobile Field */}
            <div className="sm:col-span-3">
              <FormField label="Alternate Mobile (Optional)" name="alternateMobile" value={formData.alternateMobile} onChange={handleChange} disabled={isMember} />
            </div>
            
            {/* New: Alternate Email Field */}
            <div className="sm:col-span-3">
              <FormField label="Alternate Email (Optional)" name="alternateEmail" value={formData.alternateEmail} onChange={handleChange} disabled={isMember} />
            </div>

            {/* Photo Upload */}
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
            <div className="sm:col-span-3"><FormField label="Type of Business Activity" name="businessActivity" value={formData.businessActivity} onChange={handleChange} disabled={isMember} /></div>
            <div className="sm:col-span-3"><FormField label="Kuwaiti Sponsor/Partner Name" name="sponsorName" value={formData.sponsorName} onChange={handleChange} disabled={isMember} /></div>
            
            {/* New: Nationality Field */}
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
              <select
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                disabled={isMember}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-gray-500 focus:border-gray-500 placeholder-gray-400 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Nationality</option>
                <option value="INDIAN">INDIAN</option>
                <option value="OCI CARD HOLDER">OCI CARD HOLDER</option>
                <option value="OTHERS">OTHERS</option>
              </select>
            </div>
            
            {/* New: Membership Type Field */}
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Membership Type</label>
              <select
                name="membershipType"
                value={formData.membershipType}
                onChange={handleChange}
                disabled={isMember}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-gray-500 focus:border-gray-500 placeholder-gray-400 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Membership Type</option>
                <option value="Individual Member">Individual Member</option>
                <option value="Corporate Member">Corporate Member</option>
                <option value="Special Honorary Member">Special Honorary Member</option>
                <option value="Honorary Member">Honorary Member</option>
              </select>
            </div>
            
            {/* New: Industry Sector Field */}
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry Sector</label>
              <select
                name="industrySector"
                value={formData.industrySector}
                onChange={handleChange}
                disabled={isMember}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-gray-500 focus:border-gray-500 placeholder-gray-400 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Industry Sector</option>
                {INDUSTRY_SECTORS.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
            
            {/* New: Alternate Industry Sector Field */}
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Industry Sector (Optional)</label>
              <select
                name="alternateIndustrySector"
                value={formData.alternateIndustrySector}
                onChange={handleChange}
                disabled={isMember}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-gray-500 focus:border-gray-500 placeholder-gray-400 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Alternate Industry Sector</option>
                {INDUSTRY_SECTORS.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
            
            {/* New: Company Address Field */}
            <div className="sm:col-span-6">
              <TextAreaField label="Company Address" name="companyAddress" value={formData.companyAddress} onChange={handleChange} rows={2} disabled={isMember} />
            </div>
            
            {/* New: Company Website Field */}
            <div className="sm:col-span-3">
              <FormField label="Company Website" name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} disabled={isMember} />
            </div>
            
            {/* Logo Upload */}
            <div className="sm:col-span-3">
              <ImageUpload
                label="Company Logo"
                name="logo"
                onFileChange={handleFileChange}
                preview={files.logo ? URL.createObjectURL(files.logo) : null}
              />
            </div>
             <div className="sm:col-span-3"> {/* Spacer to align with grid */}</div>

            {/* Editable section for everyone */}
            <div className="sm:col-span-6">
              <TextAreaField label="Brief About Company" name="companyBrief" value={formData.companyBrief} onChange={handleChange} rows={5} placeholder="Tell us about your company..." />
            </div>

            {/* Application Details (from registration) */}
            <div className="sm:col-span-6 pt-8">
              <h2 className="text-xl font-semibold leading-7 text-gray-900">Application Details</h2>
            </div>
            <div className="sm:col-span-6"><TextAreaField label="How would you benefit from IBPC membership?" name="benefit" value={formData.benefitFromIbpc} onChange={handleChange} rows={3} disabled={isMember} /></div>
            <div className="sm:col-span-6"><TextAreaField label="How can you contribute to IBPC's objectives?" name="contribution" value={formData.contributeToIbpc} onChange={handleChange} rows={3} disabled={isMember} /></div>

            {/* Sponsorship Details (from registration) */}
            <div className="sm:col-span-6 pt-8">
              <h2 className="text-xl font-semibold leading-7 text-gray-900">Sponsorship</h2>
            </div>
            <div className="sm:col-span-3"><FormField label="First IBPC Member Proposer" name="proposer1" value={formData.proposer1} onChange={handleChange} disabled={isMember} /></div>
            <div className="sm:col-span-3"><FormField label="Second IBPC Member Proposer" name="proposer2" value={formData.proposer2} onChange={handleChange} disabled={isMember} /></div>

            {/* Social Media Links */}
            <div className="sm:col-span-6 pt-8">
              <h2 className="text-xl font-semibold leading-7 text-gray-900">Social Links</h2>
            </div>
            <div className="sm:col-span-3"><FormField label="LinkedIn" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." /></div>
            <div className="sm:col-span-3"><FormField label="Instagram" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..." /></div>
            <div className="sm:col-span-3"><FormField label="Twitter / X" name="twitter" value={formData.twitter} onChange={handleChange} placeholder="https://twitter.com/..." /></div>
            <div className="sm:col-span-3"><FormField label="Facebook" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/..." /></div>

            {/* Membership Validity (Admin only) */}
            {isAdmin && (
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Membership Validity</label>
                <select
                  name="membershipValidity"
                  value={formData.membershipValidity || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-gray-500 focus:border-gray-500 placeholder-gray-400 text-gray-900"
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 11 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="order-first sm:order-last w-full sm:w-auto px-4 py-2 text-white rounded-lg transition-colors text-sm disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: '#061E3E' }}
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="order-last sm:order-first w-full sm:w-auto rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}