import { NextResponse } from 'next/server';
import { sendWelcomeEmail, sendAdminNotificationEmail } from '@/lib/services/backend-services';

export async function POST(req: Request) {
  try {
    const { testType, email } = await req.json();
    
    console.log(`🔍 Test email API called with:`, { testType, email });
    console.log(`🔍 BREVO_SMTP_USERNAME exists:`, !!process.env.BREVO_SMTP_USERNAME);
    console.log(`🔍 BREVO_SMTP_PASSWORD exists:`, !!process.env.BREVO_SMTP_PASSWORD);
    
    let result;
    
    if (testType === 'welcome') {
      result = await sendWelcomeEmail({ 
        to: email || 'test@example.com', 
        creatorName: 'Test Creator' 
      });
    } else if (testType === 'admin') {
      result = await sendAdminNotificationEmail({ 
        to: email || 'test@example.com', 
        subject: '[CreatorShield] Test Admin Notification',
        message: 'This is a test admin notification email.',
        creatorName: 'Test Creator',
        creatorEmail: 'test@example.com'
      });
    } else {
      return NextResponse.json({ 
        error: 'Invalid test type. Use "welcome" or "admin"' 
      }, { status: 400 });
    }
    
    console.log(`🔍 Test email result:`, result);
    
    return NextResponse.json({ 
      success: true, 
      result,
      message: `Test ${testType} email sent successfully` 
    });
    
  } catch (error) {
    console.error('❌ Test email error:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: (error as Error).message 
    }, { status: 500 });
  }
} 