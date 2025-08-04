
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

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
  '/api/test',
  '/api/get-user',
  '/api/auth/create-session'
];

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
    
    // Check if session is still valid (not logged out)
    if (payload.sessionId) {
      try {
        // Import mongoose and check session status
        const mongoose = await import('mongoose');
        const Session = mongoose.model('Session', new mongoose.Schema({
          sessionId: String,
          isActive: { type: Boolean, default: true },
          loggedOutAt: Date
        }));
        
        const session = await Session.findOne({ 
          sessionId: payload.sessionId,
          isActive: true 
        }).exec();
        
        if (!session) {
          console.log('❌ Session has been logged out, forcing logout');
          // Clear the token and redirect to login
          const response = NextResponse.redirect(new URL('/auth/login', req.url));
          response.cookies.delete('creator_jwt');
          response.cookies.delete('admin_jwt');
          return response;
        }
      } catch (sessionError) {
        console.log('Session validation failed:', sessionError);
        // Continue if session validation fails
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
