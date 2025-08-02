import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-utils';
import connectToDatabase from '@/lib/mongodb';
import Creator from '@/models/Creator';

export async function GET(req: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify the token
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Connect to database to get full user data
    await connectToDatabase();
    
    // Find user in database
    const user = await Creator.findOne({ email: payload.email }).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user data (excluding sensitive information)
    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: payload.role,
      plan: user.plan,
      planExpiry: user.planExpiry,
      youtubeChannelId: user.youtubeChannelId,
      youtubeChannel: user.youtubeChannel,
      disconnectApproved: user.disconnectApproved,
      status: user.status
    });

  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.json({ 
      error: 'Token verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 