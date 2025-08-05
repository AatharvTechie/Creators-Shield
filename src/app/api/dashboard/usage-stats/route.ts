import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-utils';
import { getUserByEmail } from '@/lib/users-store';
import { getViolationsForUser } from '@/lib/violations-store';
import { getReportsForUser } from '@/lib/reports-store';
import { getScansForUser } from '@/lib/web-scans-store';

export async function GET(req: NextRequest) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify the token
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userEmail = req.nextUrl.searchParams.get('email') || payload.email;
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    // Get user data
    const user = await getUserByEmail(userEmail);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch all usage data in parallel
    const [violations, reports, scans] = await Promise.all([
      getViolationsForUser(user.id),
      getReportsForUser(user.id),
      getScansForUser(user.id)
    ]);

    // Calculate real usage stats
    const usageStats = {
      youtubeChannels: user.youtubeChannelId ? 1 : 0,
      videosMonitored: scans.length,
      violationDetections: violations.length,
      dmcaRequests: reports.length,
      platformsConnected: user.platformsConnected?.length || 0
    };

    return NextResponse.json({
      success: true,
      stats: usageStats,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json({ error: 'Failed to fetch usage stats' }, { status: 500 });
  }
} 