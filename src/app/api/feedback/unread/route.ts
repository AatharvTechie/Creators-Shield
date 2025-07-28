import connectToDatabase from '@/lib/mongodb';
import Feedback from '@/models/Feedback.js';
import { NextResponse } from 'next/server';

// Usage: /api/feedback/unread?role=admin|creator&creatorId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const creatorId = searchParams.get('creatorId');
    await connectToDatabase();
    if (role === 'admin') {
      // Any feedback with status 'pending'
      const docs = await Feedback.find({ 'feedbacks.status': 'pending' });
      const hasUnread = docs.some(doc => doc.feedbacks.some(fb => fb.status === 'pending'));
      return NextResponse.json({ hasUnread });
    } else if (role === 'creator' && creatorId) {
      // Any feedback with status 'replied' and creatorRead false
      const doc = await Feedback.findOne({ creatorId });
      const hasUnread = doc && doc.feedbacks.some(fb => fb.status === 'replied' && fb.creatorRead === false);
      return NextResponse.json({ hasUnread });
    } else {
      return NextResponse.json({ error: 'Missing or invalid role/creatorId' }, { status: 400 });
    }
  } catch (err) {
    console.error('Error checking unread feedback:', err);
    return NextResponse.json({ error: 'Failed to check unread feedback' }, { status: 500 });
  }
} 