'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';

const MembersTable = dynamic(() => import('@/components/MembersTable'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      <span className="ml-3 text-gray-600">Loading members...</span>
    </div>
  ),
});

export default function Directory() {
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/users?page=${page}&size=20${query ? `&q=${encodeURIComponent(query)}` : ''}`)
      .then(res => res.json())
      .then(payload => {
        setMembers(payload.data || []);
        setTotalPages(payload.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }, [query, page]);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4">
        <input
          value={query}
          onChange={(e) => { setPage(1); setQuery(e.target.value); }}
          placeholder="Search members"
          className="w-full sm:w-80 px-3 py-2 border rounded"
        />
      </div>
      <MembersTable
        members={members}
        isAdmin={session?.user?.role === 'admin'}
        loading={loading}
      />
      <div className="flex items-center justify-center gap-2 my-4">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page <= 1 || loading}
        >Prev</button>
        <span className="text-sm">Page {page} of {totalPages}</span>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages || loading}
        >Next</button>
      </div>
    </div>
  );
}