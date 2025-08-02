import connectToDatabase from '@/lib/mongodb';
import Session from '@/models/Session.js';
import Creator from '@/models/Creator.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) return Response.json({ error: 'Missing email' }, { status: 400 });
  
  try {
    await connectToDatabase();
    const user = await Creator.findOne({ email });
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
    
    // Get current session ID from JWT token
    let currentSessionId = null;
    try {
      const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                   req.cookies.get('creator_jwt')?.value;
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        // Find current session for this user
        const currentSession = await Session.findOne({ 
          user: user._id, 
          isCurrentSession: true 
        });
        if (currentSession) {
          currentSessionId = currentSession.sessionId;
        }
      }
    } catch (jwtError) {
      console.log('JWT verification failed for device list:', jwtError);
    }
    
    const sessions = await Session.find({ user: user._id }).lean();
    
    // If no sessions found, create a default session for current device
    if (sessions.length === 0) {
      // Create a default session for the current device
      const defaultSession = {
        id: `default_${Date.now()}`,
        device: 'Current Device',
        browser: 'Unknown',
        os: 'Unknown',
        ipAddress: 'Unknown',
        userAgent: 'Unknown',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        isCurrentSession: true,
      };
      
      return Response.json({
        devices: [defaultSession],
        currentSessionId: defaultSession.id,
      });
    }
    
    // Sort sessions by last active (most recent first)
    const sortedSessions = sessions.sort((a, b) => 
      new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    );
    
    return Response.json({
      devices: sortedSessions.map(s => ({
        id: s.sessionId,
        device: s.device || 'Unknown Device',
        browser: s.browser || 'Unknown',
        os: s.os || 'Unknown',
        ipAddress: s.ipAddress || 'Unknown',
        userAgent: s.userAgent || 'Unknown',
        createdAt: s.createdAt,
        lastActive: s.lastActive,
        isCurrentSession: s.isCurrentSession || false,
      })),
      currentSessionId,
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    return Response.json({ error: 'Failed to fetch devices' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { email, sessionId } = await req.json();
    if (!email || !sessionId) return Response.json({ error: 'Missing email or sessionId' }, { status: 400 });
    
    await connectToDatabase();
    const user = await Creator.findOne({ email });
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
    
    // Delete the specific session
    const result = await Session.deleteOne({ user: user._id, sessionId });
    
    if (result.deletedCount === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error revoking device:', error);
    return Response.json({ error: 'Failed to revoke device' }, { status: 500 });
  }
} 