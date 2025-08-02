import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Creator from '@/models/Creator';
import Session from '@/models/Session';
import { verifyToken } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    console.log('🔌 Attempting to connect to database...');
    await connectToDatabase();
    console.log('✅ Database connected successfully');
    
    // Get user from JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    console.log('🔍 Verifying token...');
    const payload = await verifyToken(token);
    if (!payload) {
      console.log('❌ Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('✅ Token verified for user:', payload.email);

    const { userAgent, device } = await req.json();
    
    // Find the user
    console.log('🔍 Finding user in database...');
    const user = await Creator.findOne({ email: payload.email });
    if (!user) {
      console.log('❌ User not found for email:', payload.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('✅ User found:', user._id);

    // Generate a unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create or update session
    console.log('🔍 Creating/updating session...');
    const session = await Session.findOneAndUpdate(
      { 
        user: user._id,
        userAgent: userAgent,
        device: device || 'Unknown Device'
      },
      {
        sessionId,
        device: device || 'Unknown Device',
        userAgent,
        lastActive: new Date(),
        isCurrentSession: true
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    console.log('✅ Session created successfully:', session.sessionId);

    return NextResponse.json({ 
      success: true, 
      sessionId: session.sessionId,
      message: 'Session created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating session:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        return NextResponse.json({ 
          error: 'Database connection failed' 
        }, { status: 500 });
      }
      if (error.message.includes('MongoNetworkError')) {
        return NextResponse.json({ 
          error: 'Database network error' 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to create session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 