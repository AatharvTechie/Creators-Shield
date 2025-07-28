import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Settings from '@/models/Settings';

// GET - Check if registrations are allowed
export async function GET() {
  try {
    await connectToDatabase();
    
    // Get settings
    const settings = await Settings.findOne();
    const allowRegistrations = settings?.allowRegistrations ?? true;
    
    return NextResponse.json({
      allowRegistrations,
      message: allowRegistrations 
        ? 'Registrations are currently enabled' 
        : 'Registration is temporarily disabled while we perform essential system maintenance and updates. This ensures we provide you with the best possible experience. Please check back later or contact our support team at creatorsshieldcommunity@gmail.com if you need immediate assistance.'
    });
  } catch (error) {
    console.error('Error checking registration status:', error);
    return NextResponse.json({ 
      allowRegistrations: true, // Default to true on error
      message: 'Registrations are currently enabled'
    });
  }
} 