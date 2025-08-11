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
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    let isCancelled = false;
    async function fetchPage(currentPage, currentSize) {
      const res = await fetch(`/api/users?page=${currentPage}&size=${currentSize}${query ? `&q=${encodeURIComponent(query)}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    }

    async function load() {
      try {
        setLoading(true);
        if (size === 'all') {
          // Fetch first page with max size 100 to learn totals
          const first = await fetchPage(1, 100);
          if (isCancelled) return;
          let combined = first.data || [];
          const totalCount = first.total || 0;
          setTotal(totalCount);
          if (first.totalPages > 1) {
            const pagePromises = [];
            for (let p = 2; p <= first.totalPages; p++) {
              pagePromises.push(fetchPage(p, 100));
            }
            const pages = await Promise.all(pagePromises);
            if (isCancelled) return;
            for (const payload of pages) {
              combined = combined.concat(payload.data || []);
            }
          }
          setMembers(combined);
          setPage(1);
          setTotalPages(1);
        } else {
          const payload = await fetchPage(page, size);
          if (isCancelled) return;
          setMembers(payload.data || []);
          setTotalPages(payload.totalPages || 1);
          setTotal(payload.total || 0);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error(err);
          setMembers([]);
          setTotalPages(1);
          setTotal(0);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    load();
    return () => {
      isCancelled = true;
    };
  }, [query, page, size]);

  return (
    <div>
      
      <MembersTable
        members={members}
        isAdmin={session?.user?.role === 'admin'}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        size={size}
        onSizeChange={(newSize) => { setPage(1); setSize(newSize); }}
        totalCount={total}
      />
    </div>
  );
}