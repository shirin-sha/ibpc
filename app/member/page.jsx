'use client';
import Card from '@/components/Card';
import { useSession } from 'next-auth/react';
import React from 'react';
import Link from 'next/link';

const MemberDashboard = () => {
  const { data: session } = useSession(); 
  return (
    <div className="container mx-auto p-6">
      {/* Heading */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Member Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <Card 
          value={
            <>
              <p className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
                Welcome, {session?.user?.name || 'Member'}!
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                You're all set to manage your profile and access member data.
              </p>
              <div className="flex items-center gap-3">
                <Link 
                  href={`/member/profile/${session?.user?.id || ''}`}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  aria-label="View Profile"
                >
                  View Profile
                </Link>
                <Link 
                  href={`/member/profile/edit/${session?.user?.id || ''}`}
                  className="inline-flex items-center justify-center rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 text-xs font-semibold px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  aria-label="Edit Profile"
                >
                  Edit Profile
                </Link>
              </div>
            </>
          }
          icon="👋"
          className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-lg p-4"
        />

        {/* Explore Members Directory Card */}
        <Card
          value={
            <>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Explore Members Directory
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Connect with IBPC members and access their professional details. Build stronger
                networks, discover opportunities, and grow within IBPC vibrant business community.
              </p>
              <Link
                href="/member/directory"
                className="inline-flex items-center justify-center rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                aria-label="View Members"
              >
                View Members
              </Link>
            </>
          }
          icon="🧭"
          className="border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl shadow-lg p-4"
        />

        {/* Profile Status Card */}
        <Card 
          value={
            <>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Profile is complete
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                All required fields are filled.
              </p>
            </>
          }
          icon="📄"
          className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-xl shadow-lg p-4"
        />

        {/* Recent Activity Card */}
        <Card 
          value={
            <>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• Updated profile on 2025-04-05</li>
                <li>• Joined the "Community Group" on 2025-04-03</li>
                <li>• Viewed member directory on 2025-04-01</li>
              </ul>
            </>
          }
          icon="🔄"
          className="border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20 rounded-xl shadow-lg p-4"
        />
      </div>
    </div>
  );
};

export default MemberDashboard;

