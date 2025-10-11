// middleware.js (root of project) - Optimized for performance
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Cache for session tokens (shorter duration for development)
const sessionCache = new Map();
const CACHE_DURATION = process.env.NODE_ENV === 'development' ? 2 * 60 * 1000 : 5 * 60 * 1000; // 2 min for dev, 5 min for prod

// Performance monitoring (only in development)
const performanceMetrics = process.env.NODE_ENV === 'development' ? {
  requests: 0,
  cacheHits: 0,
  cacheMisses: 0,
} : null;

// Log performance metrics every 100 requests (development only)
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    if (performanceMetrics.requests > 0) {
      console.log('Middleware Performance:', {
        totalRequests: performanceMetrics.requests,
        cacheHitRate: (performanceMetrics.cacheHits / performanceMetrics.requests * 100).toFixed(2) + '%',
        cacheMisses: performanceMetrics.cacheMisses,
      });
      // Reset metrics
      performanceMetrics.requests = 0;
      performanceMetrics.cacheHits = 0;
      performanceMetrics.cacheMisses = 0;
    }
  }, 30000); // Log every 30 seconds in development
}

export async function middleware(req) {
  if (process.env.NODE_ENV === 'development') {
    performanceMetrics.requests++;
  }
  
  const startTime = performance.now();
  const url = req.nextUrl.pathname;

  // Skip middleware for static assets and API routes that don't need auth
  if (
    url.startsWith('/_next') ||
    url.startsWith('/favicon.ico') ||
    url.startsWith('/api/auth') ||
    url.includes('.') // Static files
  ) {
    return NextResponse.next();
  }

  try {
    // Check cache first
    const cacheKey = req.headers.get('authorization') || req.cookies.toString();
    const cachedSession = sessionCache.get(cacheKey);
    
    let session;
    if (cachedSession && (Date.now() - cachedSession.timestamp) < CACHE_DURATION) {
      session = cachedSession.session;
      if (process.env.NODE_ENV === 'development') {
        performanceMetrics.cacheHits++;
      }
    } else {
      // Get session token with shorter maxAge for development
      const maxAge = process.env.NODE_ENV === 'development' ? 60 * 60 * 24 : 60 * 60 * 24 * 7; // 1 day for dev, 7 days for prod
      session = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET,
        maxAge: maxAge,
      });
      
      // Cache the session
      sessionCache.set(cacheKey, {
        session,
        timestamp: Date.now(),
      });
      if (process.env.NODE_ENV === 'development') {
        performanceMetrics.cacheMisses++;
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

// Config: Apply middleware only to these routes (prevents running on static files, etc.)
export const config = {
  matcher: [
    '/member/:path*',          // Protect all member routes
    '/admin/:path*',           // Protect all admin routes
    '/api/users/:path*',       // Protect user APIs
    '/api/registrations/:path*', // Protect registration APIs
    '/login',                  // Handle login redirects
    '/register',               // Handle register redirects
  ],
};