'use client';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon, GlobeAltIcon, PencilIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import Image from 'next/image';

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
        const res = await fetch(`/api/users/${id}`, {
          cache: 'no-store' // Always fetch fresh data
        });
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
    if (id) fetchProfile();
  }, [id, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderBottomColor: '#061E3E' }}></div>
    </div>
  );

  if (!profile) return <div className="text-center py-10">Profile not found</div>;

  return (
    <div>
      <div>
        {/* Back Button */}
        <Link 
          href={session?.user?.id === id ? "/member" : "/member/directory"} 
          className="inline-flex items-center text-gray-600 hover:text-blue-800 dark:text-gray-400 dark:hover:text-gray-300 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          {session?.user?.id === id ? "BACK TO DASHBOARD" : "BACK TO MEMBERS"}
        </Link>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="relative h-48" style={{ background: '#061E3E' }}>
            {/* Edit Icon - Only visible when viewing own profile */}
            {session?.user?.id === id && (
              <Link 
                href={`/member/profile/edit/${id}`}
                className="absolute bottom-6 right-6 p-3 bg-white hover:bg-gray-50 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl group"
                title="Edit Profile"
              >
                <PencilIcon className="w-8 h-8 group-hover:scale-110 transition-transform duration-200" style={{ color: '#061E3E' }} />
              </Link>
            )}
            <div className="absolute bottom-0 left-8 transform translate-y-1/2">
              <img
                src={profile.photo || '/logo.png'}
                alt={profile.name}
                loading="eager"
                className="w-50 h-50 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover"
              />
            </div>
          </div>

          {/* Name and Basic Info */}
          <div className="pt-30 pb-6 px-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
              {profile.profession} at {profile.companyName}
            </p>
            <div className="flex gap-4 mt-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Member ID: <span className="font-medium text-gray-700 dark:text-gray-300">{profile.memberId || 'N/A'}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
              Serial No.: <span className="font-medium text-gray-700 dark:text-gray-300">{profile.uniqueId || 'N/A'}</span>
              </p>
            </div>
          </div>

          {/* Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-8 pb-8">
            {/* About Section */}
            {profile.about && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-inner md:col-span-2">
                <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-gray-300 dark:border-gray-600" style={{ color: '#061E3E' }}>About</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profile.about}</p>
              </div>
            )}

            {/* Personal Info Card */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-inner">
              <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-gray-300 dark:border-gray-600" style={{ color: '#061E3E' }}>Personal Information</h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm items-baseline">
               <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap">Full Name:</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{profile.name || 'N/A'}</dd>
                
              
                <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap">Profession:</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{profile.profession || 'N/A'}</dd>
                
                <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap">Nationality:</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{profile.nationality || 'N/A'}</dd>
                
                <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap">Membership Type:</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{profile.membershipType || 'N/A'}</dd>
                <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap">Membership Validity:</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{profile.membershipValidity || "Not set"}</dd>
                
                {isAdmin && (
                  <>
                    <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap">Passport Number:</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{profile.passportNumber || 'N/A'}</dd>
                    
                    <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap">Civil ID:</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{profile.civilId || 'N/A'}</dd>
                    
                    <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap">Sponsor Name:</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{profile.sponsorName || 'N/A'}</dd>
                  </>
                )}
              </dl>
            </div>

            {/* Company Info Card */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-inner">
              <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-gray-300 dark:border-gray-600" style={{ color: '#061E3E' }}>Company Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Section - Company Details */}
                <div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm items-baseline">
                    <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap">Company Name:</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{profile.companyName || 'N/A'}</dd>
                    
                    <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap">Business Activity:</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{profile.businessActivity || 'N/A'}</dd>
                    
                    <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap self-start">Company Brief:</dt>
                    <dd className="text-gray-900 dark:text-white">{profile.companyBrief || 'N/A'}</dd>
                    
                    <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap">Company Address:</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{profile.companyAddress || 'N/A'}</dd>
                    
                    <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap">Company Website:</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{profile.companyWebsite || 'N/A'}</dd>
                    
                    <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap">Industry Sector:</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{profile.industrySector || 'N/A'}</dd>
                    
                    {profile.alternateIndustrySector && (
                      <>
                        <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap">Alternate Sector:</dt>
                        <dd className="font-medium text-gray-900 dark:text-white">{profile.alternateIndustrySector}</dd>
                      </>
                    )}
                    
                 
                  </dl>
                </div>
                
                {/* Right Section - Company Logo */}
                <div className="flex flex-col items-center justify-center">
                  {profile.logo && (
                    <div className="text-center">
                      <img
                        src={profile.logo}
                        alt={`${profile.companyName} Logo`}
                        className="w-24 h-24 object-contain bg-white rounded-lg border border-gray-200 shadow-md mx-auto mb-3"
                        loading="lazy"
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Company Logo</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{profile.companyName}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>


            {/* Contact Info Card */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-inner md:col-span-2">
              <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-gray-300 dark:border-gray-600" style={{ color: '#061E3E' }}>Contact Details</h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm items-baseline">
                <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4 text-blue-500" />
                  Email:
                </dt>
                <dd className="font-medium text-gray-900 dark:text-white">{profile.email || 'N/A'}</dd>
                
                <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-green-500" />
                  Mobile:
                </dt>
                <dd className="font-medium text-gray-900 dark:text-white">{profile.mobile || 'N/A'}</dd>
                
                <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-green-500" />
                  Office Phone:
                </dt>
                <dd className="font-medium text-gray-900 dark:text-white">{profile.officePhone || 'N/A'}</dd>
                
                <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap flex items-center gap-2">
                  <GlobeAltIcon className="w-4 h-4 text-purple-500" />
                  Address:
                </dt>
                <dd className="font-medium text-gray-900 dark:text-white">{profile.address || 'N/A'}</dd>
                
                <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-green-500" />
                  Alternate Mobile:
                </dt>
                <dd className="font-medium text-gray-900 dark:text-white">{profile.alternateMobile || 'N/A'}</dd>
                
                <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4 text-blue-500" />
                  Alternate Email:
                </dt>
                <dd className="font-medium text-gray-900 dark:text-white">{profile.alternateEmail || 'N/A'}</dd>
              </dl>
            </div>

            {/* Sponsorship Card - NEW */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-inner md:col-span-2">
              <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-gray-300 dark:border-gray-600" style={{ color: '#061E3E' }}>
                Sponsorship
              </h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm items-baseline">
                {profile.proposer1 && (
                  <>
                    <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap">First Proposer:</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{profile.proposer1}</dd>
                  </>
                )}
                {profile.proposer2 && (
                  <>
                    <dt className="text-gray-600 dark:text-gray-300 whitespace-nowrap">Second Proposer:</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{profile.proposer2}</dd>
                  </>
                )}
              </dl>
            </div>

            {/* Social Media Card */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow-inner md:col-span-2">
              <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-gray-300 dark:border-gray-600" style={{ color: '#061E3E' }}>Social Media</h2>
              <div className="flex space-x-6">
                {profile.social?.linkedin && <a href={profile.social.linkedin} className="text-blue-600 hover:text-blue-800">LinkedIn</a>}
                {profile.social?.instagram && <a href={profile.social.instagram} className="text-pink-600 hover:text-pink-800">Instagram</a>}
                {profile.social?.twitter && <a href={profile.social.twitter} className="text-blue-400 hover:text-blue-600">Twitter/X</a>}
                {profile.social?.facebook && <a href={profile.social.facebook} className="text-blue-600 hover:text-blue-800">Facebook</a>}
                {!Object.keys(profile.social || {}).length && <p className="text-gray-500">No social links available</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}