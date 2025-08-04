import { NextRequest, NextResponse } from 'next/server';
import { triggerEmailNotification, triggerSystemAlertNotification } from '@/lib/audio-notification-utils';

export async function POST(req: NextRequest) {
  try {
    const { testType, creatorName = 'Test User' } = await req.json();

    switch (testType) {
      case 'email':
        triggerEmailNotification(creatorName);
        return NextResponse.json({ 
          success: true, 
          message: 'Email notification triggered',
          creatorName 
        });
      
      case 'system':
        triggerSystemAlertNotification(creatorName, 'This is a test system alert from CreatorShield');
        return NextResponse.json({ 
          success: true, 
          message: 'System alert notification triggered',
          creatorName 
        });
      
      default:
        return NextResponse.json({ error: 'Invalid test type' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in test audio:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Audio test endpoint ready',
    availableTests: ['email', 'system'],
    usage: 'POST with { "testType": "email", "creatorName": "Your Name" }'
  });
} 