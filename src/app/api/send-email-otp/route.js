import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Creator from '@/models/Creator';
import { unifiedEmailTemplates } from '@/lib/unified-email-templates';

const otpStore = global.otpEmailStore || (global.otpEmailStore = {});

export async function POST(req) {
  const { email } = await req.json();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  try {
    await dbConnect();
    const creator = await Creator.findOne({ email });
    if (!creator) {
      return NextResponse.json({ error: 'Email not registered' }, { status: 400 });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

    // Create email data for OTP
    const emailData = {
      firstName: creator.name ? creator.name.split(' ')[0] : 'Creator',
      actionType: 'OTP Verification',
      status: 'Sent',
      timestamp: new Date().toLocaleString(),
      referenceId: `OTP-${Date.now()}`,
      customMessage: `Your OTP for CreatorShield is: ${otp}. This code will expire in 5 minutes. Please do not share this code with anyone.`,
      dashboardLink: 'https://creatorshield.com/dashboard'
    };
    
    const emailContent = unifiedEmailTemplates.generateTemplate(emailData);

    // Send email using Resend API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: email,
        subject: emailContent.subject,
        html: emailContent.html
      })
    });
    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({ error: 'Failed to send OTP', details: error }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('SEND EMAIL OTP ERROR:', err);
    return NextResponse.json({ error: 'Failed to send OTP', details: err.message }, { status: 500 });
  }
} 