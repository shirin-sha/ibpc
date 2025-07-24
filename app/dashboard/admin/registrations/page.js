'use client';
import React from 'react';
import RegistrationTable from '@/components/RegistrationRequests';
import useApi from '@/lib/hooks/useApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Registrations() {
  const { 
    data: registrations = [], 
    loading, 
    error, 
    refetch 
  } = useApi('/api/register');

  const pendingCount = registrations ? registrations.filter(reg => reg.status === 'Pending').length : 0;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto" />
          <div className="text-red-600 dark:text-red-400 text-lg font-medium">
            Failed to load registrations
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ClockIcon className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Registration Requests
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review and manage membership applications
            </p>
          </div>
        </div>
        
        {pendingCount > 0 && (
          <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-lg">
            <span className="font-medium">{pendingCount}</span> pending review{pendingCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Registration Table */}
      <RegistrationTable
        data={registrations}
        refreshData={refetch}
        loading={loading}
      />
    </div>
  );
}