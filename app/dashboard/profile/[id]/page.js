'use client';
import { useState, useEffect } from 'react';
import ProfileForm from '@/components/ProfileForm';
import { useSession } from "next-auth/react";
import { useParams } from 'next/navigation';  // Import for URL params
import Layout from '@/components/Layout';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);  // New: For handling fetch errors (e.g., 404)
    const [loading, setLoading] = useState(true);
    const { data: session, status } = useSession();  // Include 'status' to handle loading reliably
    
    const params = useParams();  // Get dynamic params from URL
    let id = params.id;  // Use ID from URL params (e.g., /profile/[id])
    
    // Fallback to session ID if no URL param is provided (e.g., for current user's profile)
    // if (!id && session?.user?.id) {
    //     id = session.user.id;
    // }

    useEffect(() => {
        if (status === 'loading' || !id) {
            console.log('Waiting for session to load or ID from URL. ID not ready yet:', id);  // Debug log
            return;  // Skip fetch until id is available
        }

        // Optional: Security check (e.g., only allow admins to view other profiles)
        // const isAdmin = session?.user?.role === 'admin';
        // const isSelf = id === session?.user?.id;
        // if (!isAdmin && !isSelf) {
        //     setError('Forbidden: You can only view your own profile.');
        //     setLoading(false);
        //     return;
        // }

        console.log('Fetching user with ID:', id);  // Debug log

        setLoading(true);  // Reset loading state
        setError(null);    // Clear previous errors

        fetch(`/api/users/${id}`)
            .then(res => {
                if (!res.ok) {
                    // Handle non-200 responses (e.g., 404, 401, 403)
                    throw new Error(`Fetch failed with status ${res.status}: ${res.statusText}`);
                }
                return res.json();
            })
            .then(data => {
                if (data.error) {
                    throw new Error(data.error);  // Handle API-specific errors (e.g., "User not found")
                }
                setUser(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Fetch Error:', err.message);  // Log for debugging
                setError(err.message);  // Store error for UI display
                setLoading(false);
            });
    }, [id, status]);  // Depend on id and status to re-run when they change

    // Optional: Debug session changes (uncomment if needed)
    // useEffect(() => {
    //     console.log('Session updated:', session);
    // }, [session]);

    // Handle loading, error, and unauthenticated states
    if (status === 'loading' || loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error} (Check console for details or try refreshing)</div>;
    if (!session || !user) return <div>Error: Unable to load profile. Please log in again.</div>;

    const isAdmin = session?.user?.role === 'admin';  // Dynamic based on session

    return (
        <Layout>
            <div className="max-w-4xl mx-auto my-8 bg-white shadow-lg rounded-xl p-8 border border-gray-200">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">My Profile</h1>
                <ProfileForm user={user} isAdmin={isAdmin} />
            </div>
        </Layout>
    );
}