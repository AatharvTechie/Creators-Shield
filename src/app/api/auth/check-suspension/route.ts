import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { checkSuspensionStatus } from '@/lib/users-store';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check suspension status
    const suspensionStatus = await checkSuspensionStatus(decoded.id);
    
    if (suspensionStatus.isSuspended) {
      const hours = Math.floor(suspensionStatus.timeRemaining! / (1000 * 60 * 60));
      const minutes = Math.floor((suspensionStatus.timeRemaining! % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((suspensionStatus.timeRemaining! % (1000 * 60)) / 1000);
      
      return NextResponse.json({ 
        isSuspended: true,
        timeRemaining: suspensionStatus.timeRemaining,
        hours,
        minutes,
        seconds,
        message: `Your account has been suspended due to suspicious activity. You can login again in ${hours}h ${minutes}m ${seconds}s.`
      });
    }
    
    return NextResponse.json({ isSuspended: false });
  } catch (error) {
    console.error('Check suspension error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 