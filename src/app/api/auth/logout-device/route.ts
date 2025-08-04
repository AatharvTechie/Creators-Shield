import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Session from '@/models/Session';
import Creator from '@/models/Creator';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { userEmail, sessionId, targetDeviceInfo } = await request.json();
    
    console.log('🔍 Logout device request:', { userEmail, sessionId, targetDeviceInfo });
    
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

    console.log('🔍 User found:', user._id);

    // Handle special case for current device logout
    if (sessionId === 'current') {
      // Get the current session ID from the request headers
      const token = request.headers.get('authorization')?.replace('Bearer ', '');
      if (!token) {
        return NextResponse.json(
          { success: false, message: 'No authorization token found' },
          { status: 401 }
        );
      }

      // Decode JWT to get current session ID
      const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const currentSessionId = decoded.sessionId;
        
        if (!currentSessionId) {
          return NextResponse.json(
            { success: false, message: 'No current session ID found' },
            { status: 400 }
          );
        }

        console.log('🔍 Deleting current session:', currentSessionId);

        // Delete the current session
        const result = await Session.deleteOne({
          user: user._id,
          sessionId: currentSessionId
        }).exec();

        console.log('🔍 Current session delete result:', result);

        if (result.deletedCount === 0) {
          return NextResponse.json(
            { success: false, message: 'Current session not found' },
            { status: 404 }
          );
        }

        console.log(`🔒 Current device logged out for user ${userEmail}`);
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError);
        return NextResponse.json(
          { success: false, message: 'Invalid authorization token' },
          { status: 401 }
        );
      }
    } else {
      // For device logout, we need to work with device_sessions collection
      console.log('🔍 Deleting device session:', sessionId);
      
      let deviceDeleted = false;
      
      // First try to delete from device_sessions collection
      const mongoose = await import('mongoose');
      const db = mongoose.connection.db;
      if (db) {
        const deviceSessionResult = await db.collection('device_sessions').deleteOne({
          userEmail: userEmail,
          'deviceInfo.deviceId': sessionId
        });

        console.log('🔍 Device session delete result:', deviceSessionResult);
        deviceDeleted = deviceSessionResult.deletedCount > 0;
      }

      // Also try to delete from sessions collection if it exists
      const sessionResult = await Session.deleteOne({
        user: user._id,
        sessionId: sessionId
      }).exec();

      console.log('🔍 Session delete result:', sessionResult);

      // If neither was found, return error
      if (!deviceDeleted && sessionResult.deletedCount === 0) {
        return NextResponse.json(
          { success: false, message: 'Session not found' },
          { status: 404 }
        );
      }
    }

    console.log(`🔒 Device logged out: ${targetDeviceInfo?.device || 'Unknown'} for user ${userEmail}`);

    // Force logout by invalidating the session
    // This will make the device's JWT token invalid on next request
    try {
      // Update the session to mark it as logged out
      await Session.updateOne(
        { user: user._id, sessionId: sessionId },
        { 
          isActive: false,
          loggedOutAt: new Date(),
          lastActive: new Date()
        }
      ).exec();
    } catch (error) {
      console.log('Session update failed (may not exist):', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Device logged out successfully',
      loggedOutDevice: targetDeviceInfo,
      forceLogout: true
    });

  } catch (error) {
    console.error('Error logging out device:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 