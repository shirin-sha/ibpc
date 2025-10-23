'use client';
import { useState, Suspense, useEffect } from "react";
import dynamic from 'next/dynamic';

// Preload critical components
const preloadComponents = () => {
  if (typeof window !== 'undefined') {
    import('@/components/FormComponents');
    import('@/components/IndustrySectorSelect');
  }
};

// Optimized lazy loading with better loading state and preloading
const RegistrationStepper = dynamic(() => import("@/components/RegistrationStepper"), {
  loading: () => <RegistrationFormSkeleton />,
  ssr: false
});

// Lightweight skeleton component for better perceived performance
function RegistrationFormSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10">
      <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8 animate-pulse"></div>
      
      {/* Stepper skeleton */}
      <div className="mb-4">
        <div className="hidden md:block relative">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[calc(100%-100px)] h-0.5 bg-gray-200"></div>
          <div className="relative flex justify-between">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="flex flex-col items-center z-10">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="mt-1 h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl px-10 py-4 md:px-12 md:py-6">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="grid gap-3 md:grid-cols-2">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);

  // Preload components on mount for faster subsequent renders
  useEffect(() => {
    preloadComponents();
  }, []);

  if (submitted)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #061E3E, #0a2f5e)' }}>
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
    <div className="min-h-screen flex items-center justify-center px-1" style={{ background: 'linear-gradient(to bottom right, #061E3E, #0a2f5e)' }}>
      <div className="w-full max-w-5xl">
        <div className="bg-white rounded-2xl shadow-xl py-3 px-2">
          <RegistrationStepper onComplete={() => setSubmitted(true)} />
        </div>
      </div>
    </div>
  );
}
