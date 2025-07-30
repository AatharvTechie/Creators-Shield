import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  try {
    // Check if Gmail credentials exist
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json({
        success: false,
        error: 'Missing Gmail credentials',
        message: 'Please add GMAIL_USER and GMAIL_APP_PASSWORD to your .env.local file',
        setup: 'See GMAIL_SETUP.md for instructions'
      });
    }

    // Create Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Test the connection
    await transporter.verify();
    
    return NextResponse.json({
      success: true,
      message: 'Gmail SMTP connection successful!',
      user: process.env.GMAIL_USER,
      provider: 'Gmail',
      limits: {
        daily: '500 emails/day',
        monthly: '15,000 emails/month'
      }
    });

  } catch (error: any) {
    console.error('Gmail connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      suggestions: [
        'Enable 2-Factor Authentication on your Google Account',
        'Generate an App Password (not your regular password)',
        'Make sure you copied the 16-character App Password correctly',
        'Check if your Gmail account is active'
      ],
      setup: 'See GMAIL_SETUP.md for detailed instructions'
    });
  }
} 