import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  try {
    // Check if credentials exist
    if (!process.env.BREVO_SMTP_USERNAME || !process.env.BREVO_SMTP_PASSWORD) {
      return NextResponse.json({
        success: false,
        error: 'Missing Brevo credentials',
        message: 'Please check your .env.local file for BREVO_SMTP_USERNAME and BREVO_SMTP_PASSWORD'
      });
    }

    // Create transporter
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

    // Test the connection
    await transporter.verify();
    
    return NextResponse.json({
      success: true,
      message: 'Brevo SMTP connection successful!',
      username: process.env.BREVO_SMTP_USERNAME,
      senderEmail: process.env.SENDER_EMAIL
    });

  } catch (error: any) {
    console.error('Brevo connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      suggestions: [
        'Check if your Brevo credentials are correct',
        'Make sure your sender email is verified in Brevo',
        'Try regenerating your Brevo API key',
        'Check if your Brevo account is active'
      ]
    });
  }
} 