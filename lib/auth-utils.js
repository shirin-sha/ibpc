// lib/auth-utils.js - Authentication utility functions
import { signOut } from 'next-auth/react';

/**
 * Direct logout without confirmation dialog
 * @param {Object} options - Logout options
 * @param {string} options.callbackUrl - The URL to redirect to after logout
 */
export const directLogout = async (options = {}) => {
  const { callbackUrl = '/login' } = options;
  
  try {
    // Call our custom logout API to clear server-side session cache
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Custom logout API failed:', error);
    // Continue anyway
  }
  
  // Clear NextAuth cookies manually
  document.cookie = 'next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  // Redirect immediately - NextAuth will handle URL resolution with NEXTAUTH_URL
  window.location.href = callbackUrl;
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
