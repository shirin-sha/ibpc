// lib/auth-utils.js - Authentication utility functions
import { signOut } from 'next-auth/react';

/**
 * Handles logout with proper URL resolution for both development and production
 * @param {Object} options - SignOut options
 * @param {string} options.callbackUrl - The URL to redirect to after logout
 * @param {boolean} options.redirect - Whether to redirect automatically
 */
export const handleLogout = (options = {}) => {
  const { callbackUrl = '/login', redirect = true } = options;
  
  // Get the current origin to ensure proper redirect in production
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Build the full callback URL
  const fullCallbackUrl = callbackUrl.startsWith('http') 
    ? callbackUrl 
    : currentOrigin 
      ? `${currentOrigin}${callbackUrl}` 
      : callbackUrl;
  
  console.log('Logout redirect URL:', fullCallbackUrl);
  
  // Perform logout with proper URL
  return signOut({ 
    callbackUrl: fullCallbackUrl, 
    redirect 
  });
};

/**
 * Gets the proper base URL for the current environment
 * @returns {string} The base URL
 */
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server-side: use environment variable or default
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

/**
 * Builds a full URL from a path
 * @param {string} path - The path to build URL from
 * @returns {string} The full URL
 */
export const buildUrl = (path) => {
  const baseUrl = getBaseUrl();
  return path.startsWith('http') ? path : `${baseUrl}${path}`;
};
