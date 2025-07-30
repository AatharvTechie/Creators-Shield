import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envCheck = {
      BREVO_SMTP_USERNAME: !!process.env.BREVO_SMTP_USERNAME,
      BREVO_SMTP_PASSWORD: !!process.env.BREVO_SMTP_PASSWORD,
      BREVO_SMTP_USERNAME_LENGTH: process.env.BREVO_SMTP_USERNAME?.length || 0,
      BREVO_SMTP_PASSWORD_LENGTH: process.env.BREVO_SMTP_PASSWORD?.length || 0,
      SENDER_EMAIL: process.env.SENDER_EMAIL,
      NODE_ENV: process.env.NODE_ENV,
      // Don't expose the actual credentials for security
    };
    
    console.log(`🔍 Environment check:`, envCheck);
    
    return NextResponse.json({ 
      success: true, 
      envCheck,
      message: 'Environment variables checked successfully' 
    });
    
  } catch (error) {
    console.error('❌ Environment check error:', error);
    return NextResponse.json({ 
      error: 'Failed to check environment',
      details: (error as Error).message 
    }, { status: 500 });
  }
} 