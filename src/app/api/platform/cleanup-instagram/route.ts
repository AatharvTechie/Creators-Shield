import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Platform from '@/models/Platform';
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

    // Remove any existing Instagram connections for this user
    const result = await Platform.deleteMany({ 
      userId: payload.email,
      platform: 'instagram'
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Removed ${result.deletedCount} Instagram connections`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error cleaning up Instagram connections:', error);
    return NextResponse.json({ 
      error: 'Failed to cleanup Instagram connections' 
    }, { status: 500 });
  }
} 