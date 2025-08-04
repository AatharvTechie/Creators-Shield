import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Creator from '@/models/Creator';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Find user by email
    const user = await Creator.findOne({ email }).exec();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store verification code in user document (with expiration)
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await Creator.updateOne(
      { email },
      { 
        passwordResetCode: verificationCode,
        passwordResetExpires: expirationTime
      }
    ).exec();

    // For development/testing, log the code
    console.log(`📧 Password reset code for ${email}: ${verificationCode}`);
    
    // Try to send email using Brevo
    try {
      const { sendOTP } = await import('@/utils/brevo-email');
      
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${user.name || 'User'},</p>
          <p>You have requested to reset your password. Use the following verification code:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${verificationCode}</h1>
          </div>
          <p><strong>This code will expire in 10 minutes.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>CreatorShield Team</p>
        </div>
      `;

      const emailResult: any = await sendOTP(email, verificationCode, user.name || 'Creator');

      if (emailResult && (emailResult as any).success) {
        console.log(`📧 Password reset code sent to ${email} via Brevo`);
      } else {
        console.error('Brevo email send failed:', (emailResult as any)?.error || 'Unknown error');
        // Still return success since code is generated and stored
        return NextResponse.json({
          success: true,
          message: 'Verification code generated (email send failed)',
          code: verificationCode // Only include in development
        });
      }
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      // Still return success since code is generated and stored
      return NextResponse.json({
        success: true,
        message: 'Verification code generated (email send failed)',
        code: verificationCode // Only include in development
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email'
    });

  } catch (error) {
    console.error('Error sending password reset code:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send verification code' },
      { status: 500 }
    );
  }
} 