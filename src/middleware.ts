
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import connectToDatabase from '@/lib/mongodb';
import Session from '@/models/Session';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/admin',
  '/api/dashboard',
  '/api/settings',
  '/api/payment'
];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/google',
  '/api/auth/google/callback',
  '/api/auth/[...nextauth]',
  '/api/webhooks',
  '/api/test'
];

// Routes that should update session activity
const SESSION_UPDATE_ROUTES = [
  '/dashboard',
  '/api/dashboard',
  '/api/settings',
  '/api/payment'
];

async function updateSessionActivity(userId: string, sessionId?: string) {
  try {
    // Only run in production or when explicitly needed
    if (process.env.NODE_ENV === 'development') {
      return;
    }
    
    await connectToDatabase();
    
    // Update last active time for current session
    if (sessionId) {
      await Session.updateOne(
        { user: userId, sessionId },
        { lastActive: new Date() }
      );
    } else {
      // Update the current session (isCurrentSession: true)
      await Session.updateOne(
        { user: userId, isCurrentSession: true },
        { lastActive: new Date() }
      );
    }
  } catch (error) {
    console.error('Error updating session activity:', error);
  }
}

async function checkSessionExpiration(userId: string) {
  try {
    // Only run in production or when explicitly needed
    if (process.env.NODE_ENV === 'development') {
      return;
    }
    
    await connectToDatabase();
    
    // Remove expired sessions
    const expiredSessions = await Session.find({
      user: userId,
      expiresAt: { $lt: new Date() }
    });
    
    if (expiredSessions.length > 0) {
      await Session.deleteMany({
        user: userId,
        expiresAt: { $lt: new Date() }
      });
      console.log(`Removed ${expiredSessions.length} expired sessions for user ${userId}`);
    }
  } catch (error) {
    console.error('Error checking session expiration:', error);
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  console.log('🔒 Middleware checking:', pathname);
  
  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    console.log('✅ Public route, allowing access');
    return NextResponse.next();
  }
  
  // Check if it's a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  
  if (!isProtectedRoute) {
    console.log('✅ Non-protected route, allowing access');
    return NextResponse.next();
  }
  
  // For API routes, we need to check authentication
  if (pathname.startsWith('/api/')) {
    console.log('🔒 API route detected, checking authentication');
  }
  
  console.log('🔒 Protected route detected, checking authentication');
  
  // Get JWT token from cookies, headers, or localStorage (via custom header)
  const token = req.cookies.get('creator_jwt')?.value || 
                req.headers.get('authorization')?.replace('Bearer ', '') ||
                req.cookies.get('admin_jwt')?.value ||
                req.headers.get('x-auth-token');
  
  if (!token) {
    console.log('❌ No token found, redirecting to login');
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  try {
    // Verify JWT token
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    
    console.log('✅ Token verified for user:', {
      id: payload.id,
      email: payload.email,
      role: payload.role
    });
    
    // Check session expiration for creators
    if (payload.role === 'creator') {
      try {
        await checkSessionExpiration(payload.id as string);
        
        // Update session activity for session update routes
        if (SESSION_UPDATE_ROUTES.some(route => pathname.startsWith(route))) {
          await updateSessionActivity(payload.id as string);
        }
      } catch (error) {
        console.error('Error in session management:', error);
        // Continue with the request even if session management fails
      }
    }
    
    // Check if user is suspended or deactivated
    if (payload.role === 'creator') {
      // For creator routes, check if they have a plan (except for /plans route)
      if (pathname.startsWith('/dashboard') && !payload.plan) {
        console.log('❌ Creator has no plan, redirecting to plans');
        return NextResponse.redirect(new URL('/plans', req.url));
      }
    }
    
    // Add user info to headers for use in components
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', payload.id as string);
    requestHeaders.set('x-user-email', payload.email as string);
    requestHeaders.set('x-user-role', payload.role as string);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
  } catch (error) {
    console.log('❌ Invalid token:', error);
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  // Match all routes except for API, static files, and image optimization
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
