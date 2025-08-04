import { NextRequest, NextResponse } from 'next/server';
import { ComprehensiveEmailService } from '@/lib/comprehensive-email-service';

export async function POST(req: NextRequest) {
  try {
    const { email, name, action } = await req.json();
    
    if (!email || !name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and name are required' 
      }, { status: 400 });
    }

    console.log(`🧪 Testing email and voice notification for: ${email}, action: ${action}`);

    let result;
    const currentTime = new Date().toLocaleString();

    switch (action) {
      case 'suspend':
        result = await ComprehensiveEmailService.sendSuspendNotification(email, name, currentTime);
        break;
      case 'deactivate':
        result = await ComprehensiveEmailService.sendDeactivateNotification(email, name, currentTime);
        break;
      case 'platform-connect':
        result = await ComprehensiveEmailService.sendPlatformConnectNotification(email, name, 'YouTube', currentTime);
        break;
      case '2fa-setup':
        result = await ComprehensiveEmailService.send2FASetupNotification(email, name, currentTime);
        break;
      case 'new-device':
        result = await ComprehensiveEmailService.sendNewDeviceLoginNotification(email, name, 'Chrome on Windows', currentTime);
        break;
      case 'subscription':
        result = await ComprehensiveEmailService.sendSubscriptionNotification(email, name, 'Pro Plan', currentTime);
        break;
      case 'copyright-match':
        result = await ComprehensiveEmailService.sendCopyrightMatchNotification(email, name, { url: 'https://example.com/video' }, currentTime);
        break;
      case 'welcome':
        result = await ComprehensiveEmailService.sendWelcomeEmail(email, name);
        break;
      case 'test':
        result = await ComprehensiveEmailService.testEmailWithVoice(email, name);
        break;
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action. Use: suspend, deactivate, platform-connect, 2fa-setup, new-device, subscription, copyright-match, welcome, test' 
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully for action: ${action}`,
      result
    });

  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 