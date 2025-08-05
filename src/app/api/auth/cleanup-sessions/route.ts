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
    
    const userId = decoded.id;
    const sessionId = decoded.sessionId;
    
    console.log('🧹 Cleaning up sessions for user:', userId);
    
    // Mark all sessions for this user as not current
    await Session.updateMany(
      { user: userId },
      { isCurrentSession: false }
    );
    
    // Mark expired sessions as inactive
    await Session.updateMany(
      { 
        user: userId,
        expiresAt: { $lt: new Date() }
      },
      { isActive: false }
    );
    
    // Create or update current session
    let currentSession = await Session.findOne({ 
      user: userId,
      sessionId: sessionId
    });
    
    if (currentSession) {
      // Update existing session
      await Session.updateOne(
        { _id: currentSession._id },
        {
          $set: {
            isCurrentSession: true,
            isActive: true,
            lastActive: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
          }
        }
      );
      console.log('✅ Updated existing session');
    } else {
      // Create new session
      await Session.create({
        user: userId,
        sessionId: sessionId,
        isCurrentSession: true,
        isActive: true,
        lastActive: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
      console.log('✅ Created new session');
    }
    
    // Get cleanup results
    const activeSessions = await Session.find({ 
      user: userId,
      isActive: { $ne: false },
      expiresAt: { $gt: new Date() }
    }).lean();
    
    const cleanupResult = {
      message: 'Session cleanup completed',
      activeSessions: activeSessions.length,
      currentSessionId: sessionId
    };
    
    console.log('🧹 Cleanup result:', cleanupResult);
    
    return NextResponse.json(cleanupResult);
    
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 