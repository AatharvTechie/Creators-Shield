import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Platform from '@/models/Platform';
import DisableRequest from '@/models/DisableRequest';
import { verifyToken } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get user from JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { platform, reason } = await req.json();

    if (!platform || !reason) {
      return NextResponse.json({ 
        error: 'Platform and reason are required' 
      }, { status: 400 });
    }

    // Check if platform is currently connected
    const platformConnection = await Platform.findOne({ 
      userId: payload.email, 
      platform, 
      status: 'connected' 
    });

    if (!platformConnection) {
      return NextResponse.json({ 
        error: 'Platform is not currently connected' 
      }, { status: 400 });
    }

    // Check if there's already a pending request
    const existingRequest = await DisableRequest.findOne({
      userId: payload.email,
      platform,
      status: 'pending'
    });

    if (existingRequest) {
      return NextResponse.json({ 
        error: 'You already have a pending disable request for this platform' 
      }, { status: 400 });
    }

    // Create disable request
    const disableRequest = new DisableRequest({
      userId: payload.email,
      platform,
      reason,
      status: 'pending'
    });

    await disableRequest.save();

    // Update platform status to pending_disable
    await Platform.findOneAndUpdate(
      { userId: payload.email, platform },
      { status: 'pending_disable' }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Disable request submitted successfully. Waiting for admin approval.',
      requestId: disableRequest._id
    });

  } catch (error) {
    console.error('Error creating disable request:', error);
    return NextResponse.json({ 
      error: 'Failed to create disable request' 
    }, { status: 500 });
  }
} 