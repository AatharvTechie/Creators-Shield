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

    // Check if this device session already exists
    const existingSession = await db.collection('device_sessions').findOne({
      userEmail,
      'deviceInfo.fingerprint': deviceInfo.fingerprint
    });

    if (existingSession) {
      // Update existing session
      await db.collection('device_sessions').updateOne(
        { _id: existingSession._id },
        {
          $set: {
            lastActivity: new Date(),
            isActive: true,
            'deviceInfo.timestamp': new Date(),
            'deviceInfo.ipAddress': deviceInfo.ipAddress,
            'deviceInfo.location': deviceInfo.location
          }
        }
      );
    } else {
      // Create new device session
      await db.collection('device_sessions').insertOne({
        userEmail,
        deviceInfo: {
          ...deviceInfo,
          timestamp: new Date()
        },
        isActive: true,
        lastActivity: new Date(),
        createdAt: new Date(),
        isConfirmed: false
      });
    }

    // Log the device session
    await db.collection('activity_logs').insertOne({
      userEmail,
      action: 'device_session_created',
      timestamp: new Date(),
      details: {
        deviceInfo,
        ipAddress: request.headers.get('x-forwarded-for') || request.ip
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Device session saved successfully'
    });

  } catch (error) {
    console.error('Save device session error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 