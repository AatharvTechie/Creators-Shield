import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { email, resetAll, logoutFromAllDevices } = await request.json();
    
    if (!email || !resetAll || !logoutFromAllDevices) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.email !== email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await connectToDatabase();

    // Reset all platform connections
    await db.collection('creators').updateOne(
      { email },
      { 
        $set: { 
          youtubeChannelId: null,
          youtubeChannel: null,
          disconnectApproved: false,
          lastConnectionReset: new Date()
        }
      }
    );

    // Invalidate all sessions for this user
    await db.collection('sessions').deleteMany({ userEmail: email });

    // Log the reset action
    await db.collection('activity_logs').insertOne({
      userEmail: email,
      action: 'reset_all_connections',
      timestamp: new Date(),
      details: {
        resetAll,
        logoutFromAllDevices,
        ipAddress: request.headers.get('x-forwarded-for') || request.ip
      }
    });

    return NextResponse.json({
      success: true,
      message: 'All connections have been reset and you have been logged out from all devices'
    });

  } catch (error) {
    console.error('Reset connections error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 