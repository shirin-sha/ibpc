'use client';
import Card from '@/components/Card';
import React, { useEffect, useState } from 'react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    newMembers: 0,
    pendingRegistrations: 0,
    corporateMembers: 0,
    individualMembers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
          Admin Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          title="Total Members" 
          value={stats.totalMembers.toString()} 
          icon="👥" 
        />
        <Card 
          title="New (Last 7 days)" 
          value={stats.newMembers.toString()} 
          icon="📈"
        />
        <Card 
          title="Pending Registrations" 
          value={stats.pendingRegistrations.toString()} 
          icon="⏳"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card 
          title="Corporate Members" 
          value={stats.corporateMembers.toString()} 
          icon="🏢"
        />
        <Card 
          title="Individual Members" 
          value={stats.individualMembers.toString()} 
          icon="👤"
        />
      </div>
    </div>
  )
}

export default AdminDashboard;

