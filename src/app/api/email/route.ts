import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Brevo SMTP configuration
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USERNAME,
    pass: process.env.BREVO_SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, from } = await request.json();

    // Validation
    if (!to || !subject || !html) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: to, subject, html'
      }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email address format'
      }, { status: 400 });
    }

    // Check if Brevo credentials are configured
    if (!process.env.BREVO_SMTP_USERNAME || !process.env.BREVO_SMTP_PASSWORD) {
      return NextResponse.json({
        success: false,
        error: 'Brevo SMTP credentials not configured'
      }, { status: 500 });
    }

    console.log(`📧 Sending email to: ${to}`);

    // Send email using Brevo SMTP
    const result = await transporter.sendMail({
      from: from || process.env.SENDER_EMAIL || process.env.BREVO_SMTP_USERNAME,
      to: to,
      subject: subject,
      html: html
    });

    console.log(`✅ Email sent successfully to: ${to}`);
    console.log(`📧 Message ID: ${result.messageId}`);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully via Brevo SMTP',
      messageId: result.messageId,
      provider: 'Brevo',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Email sending failed:', error.message);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to send email',
      message: error.message,
      provider: 'Brevo'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    provider: 'Brevo SMTP',
    plan: 'Free (300 emails/day)',
    endpoints: {
      sendEmail: 'POST /api/email',
      healthCheck: 'GET /api/email'
    }
  });
} 