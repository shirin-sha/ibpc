// app/api/auth/logout/route.js - Custom logout endpoint to clear session cache
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Fast logout - clear cookies immediately without token validation
    const response = NextResponse.json({ 
      message: 'Logged out successfully',
      redirect: '/login'
    });

    // Clear the NextAuth session cookie
    response.cookies.set('next-auth.session-token', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    // Also clear the CSRF token cookie
    response.cookies.set('next-auth.csrf-token', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    // Clear callback URL cookie if it exists
    response.cookies.set('next-auth.callback-url', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ 
      error: 'Logout failed',
      message: error.message 
    }, { status: 500 });
  }
}
