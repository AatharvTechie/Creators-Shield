import connectToDatabase from '@/lib/mongodb';
import Session from '@/models/Session';
import Creator from '@/models/Creator';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) return Response.json({ error: 'Missing email' }, { status: 400 });
  
  try {
    await connectToDatabase();
    const user = await Creator.findOne({ email }).exec();
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
    
    // Get current session ID from JWT token
    let currentSessionId = null;
    try {
      const cookieStore = await cookies();
      const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                   cookieStore.get('creator_jwt')?.value;
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        // Find current session for this user using the JWT session ID
        const currentSession = await Session.findOne({ 
          user: user._id, 
          sessionId: decoded.sessionId // Use the session ID from JWT
        }).exec();
        if (currentSession) {
          currentSessionId = currentSession.sessionId;
          // Update this session as current
          await Session.updateMany(
            { user: user._id },
            { isCurrentSession: false }
          ).exec();
          await Session.updateOne(
            { user: user._id, sessionId: decoded.sessionId },
            { isCurrentSession: true }
          ).exec();
        }
      }
    } catch (jwtError) {
      console.log('JWT verification failed for login history:', jwtError);
    }
    
    // Get all sessions for the user, sorted by last active (most recent first)
    const sessions = await Session.find({ user: user._id })
      .sort({ lastActive: -1 })
      .limit(50) // Limit to last 50 sessions
      .lean()
      .exec();
    
    // If no sessions found, return empty array
    if (sessions.length === 0) {
      return Response.json({
        history: [],
        currentSessionId,
      });
    }
    
    return Response.json({
      history: sessions.map((s: any) => ({
        sessionId: s.sessionId,
        device: s.device || 'Unknown Device',
        browser: s.browser || 'Unknown',
        os: s.os || 'Unknown',
        location: s.location || 'Unknown',
        ipAddress: s.ipAddress || 'Unknown',
        userAgent: s.userAgent || 'Unknown',
        createdAt: s.createdAt,
        lastActive: s.lastActive,
        isCurrentSession: s.isCurrentSession || false,
      })),
      currentSessionId,
    });
  } catch (error) {
    console.error('Error fetching login history:', error);
    return Response.json({ error: 'Failed to fetch login history' }, { status: 500 });
  }
} 