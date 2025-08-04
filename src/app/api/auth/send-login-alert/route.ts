import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import { sendEmail } from '@/lib/email-service';
import { DeviceInfo } from '@/lib/device-detection';

export async function POST(request: NextRequest) {
  try {
    const { userEmail, deviceInfo } = await request.json();
    
    if (!userEmail || !deviceInfo) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.email !== userEmail) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await connectToDatabase();

    // Get user information
    const user = await db.collection('creators').findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if we've already sent an alert for this device recently (within 1 hour)
    const recentAlert = await db.collection('login_alerts').findOne({
      userEmail,
      'deviceInfo.fingerprint': deviceInfo.fingerprint,
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // 1 hour
    });

    if (recentAlert) {
      return NextResponse.json({
        success: true,
        message: 'Alert already sent recently'
      });
    }

    // Format the login time
    const loginTime = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Create email content
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
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Screen Resolution:</td>
                <td style="padding: 8px 0; color: #333;">${deviceInfo.screenResolution}</td>
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
                <td style="padding: 8px 0; color: #333;">${loginTime}</td>
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
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Go to Account Settings
            </a>
          </div>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
            This is an automated security alert from CreatorShield.<br>
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `;

    // Send the email
    await sendEmail({
      to: userEmail,
      subject: '🔐 New Login Alert - CreatorShield Account',
      html: emailContent
    });

    // Log the alert
    await db.collection('login_alerts').insertOne({
      userEmail,
      deviceInfo,
      createdAt: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || request.ip
    });

    // Log the activity
    await db.collection('activity_logs').insertOne({
      userEmail,
      action: 'login_alert_sent',
      timestamp: new Date(),
      details: {
        deviceInfo,
        ipAddress: request.headers.get('x-forwarded-for') || request.ip
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Login alert sent successfully'
    });

  } catch (error) {
    console.error('Send login alert error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 