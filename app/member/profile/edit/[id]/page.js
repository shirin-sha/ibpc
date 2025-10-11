'use client';
import { useState, useEffect, useCallback } from 'react';
import ProfileForm from '@/components/ProfileForm';
import { useSession } from "next-auth/react";
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { data: session, status } = useSession();
    
    const params = useParams();
    let id = params.id;

    // Create a refetch function
    const fetchUser = useCallback(() => {
        if (!id) return;

        setLoading(true);
        setError(null);

        fetch(`/api/users/${id}`, {
            cache: 'no-store' // Always fetch fresh data
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Fetch failed with status ${res.status}: ${res.statusText}`);
                }
                return res.json();
            })
            .then(data => {
                if (data.error) {
                    throw new Error(data.error);
                }
                setUser(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Fetch Error:', err.message);
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        if (status === 'loading' || !id) {
            return;
        }

        fetchUser();
    }, [id, status, fetchUser]);

    if (status === 'loading' || loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderBottomColor: '#061E3E' }}></div>
        </div>
    );
    if (error) return <div>Error: {error} (Check console for details or try refreshing)</div>;
    if (!session || !user) return <div>Error: Unable to load profile. Please log in again.</div>;

    const isAdmin = session?.user?.role === 'admin';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">EDIT PROFILE</h1>
            <ProfileForm user={user} isAdmin={isAdmin} onSaveSuccess={fetchUser} />
        </div>
    );
}