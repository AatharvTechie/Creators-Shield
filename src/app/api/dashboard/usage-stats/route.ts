import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Creator from '@/models/Creator';
import Violation from '@/models/Violation';
import Strike from '@/models/Strike';
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
    
    // Verify token
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    console.log('✅ Token verified for user:', payload.email);
    
    // Get user from database
    const user = await Creator.findOne({ email: payload.email }).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Calculate usage statistics
    const stats = {
      youtubeChannels: user.youtubeChannelId ? 1 : 0,
      videosMonitored: 0, // This would be calculated from monitored videos
      violationDetections: 0,
      dmcaRequests: 0,
      platformsConnected: user.platformsConnected?.length || 0
    };
    
    // Get violation detections count
    const violations = await Violation.countDocuments({ 
      creatorId: user._id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });
    stats.violationDetections = violations;
    
    // Get DMCA requests count
    const strikes = await Strike.countDocuments({ 
      creatorId: user._id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });
    stats.dmcaRequests = strikes;
    
    // Get videos monitored count (this would be from a videos collection)
    // For now, we'll estimate based on violations
    stats.videosMonitored = Math.min(violations * 2, 50); // Rough estimate
    
    return NextResponse.json({ 
      success: true, 
      stats 
    });
    
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch usage statistics' 
    }, { status: 500 });
  }
} 