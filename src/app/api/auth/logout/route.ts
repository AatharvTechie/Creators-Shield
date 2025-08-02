import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Session from '@/models/Session';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function POST(req: Request) {
  try {
    // Get the token from cookies
    const token = req.cookies.get('creator_jwt')?.value || req.cookies.get('admin_jwt')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }
    
    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      await connectToDatabase();
      
      // Remove the current session
      await Session.deleteOne({ 
        user: decoded.id,
        isCurrentSession: true 
      });
      
      console.log(`Session removed for user ${decoded.email}`);
      
      // Create response
      const response = NextResponse.json({ success: true });
      
      // Clear the JWT cookie
      response.cookies.set('creator_jwt', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      });
      
      response.cookies.set('admin_jwt', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      });
      
      return response;
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 