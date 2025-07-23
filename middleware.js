// middleware.js (root of project)
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt'; // For session checking in middleware

export async function middleware(req) {
  // Get session token (works with NextAuth)
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Define protected routes
  const protectedPaths = ['/dashboard', '/api/users', '/api/registrations']; // Add your protected routes/APIs here

  // Check if the current path is protected
  const isProtected = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));

  if (isProtected && !session) {
    // Redirect unauthenticated users to login
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', encodeURI(req.url)); // Redirect back after login
    return NextResponse.redirect(loginUrl);
  }

  // Role-based protection (example: admin-only routes)
  if (req.nextUrl.pathname.startsWith('/dashboard/admin') && session?.role !== 'admin') {
    // Redirect non-admins to dashboard or home
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If authenticated and authorized, proceed
  return NextResponse.next();
}

// Config: Apply middleware only to these routes (prevents running on static files, etc.)
export const config = {
  matcher: [
    '/dashboard/:path*',      // Protect all dashboard routes
    '/api/users/:path*',       // Protect user APIs
    '/api/registrations/:path*', // Protect registration APIs
    // Add more matchers as needed (e.g., '/api/payments/:path*')
  ],
};