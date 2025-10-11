'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link'; // Added for the registration link
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid'; // or /outline

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await signIn('credentials', { 
      email, 
      password, 
      redirect: false 
    });

    if (res?.error) {
      toast.error(res.error);
      setLoading(false);
      return;
    }

    if (res.ok) {
      toast.success('Logged in');
      router.push(email === 'admin@ibpc.com' ? '/admin' : '/member');
    }
  } catch (error) {
    toast.error('An error occurred');
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #061E3E, #0a2f5e)' }}>
      <div className="w-full max-w-md -mt-20"> {/* Added negative margin to adjust vertical position */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo and Header */}
          <div className="text-center mb-6"> {/* Reduced bottom margin */}
           <div className="inline-flex items-center justify-center w-20 h-20 rounded-full  ">
            {/* Replace with actual image path if needed */}
            <img src="/logo.png" alt="IBPC Logo" className="w-20 h-20" />
          </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back</h2>
            {/* <p className="text-sm text-gray-600">Continue to IBPC Admin</p> */}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5"> {/* Slightly reduced spacing */}
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-1 focus:border-gray-400
                         placeholder-gray-400"
                style={{ focusRingColor: '#061E3E' }}
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password Field */}
    <div>
  <label className="block text-sm font-medium text-gray-700 mb-1.5">
    Password
  </label>
  <div className="relative">
    <input
      type={showPassword ? 'text' : 'password'}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm
               focus:outline-none focus:ring-1 focus:border-gray-400
               placeholder-gray-400"
      placeholder="Enter your password"
      required
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
    >
      {showPassword ? (
        <EyeSlashIcon className="h-5 w-5" />
      ) : (
        <EyeIcon className="h-5 w-5" />
      )}
    </button>
  </div>
</div>


            {/* Submit Button */}
         <button
  type="submit"
  disabled={loading}
  className={`cursor-pointer w-full text-white py-2.5 px-4 rounded-lg 
             transition-colors duration-200 font-medium mt-2 
             ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
  style={{ backgroundColor: '#061E3E' }}
>
  {loading ? 'Logging in...' : 'Log in'}
</button>

          </form>

          {/* Registration Link */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium hover:underline" style={{ color: '#061E3E' }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}