'use client';
import RegistrationStepper from "@/components/RegistrationStepper";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (form) => {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) setSubmitted(true);
    else console.log("Error submitting registration:", res.statusText);
  };

  if (submitted)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-700 to-slate-900">
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Thank you for registering!</h1>
            <p className="text-gray-600">We have received your application. Our team will review and contact you soon.</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-700 to-slate-900 px-1">
      <div className="w-full max-w-5xl">
        <div className="bg-white rounded-2xl shadow-xl py-3 px-2">
          <RegistrationStepper onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
