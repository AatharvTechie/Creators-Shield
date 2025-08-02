import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Session from '@/models/Session';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function POST(req: Request) {
  try {
    // Get token from headers or cookies
    const token = req.headers.get('authorization')?.replace('Bearer ', '') ||
                 req.cookies.get('creator_jwt')?.value ||
                 req.cookies.get('admin_jwt')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    await connectToDatabase();
    
    // Update the current session's last active time
    const result = await Session.updateOne(
      { user: decoded.id, isCurrentSession: true },
      { lastActive: new Date() }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'No active session found' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Session activity updated'
    });
    
  } catch (error) {
    console.error('Error updating session activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 