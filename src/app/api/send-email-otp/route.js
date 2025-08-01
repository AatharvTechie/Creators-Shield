import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Creator from '@/models/Creator';
import { sendOTP, testBrevoConnection } from '@/utils/brevo-email';

const otpStore = global.otpEmailStore || (global.otpEmailStore = {});

export async function POST(req) {
  const { email } = await req.json();
  
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  
  try {
    // Test Brevo connection first
    const connectionTest = await testBrevoConnection();
    if (!connectionTest.success) {
      console.error('❌ Brevo connection test failed:', connectionTest.error);
      return NextResponse.json({ 
        error: 'Email service not configured', 
        details: connectionTest.error 
      }, { status: 500 });
    }
    
    console.log('✅ Brevo connection test passed');
    
    // Connect to database
    await dbConnect();
    const creator = await Creator.findOne({ email });
    
    if (!creator) {
      return NextResponse.json({ error: 'Email not registered' }, { status: 400 });
    }
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };
    
    console.log(`📧 Sending OTP to: ${email}`);
    
    // Send OTP using utility function
    const result = await sendOTP(email, otp, creator.name || 'Creator');
    
    if (result.success) {
      console.log(`✅ OTP sent successfully to ${email}`);
      return NextResponse.json({ 
        success: true, 
        message: 'OTP sent successfully',
        messageId: result.messageId 
      });
    } else {
      console.error('❌ OTP sending failed:', result);
      return NextResponse.json({ 
        error: result.error, 
        details: result.details,
        status: result.status 
      }, { status: 500 });
    }
    
  } catch (err) {
    console.error('❌ SEND EMAIL OTP ERROR:', err);
    return NextResponse.json({ 
      error: 'Failed to send OTP', 
      details: err.message 
    }, { status: 500 });
  }
} 