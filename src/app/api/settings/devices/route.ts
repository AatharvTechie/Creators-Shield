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
      const token = req.headers.get('authorization')?.replace('Bearer ', '');
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
      console.log('JWT verification failed for device list:', jwtError);
    }
    
    const sessions = await Session.find({ user: user._id }).lean().exec();
    
    console.log('🔍 Found sessions for user:', sessions.length);
    console.log('🔍 Session IDs:', sessions.map((s: any) => s.sessionId));
    
    // Also fetch from device_sessions collection using mongoose
    const mongoose = await import('mongoose');
    const db = mongoose.connection.db;
    let deviceSessions: any[] = [];
    
    if (db) {
      deviceSessions = await db.collection('device_sessions').find({ userEmail: email }).toArray();
    }
    
    console.log('🔍 Found device sessions for user:', deviceSessions.length);
    console.log('🔍 Device session IDs:', deviceSessions.map((d: any) => d.deviceInfo?.deviceId));
    
    // Combine both session types
    const allSessions = [
      ...sessions.map((s: any) => ({
        id: s.sessionId,
        device: s.device || 'Unknown Device',
        browser: s.browser || 'Unknown',
        os: s.os || 'Unknown',
        location: s.location || 'Unknown',
        ipAddress: s.ipAddress || 'Unknown',
        userAgent: s.userAgent || 'Unknown',
        createdAt: s.createdAt,
        lastActive: s.lastActive,
        isCurrentSession: s.isCurrentSession || false,
        type: 'session'
      })),
      ...deviceSessions.map((d: any) => ({
        id: d.deviceInfo?.deviceId || d._id.toString(),
        device: d.deviceInfo?.deviceName || 'Unknown Device',
        browser: d.deviceInfo?.browser || 'Unknown',
        os: d.deviceInfo?.os || 'Unknown',
        location: d.deviceInfo?.location || 'Unknown',
        ipAddress: d.deviceInfo?.ipAddress || 'Unknown',
        userAgent: d.deviceInfo?.userAgent || 'Unknown',
        createdAt: d.createdAt,
        lastActive: d.lastActivity,
        isCurrentSession: false,
        type: 'device_session'
      }))
    ];
    
    console.log('🔍 Total sessions found:', allSessions.length);
    
    // If no sessions found, create a default session for current device
    if (allSessions.length === 0) {
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
    const sortedSessions = allSessions.sort((a: any, b: any) => 
      new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    );
    
    const devices = sortedSessions.map((s: any) => ({
      id: s.id,
      device: s.device || 'Unknown Device',
      browser: s.browser || 'Unknown',
      os: s.os || 'Unknown',
      location: s.location || 'Unknown',
      ipAddress: s.ipAddress || 'Unknown',
      userAgent: s.userAgent || 'Unknown',
      createdAt: s.createdAt,
      lastActive: s.lastActive,
      isCurrentSession: s.isCurrentSession || false,
    }));
    
    console.log('🔍 Returning devices:', devices.length);
    console.log('🔍 Device IDs:', devices.map((d: any) => d.id));
    
    return Response.json({
      devices,
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