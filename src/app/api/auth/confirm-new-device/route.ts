import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { email, deviceInfo } = await request.json();
    
    if (!email || !deviceInfo) {
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

    // Update the session to mark device as confirmed
    await db.collection('sessions').updateOne(
      { 
        userEmail: email,
        'deviceInfo.timestamp': deviceInfo.timestamp
      },
      { 
        $set: { 
          isConfirmed: true,
          confirmedAt: new Date()
        }
      }
    );

    // Log the device confirmation
    await db.collection('activity_logs').insertOne({
      userEmail: email,
      action: 'new_device_confirmed',
      timestamp: new Date(),
      details: {
        deviceInfo,
        ipAddress: request.headers.get('x-forwarded-for') || request.ip
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Device confirmed successfully'
    });

  } catch (error) {
    console.error('Confirm new device error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 