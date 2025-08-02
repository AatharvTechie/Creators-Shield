import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Platform from '@/models/Platform';
import { verifyToken } from '@/lib/auth-utils';
import { getChannelStats } from '@/lib/services/youtube-service';

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

    const { platform, accountId } = await req.json();

    if (!platform || !accountId) {
      return NextResponse.json({ 
        error: 'Platform and account ID are required' 
      }, { status: 400 });
    }

    // Check if user already has an active platform
    const existingActive = await Platform.findOne({ 
      userId: payload.email, 
      status: 'connected' 
    });

    if (existingActive && existingActive.platform !== platform) {
      return NextResponse.json({ 
        error: 'You already have an active platform. Please disable it first.' 
      }, { status: 400 });
    }

    let platformData;

    // Fetch platform-specific data
    if (platform === 'youtube') {
      const youtubeData = await getChannelStats(accountId);
      platformData = {
        channelId: youtubeData.id,
        subscribers: youtubeData.subscribers,
        views: youtubeData.views,
        videos: youtubeData.videos
      };
    } else {
      return NextResponse.json({ 
        error: 'Unsupported platform. Only YouTube is currently supported.' 
      }, { status: 400 });
    }

    // Disable all other platforms for this user
    await Platform.updateMany(
      { userId: payload.email },
      { status: 'disabled' }
    );

    // Create or update platform connection
    await Platform.findOneAndUpdate(
      { userId: payload.email, platform },
      {
        status: 'connected',
        data: platformData,
        connectedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: `${platform} connected successfully`,
      data: platformData
    });

  } catch (error) {
    console.error('Error connecting platform:', error);
    return NextResponse.json({ 
      error: 'Failed to connect platform' 
    }, { status: 500 });
  }
} 