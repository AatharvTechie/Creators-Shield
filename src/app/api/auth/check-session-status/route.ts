import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Session from '@/models/Session';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided in request');
      return NextResponse.json(
        { valid: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    // Decode JWT to get session ID
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (jwtError) {
      console.log('❌ JWT verification failed:', jwtError);
      return NextResponse.json(
        { valid: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    const sessionId = decoded.sessionId;
    const userId = decoded.id;
    
    console.log('🔍 Checking session:', { sessionId, userId });
    
    if (!sessionId) {
      console.log('❌ No session ID in token');
      return NextResponse.json(
        { valid: false, message: 'No session ID in token' },
        { status: 401 }
      );
    }

    // First, try to find session by sessionId
    let session = await Session.findOne({ 
      sessionId: sessionId,
      isActive: { $ne: false },
      expiresAt: { $gt: new Date() } // Check if session hasn't expired
    }).exec();

    console.log('🔍 Session lookup result:', {
      found: !!session,
      sessionId: sessionId,
      sessionExists: !!session,
      isActive: session?.isActive,
      expiresAt: session?.expiresAt,
      currentTime: new Date()
    });

    if (!session) {
      // If session not found by sessionId, try to find any active session for this user
      console.log('🔍 Session not found by sessionId, checking for any active session for user');
      session = await Session.findOne({ 
        user: userId,
        isActive: { $ne: false },
        expiresAt: { $gt: new Date() }
      }).exec();
      
      if (session) {
        console.log('✅ Found active session for user, but sessionId mismatch. Updating sessionId...');
        // Update the session with the correct sessionId from token
        await Session.updateOne(
          { _id: session._id },
          { sessionId: sessionId }
        );
        session.sessionId = sessionId;
      }
    }

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

    // Update last active time
    await Session.updateOne(
      { _id: session._id },
      { lastActive: new Date() }
    );

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