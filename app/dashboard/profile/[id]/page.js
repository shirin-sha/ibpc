'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon, GlobeAltIcon, IdentificationIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useSession } from "next-auth/react";

export default function ViewProfile() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const [validityEdit, setValidityEdit] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile(data);
      } catch (error) {
        toast.error(error.message);
        router.push('/dashboard/members');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!profile) return <div className="text-center py-10">Profile not found</div>;

  return (
    <div>
      <div>
        {/* Back Button */}
        <Link href="/dashboard/members" className="inline-flex items-center text-gray-600 hover:text-blue-800 dark:text-gray-400 dark:hover:text-gray-300 mb-6 transition-colors">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Members
        </Link>

        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header Section */}
          <div className="relative h-48 bg-gradient-to-r from-gray-800 to-red-500">
            <div className="absolute bottom-0 left-8 transform translate-y-1/2">
              <img
                src={profile.photo || '/logo.png'}
                alt={profile.name}
                loading="lazy"
                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover"
              />
            </div>
          </div>

          {/* Name and Basic Info */}
          <div className="pt-16 pb-6 px-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
              {profile.profession} at {profile.companyName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Member ID: {profile._id?.slice(-6) || 'N/A'}
            </p>
          </div>

          {/* Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-8 pb-8">
            {/* Personal Info Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-inner"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-300">Profession</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{profile.profession || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-300">Nationality</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{profile.nationality || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-300">Membership Type</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{profile.membershipType || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-300">Passport Number</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{profile.passportNumber || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-300">Civil ID</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{profile.civilId || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-300">Sponsor Name</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{profile.sponsorName || 'N/A'}</dd>
                </div>
              </dl>
            </motion.div>

            {/* Company Info Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-inner"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Company Information</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-300">Company Name</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{profile.companyName || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-300">Business Activity</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{profile.businessActivity || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-gray-600 dark:text-gray-300 mb-1">Company Brief</dt>
                  <dd className="text-gray-900 dark:text-white">{profile.companyBrief || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-300">Company Address</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{profile.companyAddress || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-300">Company Website</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{profile.companyWebsite || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-300">Industry Sector</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{profile.industrySector || 'N/A'}</dd>
                </div>
                {profile.alternateIndustrySector && (
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-300">Alternate Industry Sector</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{profile.alternateIndustrySector}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-300">Membership Validity</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {isAdmin ? (
                      <>
                        <select
                          value={validityEdit || profile.membershipValidity || ""}
                          onChange={e => setValidityEdit(e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="">Select Year</option>
                          {Array.from({ length: 11 }, (_, i) => {
                            const year = new Date().getFullYear() + i;
                            return <option key={year} value={year}>{year}</option>;
                          })}
                        </select>
                        <button
                          className="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-xs"
                          onClick={async () => {
                            if (!validityEdit) return;
                            await fetch(`/api/users/${profile._id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ membershipValidity: validityEdit })
                            });
                            setValidityEdit("");
                            window.location.reload();
                          }}
                        >Save</button>
                      </>
                    ) : (
                      <span>{profile.membershipValidity || "Not set"}</span>
                    )}
                  </dd>
                </div>
              </dl>
            </motion.div>

            {/* Identification Details Card - NEW */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-inner md:col-span-2"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <IdentificationIcon className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                Identification Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-300">Passport Number</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{profile.passportNumber || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-300">Civil ID</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{profile.civilId || 'N/A'}</dd>
                  </div>
                </div>
             
              </div>
            </motion.div>

            {/* Contact Info Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-inner md:col-span-2"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-blue-500" />
                  <span>{profile.email || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-green-500" />
                  <span>Mobile: {profile.mobile || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-green-500" />
                  <span>Office: {profile.officePhone || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <GlobeAltIcon className="w-5 h-5 text-purple-500" />
                  <span>Address: {profile.address || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-green-500" />
                  <span>Alternate Mobile: {profile.alternateMobile || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-blue-500" />
                  <span>Alternate Email: {profile.alternateEmail || 'N/A'}</span>
                </div>
              </div>
            </motion.div>

            {/* Sponsorship Card - NEW */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-inner md:col-span-2"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <UserGroupIcon className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                Sponsorship
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
                {/* Add more sponsorship details if available in your profile data */}
            
                  <div className="space-y-3">
                    {profile.proposer1 && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600 dark:text-gray-300">First Proposer:</dt>
                        <dd className="font-medium text-gray-900 dark:text-white">{profile.proposer1}</dd>
                      </div>
                    )}
                    {profile.proposer2 && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600 dark:text-gray-300">Second Proposer:</dt>
                        <dd className="font-medium text-gray-900 dark:text-white">{profile.proposer2}</dd>
                      </div>
                    )}
                  </div>
               
              </div>
            </motion.div>

            {/* Social Media Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-inner md:col-span-2"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Social Media</h2>
              <div className="flex space-x-6">
                {profile.social?.linkedin && <a href={profile.social.linkedin} className="text-blue-600 hover:text-blue-800">LinkedIn</a>}
                {profile.social?.instagram && <a href={profile.social.instagram} className="text-pink-600 hover:text-pink-800">Instagram</a>}
                {profile.social?.twitter && <a href={profile.social.twitter} className="text-blue-400 hover:text-blue-600">Twitter/X</a>}
                {profile.social?.facebook && <a href={profile.social.facebook} className="text-blue-600 hover:text-blue-800">Facebook</a>}
                {!Object.keys(profile.social || {}).length && <p className="text-gray-500">No social links available</p>}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}