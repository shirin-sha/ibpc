'use client';
import { useEffect, useState } from 'react';
import MembersTable from '@/components/MembersTable';
import Layout from '@/components/Layout';
import { useSession } from 'next-auth/react';

export default function Directory() {
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState('');
 const { data: session, status } = useSession(); 
  useEffect(() => {
    fetch(`/api/users${query ? `?q=${encodeURIComponent(query)}` : ''}`)
     .then(res => res.json())
      .then(data => {
        // Filter out admins (assuming each user has a 'role' field)
        const filteredMembers = data.filter(user => user.role !== 'admin');
        setMembers(filteredMembers);
      });
  }, [query]);

  return (
    <Layout>
        {console.log('Session Data:', session)} 
          <MembersTable members={members} isAdmin={session?.user?.role=='admin'}/>
    
    </Layout>
  );
}