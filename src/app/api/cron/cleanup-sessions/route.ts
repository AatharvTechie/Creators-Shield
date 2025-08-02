import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Session from '@/models/Session';

export async function POST(req: Request) {
  try {
    // Verify cron secret if provided
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectToDatabase();
    
    // Find and remove expired sessions
    const expiredSessions = await Session.find({
      expiresAt: { $lt: new Date() }
    });
    
    if (expiredSessions.length > 0) {
      await Session.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
      console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
      
      return NextResponse.json({
        success: true,
        message: `Cleaned up ${expiredSessions.length} expired sessions`,
        cleanedCount: expiredSessions.length
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'No expired sessions found',
      cleanedCount: 0
    });
    
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 