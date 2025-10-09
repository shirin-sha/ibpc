'use client';
import { useState, Suspense } from "react";
import dynamic from 'next/dynamic';

// Lazy load the heavy RegistrationStepper component
const RegistrationStepper = dynamic(() => import("@/components/RegistrationStepper"), {
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>
  ),
  ssr: false
});

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-700 to-slate-900">
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Thank you for registering!</h1>
            <p className="text-gray-600">
              We have received your application. Our team will review your details, and if approved, you will receive an email with your Unique ID and login credentials.
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-700 to-slate-900 px-1">
      <div className="w-full max-w-5xl">
        <div className="bg-white rounded-2xl shadow-xl py-3 px-2">
          <RegistrationStepper onComplete={() => setSubmitted(true)} />
        </div>
      </div>
    </div>
  );
}
