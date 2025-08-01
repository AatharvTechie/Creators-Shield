import { NextRequest, NextResponse } from 'next/server';
import { getDashboardData } from '@/app/dashboard/actions';
import { verifyToken } from '@/lib/auth-utils';

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

    const dashboardData = await getDashboardData(userEmail);
    
    if (!dashboardData) {
      return NextResponse.json({ error: 'User not found or no data available' }, { status: 404 });
    }

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
} 