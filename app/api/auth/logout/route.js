// app/api/auth/logout/route.js - Custom logout endpoint to clear session cache
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Pre-compute environment settings for better performance
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax'
    };

    // Fast logout - clear cookies immediately without token validation
    const response = NextResponse.json({ 
      message: 'Logged out successfully',
      redirect: '/login'
    });

    // Batch cookie clearing for better performance
    const cookiesToClear = [
      { name: 'next-auth.session-token', options: cookieOptions },
      { name: 'next-auth.csrf-token', options: cookieOptions },
      { name: 'next-auth.callback-url', options: cookieOptions }
    ];

    // Add secure cookie for production
    if (isProduction) {
      cookiesToClear.push({
        name: '__Secure-next-auth.session-token',
        options: { ...cookieOptions, secure: true, sameSite: 'none' }
      });
    }

    // Clear all cookies at once
    cookiesToClear.forEach(({ name, options }) => {
      response.cookies.set(name, '', options);
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
