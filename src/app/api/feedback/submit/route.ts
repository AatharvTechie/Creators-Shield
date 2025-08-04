import connectToDatabase from '@/lib/mongodb';
import Feedback from '@/models/Feedback.js';
import Creator from '@/models/Creator.js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const data = await req.json();
    console.log('Submit API - Received data:', data);
    
    const { creatorEmail, creatorName, ...feedbackData } = data;
    console.log('Submit API - Received creatorEmail:', creatorEmail);
    
    // Better validation for creatorEmail
    if (!creatorEmail || creatorEmail === 'null' || creatorEmail === 'undefined' || creatorEmail.trim() === '') {
      console.log('Submit API - Missing or invalid creatorEmail');
      return NextResponse.json({ 
        success: false, 
        message: 'Missing or invalid creatorEmail. Please ensure you are logged in properly.' 
      }, { status: 400 });
    }
    
    // Find creator by email
    const creator = await Creator.findOne({ email: creatorEmail });
    console.log('Submit API - Found creator:', !!creator);
    
    if (!creator) {
      console.log('Submit API - Creator not found for email:', creatorEmail);
      return NextResponse.json({ success: false, message: 'Creator not found' }, { status: 404 });
    }
    
    try {
      // Always push feedback to the creator's feedbacks array
      let feedbackDoc = await Feedback.findOne({ creatorId: creator._id });
      console.log('Submit API - Found existing feedback doc:', !!feedbackDoc);
      
      if (!feedbackDoc) {
        // Create new feedback doc for this creator
        feedbackDoc = new Feedback({ 
          creatorId: creator._id, 
          feedbacks: [] 
        });
        console.log('Submit API - Created new feedback doc');
      } else {
        // Clean up any existing feedbacks with invalid status values
        let hasChanges = false;
        feedbackDoc.feedbacks = feedbackDoc.feedbacks.map(fb => {
          if (fb.status === 'admin read') {
            fb.status = 'admin_read';
            hasChanges = true;
            console.log('Submit API - Fixed invalid status from "admin read" to "admin_read"');
          }
          return fb;
        });
        
        if (hasChanges) {
          await feedbackDoc.save();
          console.log('Submit API - Saved cleaned up feedback doc');
        }
      }
      
      // Ensure creatorName is not null/undefined
      const safeCreatorName = creatorName || creator.name || 'Creator';
      
      feedbackDoc.feedbacks.push({ 
        ...feedbackData, 
        creatorName: safeCreatorName, 
        createdAt: new Date() 
      });
      await feedbackDoc.save();
      console.log('Submit API - Feedback saved successfully');
      
      return NextResponse.json({ success: true, feedback: feedbackDoc });
    } catch (err: any) {
      console.error('Submit API - Feedback save error:', err);
      
      // Handle duplicate key error specifically
      if (err.code === 11000) {
        return NextResponse.json({ 
          success: false, 
          message: 'Duplicate feedback entry. Please try again.' 
        }, { status: 409 });
      }
      
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  } catch (err: any) {
    console.error('Submit API - General error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 