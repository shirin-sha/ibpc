'use client';
import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';

const MembersTable = dynamic(() => import('@/components/MembersTable'), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: '#061E3E' }}></div>
      <span className="ml-3 text-gray-600">Loading members...</span>
    </div>
  ),
  ssr: false // Disable SSR for this component since it's heavy
});

export default function Directory() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 20
  });

  const fetchMembers = async (newFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', newFilters.page);
      params.append('limit', newFilters.limit);
      if (newFilters.search) params.append('search', newFilters.search);
      
      const res = await fetch(`/api/users?${params.toString()}`, {
        cache: 'force-cache', // Use cached data
        next: { revalidate: 60 } // Revalidate every minute
      });
      const data = await res.json();
      
      setMembers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }; // Reset to page 1
    setFilters(updatedFilters);
    fetchMembers(updatedFilters);
  };

  const handlePageChange = (page) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchMembers(updatedFilters);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div>
      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: '#061E3E' }}></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      }>
        <MembersTable
          data={members}
          refreshData={() => fetchMembers(filters)}
          loading={loading}
          pagination={pagination}
          filters={filters}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
        />
      </Suspense>
    </div>
  );
}