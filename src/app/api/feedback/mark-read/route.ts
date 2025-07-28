import connectToDatabase from '@/lib/mongodb';
import Feedback from '@/models/Feedback.js';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const { feedbackId, creatorId } = await req.json();
    console.log('Mark Read API - Received data:', { feedbackId, creatorId });
    
    if (!feedbackId) {
      console.log('Mark Read API - Missing feedbackId');
      return NextResponse.json({ error: 'Missing feedbackId' }, { status: 400 });
    }
    await connectToDatabase();
    
    // If creatorId is provided, use it to find the specific feedback
    let feedbackDoc;
    if (creatorId) {
      // Convert creatorId to ObjectId if it's a string
      let creatorObjectId;
      try {
        creatorObjectId = typeof creatorId === 'string' ? new mongoose.Types.ObjectId(creatorId) : creatorId;
      } catch (error) {
        console.log('Mark Read API - Invalid creatorId format:', creatorId);
        return NextResponse.json({ error: 'Invalid creatorId format' }, { status: 400 });
      }
      
      feedbackDoc = await Feedback.findOne({ creatorId: creatorObjectId });
      console.log('Mark Read API - Found feedback doc with creatorId:', !!feedbackDoc);
    } else {
      // If no creatorId, search all feedback docs for the feedbackId
      feedbackDoc = await Feedback.findOne({ 'feedbacks._id': feedbackId });
      console.log('Mark Read API - Found feedback doc without creatorId:', !!feedbackDoc);
    }
    
    if (!feedbackDoc) {
      console.log('Mark Read API - Feedback not found');
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }
    
    // Convert feedbackId to ObjectId if it's a string
    let feedbackObjectId;
    try {
      feedbackObjectId = typeof feedbackId === 'string' ? new mongoose.Types.ObjectId(feedbackId) : feedbackId;
    } catch (error) {
      console.log('Mark Read API - Invalid feedbackId format:', feedbackId);
      return NextResponse.json({ error: 'Invalid feedbackId format' }, { status: 400 });
    }
    
    const feedback = feedbackDoc.feedbacks.id(feedbackObjectId);
    console.log('Mark Read API - Found feedback item:', !!feedback);
    
    if (!feedback) {
      console.log('Mark Read API - Feedback item not found for feedbackId:', feedbackId);
      return NextResponse.json({ error: 'Feedback item not found' }, { status: 404 });
    }
    
    console.log('Mark Read API - Before update - Status:', feedback.status, 'CreatorRead:', feedback.creatorRead);
    feedback.status = 'admin_read';
    feedback.creatorRead = true; // new field for creator UI
    console.log('Mark Read API - After update - Status:', feedback.status, 'CreatorRead:', feedback.creatorRead);
    
    await feedbackDoc.save();
    console.log('Mark Read API - Save successful');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error marking feedback as read:', err);
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
} 