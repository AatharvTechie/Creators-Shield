import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Creator from '@/models/Creator';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, verificationCode, newPassword } = await request.json();
    
    if (!email || !verificationCode || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Email, verification code, and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Find user by email
    const user = await Creator.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify the verification code
    if (user.passwordResetCode !== verificationCode) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (user.passwordResetExpires && new Date() > new Date(user.passwordResetExpires)) {
      return NextResponse.json(
        { success: false, message: 'Verification code has expired' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user's password and clear reset code
    await Creator.updateOne(
      { email },
      { 
        password: hashedPassword,
        passwordResetCode: null,
        passwordResetExpires: null
      }
    );

    console.log(`🔐 Password changed successfully for ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to change password' },
      { status: 500 }
    );
  }
} 