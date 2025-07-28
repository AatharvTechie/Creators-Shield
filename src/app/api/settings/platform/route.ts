import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Settings from '@/models/Settings';

// GET - Fetch platform settings
export async function GET() {
  try {
    await connectToDatabase();
    
    // Get or create default settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    
    return NextResponse.json({
      allowRegistrations: settings.allowRegistrations,
      strikeThreshold: settings.strikeThreshold,
      notificationEmail: settings.notificationEmail,
      notifyOnStrikes: settings.notifyOnStrikes,
      notifyOnReactivations: settings.notifyOnReactivations,
      matchThreshold: settings.matchThreshold,
    });
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PATCH - Update platform settings
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    await connectToDatabase();
    
    // Get or create settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    // Update fields if provided
    if (body.allowRegistrations !== undefined) {
      settings.allowRegistrations = body.allowRegistrations;
    }
    if (body.strikeThreshold !== undefined) {
      settings.strikeThreshold = body.strikeThreshold;
    }
    if (body.notificationEmail !== undefined) {
      settings.notificationEmail = body.notificationEmail;
    }
    if (body.notifyOnStrikes !== undefined) {
      settings.notifyOnStrikes = body.notifyOnStrikes;
    }
    if (body.notifyOnReactivations !== undefined) {
      settings.notifyOnReactivations = body.notifyOnReactivations;
    }
    if (body.matchThreshold !== undefined) {
      settings.matchThreshold = body.matchThreshold;
    }
    
    await settings.save();
    
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating platform settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
} 