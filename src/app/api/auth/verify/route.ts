import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function GET(req: Request) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ 
        error: 'No token provided',
        message: 'Authentication token is required.'
      }, { status: 401 });
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    
    console.log('✅ Token verified for user:', {
      id: payload.id,
      email: payload.email,
      role: payload.role
    });
    
    return NextResponse.json({ 
      success: true,
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        plan: payload.plan
      }
    });
    
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ 
      error: 'Invalid token',
      message: 'The provided authentication token is invalid or expired.'
    }, { status: 401 });
  }
} 