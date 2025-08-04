import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import { sendEmail } from '@/lib/email-service';
import { generateDeviceInfo, detectNewDevice } from '@/lib/device-detection';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    // Find user by email
    const user = await db.collection('creators').findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // In a real implementation, you would hash and compare the password
    // For now, we'll assume the password is correct if user exists
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    // if (!isPasswordValid) {
    //   return NextResponse.json(
    //     { success: false, message: 'Invalid email or password' },
    //     { status: 401 }
    //   );
    // }

    // Generate device info
    const deviceInfo = await generateDeviceInfo();

    // Check if this is a new device
    const deviceDetection = await detectNewDevice(email);

    // Generate JWT token
    const token = jwt.sign(
      { 
        email: user.email, 
        userId: user._id,
        deviceId: deviceInfo.fingerprint 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Save device session
    await db.collection('device_sessions').insertOne({
      userEmail: email,
      deviceInfo: {
        ...deviceInfo,
        timestamp: new Date()
      },
      isActive: true,
      lastActivity: new Date(),
      createdAt: new Date(),
      isConfirmed: !deviceDetection.isNewDevice // Auto-confirm if not new device
    });

    // Log the login
    await db.collection('activity_logs').insertOne({
      userEmail: email,
      action: 'login',
      timestamp: new Date(),
      details: {
        deviceInfo,
        ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        isNewDevice: deviceDetection.isNewDevice
      }
    });

    // If it's a new device, send alerts
    if (deviceDetection.isNewDevice) {
      // Send email alert
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🔐 New Login Alert</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your CreatorShield account has been accessed</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${user.name || 'there'},</h2>
            
            <p style="color: #666; line-height: 1.6;">
              We detected a new login to your CreatorShield account. If this was you, you can safely ignore this email.
            </p>
            
            <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">📱 Device Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Device:</td>
                  <td style="padding: 8px 0; color: #333;">${deviceInfo.deviceName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Browser:</td>
                  <td style="padding: 8px 0; color: #333;">${deviceInfo.browser} ${deviceInfo.browserVersion}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Operating System:</td>
                  <td style="padding: 8px 0; color: #333;">${deviceInfo.os} ${deviceInfo.osVersion}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Location:</td>
                  <td style="padding: 8px 0; color: #333;">${deviceInfo.location || 'Unknown'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">IP Address:</td>
                  <td style="padding: 8px 0; color: #333;">${deviceInfo.ipAddress}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Login Time:</td>
                  <td style="padding: 8px 0; color: #333;">${new Date().toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">⚠️ Security Notice</h3>
              <p style="color: #856404; margin: 0; line-height: 1.6;">
                If this login wasn't you, please take immediate action:
              </p>
              <ul style="color: #856404; margin: 10px 0 0 0; padding-left: 20px;">
                <li>Change your password immediately</li>
                <li>Enable two-factor authentication</li>
                <li>Contact our support team</li>
              </ul>
            </div>
          </div>
        </div>
      `;

      await sendEmail({
        to: email,
        subject: '🔐 New Login Alert - CreatorShield Account',
        html: emailContent
      });

      // Log the alert
      await db.collection('login_alerts').insertOne({
        userEmail: email,
        deviceInfo,
        createdAt: new Date(),
        ipAddress: request.headers.get('x-forwarded-for') || request.ip
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        planExpiry: user.planExpiry,
        youtubeChannel: user.youtubeChannel
      },
      deviceInfo: deviceDetection.isNewDevice ? deviceInfo : null,
      isNewDevice: deviceDetection.isNewDevice
    });

  } catch (error) {
    console.error('Custom login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 