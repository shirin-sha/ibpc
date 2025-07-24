'use client';
import React from 'react';
import MembersTable from '@/components/MembersTable';
import { useSession } from 'next-auth/react';
import useApi from '@/lib/hooks/useApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Directory() {
  const { data: session } = useSession();
  
  const { 
    data: members = [], 
    loading, 
    error, 
    refetch 
  } = useApi('/api/users', {
    onSuccess: (data) => {
      // Filter out admin users on the client side for better caching
      return data ? data.filter(user => user.role !== 'admin') : [];
    }
  });

  // Filter members to exclude admins with null checks
  const filteredMembers = members ? members.filter(user => user.role !== 'admin') : [];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-600 dark:text-red-400 text-lg font-medium">
            Failed to load members
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {error}
          </p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Members Directory
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Browse and manage member profiles
          </p>
        </div>
      </div>

      <MembersTable
        members={filteredMembers}
        isAdmin={session?.user?.role === 'admin'}
        loading={loading}
        onRefresh={refetch}
      />
    </div>
  );
}