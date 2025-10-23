'use client';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Form persistence - load saved email
  useEffect(() => {
    const savedEmail = localStorage.getItem('loginEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);


  // Form validation
  const isFormValid = useMemo(() => {
    return email.trim() && password.trim() && emailRegex.test(email.trim());
  }, [email, password]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Clear any previous error messages
    setErrorMessage('');
    
    // Validate form
    if (!isFormValid) {
      setErrorMessage('Please enter a valid email and password.');
      return;
    }

    setLoading(true);

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      console.log('Attempting login for:', email.trim().toLowerCase()); // Debug log
      
      const res = await signIn('credentials', { 
        email: email.trim().toLowerCase(), // Sanitize and normalize email
        password, 
        redirect: false 
      });

      clearTimeout(timeoutId);
      
      console.log('Login response:', res); // Debug log

      // Handle different response scenarios
      if (res?.error) {
        // Handle NextAuth's default error messages
        switch (res.error) {
          case 'CredentialsSignin':
            setErrorMessage('Invalid email or password. Please check your credentials and try again.');
            break;
          case 'CallbackRouteError':
            setErrorMessage('Authentication failed. Please try again.');
            break;
          case 'Configuration':
            setErrorMessage('Authentication configuration error. Please contact support.');
            break;
          case 'AccessDenied':
            setErrorMessage('Access denied. Please check your credentials.');
            break;
          case 'Verification':
            setErrorMessage('Verification failed. Please try again.');
            break;
          default:
            setErrorMessage(res.error);
        }
        return;
      }

      if (res?.ok === true) {
        // Save email for next time
        localStorage.setItem('loginEmail', email.trim());
        
        toast.success('Logged in successfully!');
        router.push(email.trim().toLowerCase() === 'admin@ibpc.com' ? '/admin' : '/member');
      } else if (res?.ok === false) {
        // Handle invalid credentials or other authentication failures
        setErrorMessage('Invalid email or password. Please check your credentials and try again.');
        console.log('Login failed - invalid credentials:', res); // Debug log
        return;
      } else if (!res) {
        // Handle case where NextAuth returns undefined/null
        setErrorMessage('Invalid email or password. Please check your credentials and try again.');
        console.log('Login failed - no response:', res); // Debug log
        return;
      } else {
        // Handle unexpected response format
        setErrorMessage('Login failed. Please try again.');
        console.log('Unexpected login response:', res); // Debug log
        return;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setErrorMessage('Login request timed out. Please check your connection and try again.');
      } else {
        console.error('Login error:', error);
        setErrorMessage('An error occurred during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [email, password, isFormValid, router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && isFormValid && !loading) {
        handleSubmit(e);
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleSubmit, isFormValid, loading]);

  // Memoized input handlers for better performance
  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
  }, [errorMessage]);

  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
  }, [errorMessage]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                      <button
                        type="button"
                        onClick={() => setErrorMessage('')}
                        className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                      >
                        <span className="sr-only">Dismiss</span>
                        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder-gray-400 transition-colors"
                placeholder="Enter your email"
                required
                autoComplete="email"
                autoFocus
                aria-describedby="email-error"
              />
              {email && !emailRegex.test(email.trim()) && (
                <p id="email-error" className="mt-1 text-sm text-red-600">
                  Please enter a valid email address
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full px-3.5 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           placeholder-gray-400 transition-colors"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  aria-describedby="password-error"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 
                           cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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
              disabled={loading || !isFormValid}
              className={`w-full text-white py-2.5 px-4 rounded-lg transition-all duration-200 font-medium mt-2
                         ${loading || !isFormValid 
                           ? 'opacity-60 cursor-not-allowed bg-gray-400' 
                           : 'hover:opacity-90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
              style={{ backgroundColor: loading || !isFormValid ? '#9CA3AF' : '#061E3E' }}
              aria-describedby="submit-help"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Log in'
              )}
            </button>
            
            {/* Submit Help Text */}
            <p id="submit-help" className="text-xs text-gray-500 text-center mt-2">
              {!isFormValid ? 'Please enter valid email and password' : 'Press Enter to log in'}
            </p>

          </form>

          {/* Registration Link */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{' '}
            <Link 
              href="/register" 
              className="font-medium hover:underline" 
              style={{ color: '#061E3E' }}
              prefetch={true}
              onMouseEnter={() => {
                // Preload the registration component and related assets on hover
                Promise.all([
                  import('@/components/RegistrationStepper'),
                  import('@/components/FormComponents'),
                  import('@/components/IndustrySectorSelect')
                ]).catch(() => {}); // Silent fail for preloading
              }}
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}