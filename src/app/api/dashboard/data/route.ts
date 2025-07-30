import { NextRequest, NextResponse } from 'next/server';
import { getDashboardData } from '@/app/dashboard/actions';

export async function GET(req: NextRequest) {
  try {
    const userEmail = req.nextUrl.searchParams.get('email');
    
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