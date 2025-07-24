'use client';
import { useEffect, useState } from 'react';
import MembersTable from '@/components/MembersTable';
import { useSession } from 'next-auth/react';

export default function Directory() {
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/users${query ? `?q=${encodeURIComponent(query)}` : ''}`)
      .then(res => res.json())
      .then(data => {
        const filteredMembers = data.filter(user => user.role !== 'admin');
        setMembers(filteredMembers);
      })
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <MembersTable
      members={members}
      isAdmin={session?.user?.role === 'admin'}
      loading={loading}
    />
  );
}