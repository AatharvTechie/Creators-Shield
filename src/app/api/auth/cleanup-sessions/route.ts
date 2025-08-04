import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Session from '@/models/Session';
import Creator from '@/models/Creator';

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();
    
    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: 'Missing user email' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Get user ID using Creator model
    const user = await Creator.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // 1. Remove expired sessions using Session model
    const expiredSessions = await Session.deleteMany({
      user: user._id,
      expiresAt: { $lt: new Date() }
    });

    console.log(`🧹 Removed ${expiredSessions.deletedCount} expired sessions for user ${userEmail}`);

    // 2. Ensure only one session per device (keep the most recent)
    const sessions = await Session.find({
      user: user._id,
      expiresAt: { $gt: new Date() }
    }).lean();

    // Group sessions by device
    const deviceGroups = {};
    sessions.forEach(session => {
      const deviceKey = `${session.device}-${session.browser}-${session.os}`;
      if (!deviceGroups[deviceKey]) {
        deviceGroups[deviceKey] = [];
      }
      deviceGroups[deviceKey].push(session);
    });

    // Keep only the most recent session per device
    let removedDuplicates = 0;
    for (const deviceKey in deviceGroups) {
      const deviceSessions = deviceGroups[deviceKey];
      if (deviceSessions.length > 1) {
        // Sort by lastActive (most recent first)
        deviceSessions.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
        
        // Keep the most recent, remove others
        const sessionsToRemove = deviceSessions.slice(1);
        const sessionIdsToRemove = sessionsToRemove.map(s => s._id);
        
        await Session.deleteMany({
          _id: { $in: sessionIdsToRemove }
        });
        
        removedDuplicates += sessionsToRemove.length;
      }
    }

    console.log(`🧹 Removed ${removedDuplicates} duplicate sessions for user ${userEmail}`);

    return NextResponse.json({
      success: true,
      message: 'Sessions cleaned up successfully',
      removedExpired: expiredSessions.deletedCount,
      removedDuplicates: removedDuplicates
    });

  } catch (error) {
    console.error('Session cleanup error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 