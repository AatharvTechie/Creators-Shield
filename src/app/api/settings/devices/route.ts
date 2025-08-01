import connectToDatabase from '@/lib/mongodb';
import Session from '@/models/Session.js';
import Creator from '@/models/Creator.js';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) return Response.json({ error: 'Missing email' }, { status: 400 });
  
  try {
    await connectToDatabase();
    const user = await Creator.findOne({ email });
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });
    
    const sessions = await Session.find({ user: user._id }).lean();
    
    // If no sessions found, create a default session for current device
    if (sessions.length === 0) {
      // Create a default session for the current device
      const defaultSession = {
        id: `default_${Date.now()}`,
        device: 'Current Device',
        userAgent: 'Unknown',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
      
      return Response.json({
        devices: [defaultSession],
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
        userAgent: s.userAgent || 'Unknown',
        createdAt: s.createdAt,
        lastActive: s.lastActive,
      })),
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
    await Session.deleteOne({ user: user._id, sessionId });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Failed to revoke device' }, { status: 500 });
  }
} 