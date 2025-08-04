import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
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
    const userEmail = decoded.email;

    const { db } = await connectToDatabase();

    // Get current device info
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
    
    // Simple device detection
    const deviceInfo = {
      deviceName: getDeviceName(userAgent),
      browser: getBrowser(userAgent),
      os: getOS(userAgent),
      location: 'Unknown', // Could be enhanced with IP geolocation
      timestamp: new Date(),
      userAgent,
      ipAddress
    };

    // Check if this is a new device by looking at recent sessions
    const recentSession = await db.collection('sessions').findOne({
      userEmail,
      deviceInfo: {
        $regex: new RegExp(deviceInfo.browser + '.*' + deviceInfo.os, 'i')
      }
    }, {
      sort: { createdAt: -1 }
    });

    if (!recentSession) {
      // This is a new device - log it and return device info
      await db.collection('sessions').insertOne({
        userEmail,
        deviceInfo,
        createdAt: new Date(),
        isNewDevice: true
      });

      return NextResponse.json({
        success: true,
        isNewDevice: true,
        deviceInfo
      });
    }

    return NextResponse.json({
      success: true,
      isNewDevice: false,
      deviceInfo: null
    });

  } catch (error) {
    console.error('Check new device error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getDeviceName(userAgent: string): string {
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('Android')) return 'Android Device';
  if (userAgent.includes('Macintosh')) return 'Mac';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Linux')) return 'Linux PC';
  return 'Unknown Device';
}

function getBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown Browser';
}

function getOS(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS X')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown OS';
} 