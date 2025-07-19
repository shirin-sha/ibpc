'use client';
import Layout from '@/components/Layout';
import { useEffect, useState } from 'react';
import RegistrationTable from '@/components/RegistrationRequests';

export default function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch('/api/register');
      const data = await res.json();
      setRegistrations(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setLoading(false);
    }
  };

  // Fetch all registrations on mount
  useEffect(() => {
    fetchRegistrations();
  }, []);
  return (
    <Layout>
      <RegistrationTable data={registrations} refreshData={fetchRegistrations} />
    </Layout>
  );
}