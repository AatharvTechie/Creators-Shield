import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Session from '@/models/Session';
import Creator from '@/models/Creator';

export async function POST(request: NextRequest) {
  try {
    const { userEmail, sessionId, targetDeviceInfo } = await request.json();
    
    if (!userEmail || !sessionId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Get user ID
    const user = await Creator.findOne({ email: userEmail }).exec();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Delete the specific session
    const result = await Session.deleteOne({
      user: user._id,
      sessionId: sessionId
    }).exec();

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    console.log(`🔒 Device logged out: ${targetDeviceInfo?.device || 'Unknown'} for user ${userEmail}`);

    return NextResponse.json({
      success: true,
      message: 'Device logged out successfully',
      loggedOutDevice: targetDeviceInfo
    });

  } catch (error) {
    console.error('Error logging out device:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 