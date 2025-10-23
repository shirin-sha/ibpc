// lib/auth-utils.js - Authentication utility functions
import { signOut } from 'next-auth/react';

/**
 * Direct logout without confirmation dialog
 * @param {Object} options - Logout options
 * @param {string} options.callbackUrl - The URL to redirect to after logout
 */
// Pre-compute environment flags for better performance
const isProduction = process.env.NODE_ENV === 'production';
const secureFlag = isProduction ? '; secure' : '';
const sameSiteFlag = isProduction ? '; samesite=none' : '; samesite=lax';

export const directLogout = async (options = {}) => {
  const { callbackUrl = '/login' } = options;
  
  // Clear cookies immediately for instant logout
  const cookieExpiry = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
  
  // Batch cookie clearing for better performance
  const cookiesToClear = [
    `next-auth.session-token=; ${cookieExpiry};${secureFlag}${sameSiteFlag}`,
    `next-auth.csrf-token=; ${cookieExpiry};${secureFlag}${sameSiteFlag}`,
    `next-auth.callback-url=; ${cookieExpiry};${secureFlag}${sameSiteFlag}`
  ];
  
  // Add secure cookie for production
  if (isProduction) {
    cookiesToClear.push('__Secure-next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=none');
  }
  
  // Clear all cookies at once
  cookiesToClear.forEach(cookie => {
    document.cookie = cookie;
  });
  
  // Non-blocking API call with timeout for server-side cleanup
  const apiCall = fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }).catch(error => {
    console.error('Custom logout API failed:', error);
  });
  
  // Redirect immediately without waiting for API
  window.location.href = callbackUrl;
  
  // Optional: Wait for API with timeout (non-blocking)
  Promise.race([
    apiCall,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
  ]).catch(() => {
    // Silent fail - logout already completed
  });
};

/**
 * Handles logout with proper URL resolution and session clearing
 * @param {Object} options - SignOut options
 * @param {string} options.callbackUrl - The URL to redirect to after logout
 * @param {boolean} options.redirect - Whether to redirect automatically
 */
export const handleLogout = async (options = {}) => {
  const { callbackUrl = '/login', redirect = true } = options;
  
  // Use direct logout to avoid confirmation dialog
  if (redirect) {
    return directLogout({ callbackUrl });
  }
  
  // For non-redirecting logout, use NextAuth (simplified)
  return signOut({ 
    callbackUrl: callbackUrl, 
    redirect: false 
  });
};

// Simplified auth utilities - NEXTAUTH_URL handles URL resolution
