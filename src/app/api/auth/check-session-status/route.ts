import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Session from '@/models/Session';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    // Decode JWT to get session ID
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const sessionId = decoded.sessionId;
    
    if (!sessionId) {
      return NextResponse.json(
        { valid: false, message: 'No session ID in token' },
        { status: 401 }
      );
    }

    // Check if session exists and is active
    const session = await Session.findOne({ 
      sessionId: sessionId,
      isActive: { $ne: false } // Session is active if isActive is not explicitly false
    }).exec();

    if (!session) {
      console.log('❌ Session not found or logged out:', sessionId);
      return NextResponse.json(
        { 
          valid: false, 
          message: 'Session has been logged out',
          forceLogout: true
        },
        { status: 401 }
      );
    }

    console.log('✅ Session is valid:', sessionId);
    return NextResponse.json({
      valid: true,
      sessionId: sessionId,
      lastActive: session.lastActive
    });

  } catch (error) {
    console.error('Error checking session status:', error);
    return NextResponse.json(
      { valid: false, message: 'Invalid token' },
      { status: 401 }
    );
  }
} 