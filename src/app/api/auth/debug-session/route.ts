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
        { error: 'No token provided' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Decode JWT
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid JWT token' },
        { status: 401 }
      );
    }
    
    const sessionId = decoded.sessionId;
    const userId = decoded.id;
    const email = decoded.email;
    
    console.log('🔍 Debug session info:', { sessionId, userId, email });
    
    // Get all sessions for this user
    const allSessions = await Session.find({ user: userId }).lean();
    
    // Get specific session by sessionId
    const specificSession = await Session.findOne({ sessionId }).lean();
    
    // Get active sessions
    const activeSessions = await Session.find({ 
      user: userId,
      isActive: { $ne: false },
      expiresAt: { $gt: new Date() }
    }).lean();
    
    const debugInfo = {
      tokenInfo: {
        sessionId,
        userId,
        email,
        role: decoded.role,
        plan: decoded.plan
      },
      sessions: {
        total: allSessions.length,
        specific: specificSession ? {
          id: specificSession._id,
          sessionId: specificSession.sessionId,
          isActive: specificSession.isActive,
          isCurrentSession: specificSession.isCurrentSession,
          expiresAt: specificSession.expiresAt,
          lastActive: specificSession.lastActive
        } : null,
        active: activeSessions.map(s => ({
          id: s._id,
          sessionId: s.sessionId,
          isActive: s.isActive,
          isCurrentSession: s.isCurrentSession,
          expiresAt: s.expiresAt,
          lastActive: s.lastActive
        }))
      },
      currentTime: new Date()
    };
    
    console.log('🔍 Debug session result:', debugInfo);
    
    return NextResponse.json(debugInfo);
    
  } catch (error) {
    console.error('Error debugging session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 