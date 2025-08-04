import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import { DeviceInfo } from '@/lib/device-detection';

export async function POST(request: NextRequest) {
  try {
    const { userEmail, deviceInfo } = await request.json();
    
    if (!userEmail || !deviceInfo) {
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
    
    if (decoded.email !== userEmail) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await connectToDatabase();

    // Check if this device fingerprint already exists for this user
    const existingSession = await db.collection('device_sessions').findOne({
      userEmail,
      'deviceInfo.fingerprint': deviceInfo.fingerprint,
      isActive: true
    });

    if (existingSession) {
      // Update last activity
      await db.collection('device_sessions').updateOne(
        { _id: existingSession._id },
        { $set: { lastActivity: new Date() } }
      );

      return NextResponse.json({
        success: true,
        isNewDevice: false,
        message: 'Device already known'
      });
    }

    // Check if we have any recent sessions for this user (within last 30 days)
    const recentSessions = await db.collection('device_sessions').find({
      userEmail,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      isActive: true
    }).toArray();

    // If this is the first device or no recent sessions, it's not a new device
    if (recentSessions.length === 0) {
      return NextResponse.json({
        success: true,
        isNewDevice: false,
        message: 'First device login'
      });
    }

    // Check for similar devices (same browser + OS combination)
    const similarDevice = recentSessions.find(session => 
      session.deviceInfo.browser === deviceInfo.browser &&
      session.deviceInfo.os === deviceInfo.os
    );

    if (similarDevice) {
      // Update the similar device's activity
      await db.collection('device_sessions').updateOne(
        { _id: similarDevice._id },
        { $set: { lastActivity: new Date() } }
      );

      return NextResponse.json({
        success: true,
        isNewDevice: false,
        message: 'Similar device found'
      });
    }

    // This is truly a new device
    return NextResponse.json({
      success: true,
      isNewDevice: true,
      message: 'New device detected'
    });

  } catch (error) {
    console.error('Check device sessions error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 