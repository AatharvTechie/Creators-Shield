import connectToDatabase from '@/lib/mongodb';
import Feedback from '@/models/Feedback.js';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const { feedbackId, creatorId, message } = await req.json();
    console.log('Reply API - Received data:', { feedbackId, creatorId, message });
    
    if (!feedbackId || !creatorId || !message) {
      console.log('Reply API - Missing required fields');
      return NextResponse.json({ error: 'Missing feedbackId, creatorId, or message' }, { status: 400 });
    }
    await connectToDatabase();
    
    // Convert creatorId to ObjectId if it's a string
    let creatorObjectId;
    try {
      creatorObjectId = typeof creatorId === 'string' ? new mongoose.Types.ObjectId(creatorId) : creatorId;
    } catch (error) {
      console.log('Reply API - Invalid creatorId format:', creatorId);
      return NextResponse.json({ error: 'Invalid creatorId format' }, { status: 400 });
    }
    
    const feedbackDoc = await Feedback.findOne({ creatorId: creatorObjectId });
    console.log('Reply API - Found feedback doc:', !!feedbackDoc);
    
    if (!feedbackDoc) {
      console.log('Reply API - Feedback not found for creatorId:', creatorId);
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }
    
    // Convert feedbackId to ObjectId if it's a string
    let feedbackObjectId;
    try {
      feedbackObjectId = typeof feedbackId === 'string' ? new mongoose.Types.ObjectId(feedbackId) : feedbackId;
    } catch (error) {
      console.log('Reply API - Invalid feedbackId format:', feedbackId);
      return NextResponse.json({ error: 'Invalid feedbackId format' }, { status: 400 });
    }
    
    const feedback = feedbackDoc.feedbacks.id(feedbackObjectId);
    console.log('Reply API - Found feedback item:', !!feedback);
    
    if (!feedback) {
      console.log('Reply API - Feedback item not found for feedbackId:', feedbackId);
      return NextResponse.json({ error: 'Feedback item not found' }, { status: 404 });
    }
    
    console.log('Reply API - Before update - Status:', feedback.status, 'CreatorRead:', feedback.creatorRead);
    feedback.status = 'replied';
    feedback.reply = { message, repliedAt: new Date() };
    feedback.creatorRead = false; // mark as unread for creator
    console.log('Reply API - After update - Status:', feedback.status, 'CreatorRead:', feedback.creatorRead);
    
    await feedbackDoc.save();
    console.log('Reply API - Save successful');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error replying to feedback:', err);
    return NextResponse.json({ error: 'Failed to reply' }, { status: 500 });
  }
} 