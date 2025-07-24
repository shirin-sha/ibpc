'use client';
import { useEffect, useState } from 'react';
import RegistrationTable from '@/components/RegistrationRequests';

export default function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    setLoading(true); // Make sure to set loading true before fetching
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
    <RegistrationTable
      data={registrations}
      refreshData={fetchRegistrations}
      loading={loading} // Pass loading state
    />
  );
}