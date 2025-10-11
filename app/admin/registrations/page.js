'use client';
import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Lazy load the heavy RegistrationTable component
const RegistrationTable = dynamic(() => import('@/components/RegistrationRequests'), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: '#061E3E' }}></div>
      <span className="ml-3 text-gray-600">Loading registrations...</span>
    </div>
  ),
  ssr: false // Disable SSR for this component since it's heavy
});

export default function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/register');
      const data = await res.json();
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: '#061E3E' }}></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    }>
      <RegistrationTable
        data={registrations}
        refreshData={fetchRegistrations}
        loading={loading}
      />
    </Suspense>
  );
}