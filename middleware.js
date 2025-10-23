// middleware.js (root of project) - Optimized for production performance
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Optimized cache with size limit and TTL cleanup
class SessionCache {
  constructor(maxSize = 1000, ttl = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.lastCleanup = Date.now();
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Check if expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.session;
  }

  set(key, session) {
    // Cleanup old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }
    
    this.cache.set(key, {
      session,
      timestamp: Date.now(),
    });
  }

  // Method to invalidate a specific session
  invalidate(key) {
    this.cache.delete(key);
  }

  // Method to invalidate all sessions (for logout)
  invalidateAll() {
    this.cache.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Create cache instance with environment-specific TTL for better logout responsiveness
const isProduction = process.env.NODE_ENV === 'production';
const sessionCache = new SessionCache(1000, isProduction ? 30 * 1000 : 1 * 60 * 1000); // 30s for prod, 1min for dev

// Performance monitoring (development only)
const performanceMetrics = process.env.NODE_ENV === 'development' ? {
  requests: 0,
  cacheHits: 0,
  cacheMisses: 0,
} : null;

// Log performance metrics (development only)
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    if (performanceMetrics.requests > 0) {
      console.log('Middleware Performance:', {
        totalRequests: performanceMetrics.requests,
        cacheHitRate: (performanceMetrics.cacheHits / performanceMetrics.requests * 100).toFixed(2) + '%',
        cacheMisses: performanceMetrics.cacheMisses,
        cacheSize: sessionCache.cache.size,
      });
      // Reset metrics
      performanceMetrics.requests = 0;
      performanceMetrics.cacheHits = 0;
      performanceMetrics.cacheMisses = 0;
    }
  }, 30000);
}

export async function middleware(req) {
  if (process.env.NODE_ENV === 'development') {
    performanceMetrics.requests++;
  }
  
  const startTime = performance.now();
  const url = req.nextUrl.pathname;

  // Skip middleware for static assets, public routes, and API routes that don't need auth
  if (
    url.startsWith('/_next') ||
    url.startsWith('/favicon.ico') ||
    url.startsWith('/api/auth') ||
    url.startsWith('/api/files') || // Skip file serving API
    url === '/register' || // Skip register page - it's public
    url === '/login' || // Skip login page - it's public
    url.includes('.') // Static files
  ) {
    return NextResponse.next();
  }

  try {
    // Check if this is a logout request (no session token cookie)
    const sessionToken = req.cookies.get('next-auth.session-token')?.value;
    
    // If no session token, clear ALL cached sessions for better logout handling
    if (!sessionToken) {
      // Clear all cached sessions to ensure proper logout in production
      sessionCache.invalidateAll();
    }
    
    // Create efficient cache key from session token only
    const authHeader = req.headers.get('authorization');
    const cacheKey = authHeader ? authHeader.slice(0, 50) : sessionToken?.slice(0, 20) || 'no-session';
    
    let session = sessionCache.get(cacheKey);
    
    if (!session) {
      // Get session token with optimized settings for faster login redirects
      session = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        // Add timeout for faster failure detection
        secureCookie: process.env.NODE_ENV === 'production',
      });
      
      // Cache the session immediately for faster subsequent requests
      if (session) {
        sessionCache.set(cacheKey, session);
      }
      
      if (process.env.NODE_ENV === 'development') {
        performanceMetrics.cacheMisses++;
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        performanceMetrics.cacheHits++;
      }
    }

    // Define protected routes - Updated for new structure
    const protectedPaths = ['/member', '/admin', '/api/users', '/api/registrations'];
    const isProtected = protectedPaths.some(path => url.startsWith(path));

    if (isProtected && !session) {
      // Redirect unauthenticated users to login
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', encodeURI(req.url));
      
      const response = NextResponse.redirect(loginUrl);
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      return response;
    }

    // Role-based protection - Updated for new structure
    if (url.startsWith('/admin') && session?.role !== 'admin') {
      const response = NextResponse.redirect(new URL('/member', req.url));
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      return response;
    }

    // Add performance headers (development only)
    const response = NextResponse.next();
    if (process.env.NODE_ENV === 'development') {
      response.headers.set('X-Response-Time', `${(performance.now() - startTime).toFixed(2)}ms`);
    }
    
    // Add caching headers for static content (shorter duration for development)
    if ((url.startsWith('/member') || url.startsWith('/admin')) && session) {
      const cacheDuration = process.env.NODE_ENV === 'development' ? 60 : 300; // 1 min for dev, 5 min for prod
      response.headers.set('Cache-Control', `private, max-age=${cacheDuration}, stale-while-revalidate=${cacheDuration * 2}`);
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error, allow the request to proceed but log it
    const response = NextResponse.next();
    if (process.env.NODE_ENV === 'development') {
      response.headers.set('X-Middleware-Error', 'true');
    }
    return response;
  }
}

// Config: Apply middleware only to specific protected routes
export const config = {
  matcher: [
    '/member/:path*',          // Protect all member routes
    '/admin/:path*',           // Protect all admin routes
    '/api/users/:path*',       // Protect user APIs
    '/api/registrations/:path*', // Protect registration APIs
  ],
};