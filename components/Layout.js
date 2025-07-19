'use client';
import { SessionProvider } from 'next-auth/react';
import Header from './Header'; // Assuming this is your Header component (adjust path if needed)

export default function DashboardLayout({ children }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}