import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Platform from '@/models/Platform';
import { verifyToken } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
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

    // Get all platforms for user
    const platforms = await Platform.find({ userId: payload.email }).lean();
    
    // Determine active platform
    const activePlatform = platforms.find(p => p.status === 'connected');
    
    const result = {
      activePlatform: activePlatform?.platform || null,
      platforms: platforms.map(p => ({
        platform: p.platform,
        status: p.status,
        connectedAt: p.connectedAt,
        data: p.data
      }))
    };

    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error('Error fetching platform status:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch platform status' 
    }, { status: 500 });
  }
} 