import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userEmail, deviceInfo } = await req.json();

    if (!userEmail || !deviceInfo) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Device Login Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .device-info { background: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .device-info h3 { color: #495057; margin-top: 0; }
          .device-info p { margin: 8px 0; color: #6c757d; }
          .btn { display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .btn-primary { background: #007bff; }
          .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Device Login Alert</h1>
            <p>Your CreatorShield account was accessed from a new device</p>
          </div>
          
          <div class="content">
            <div class="alert-box">
              <h2>⚠️ Security Alert</h2>
              <p>A new device has logged into your CreatorShield account. If this was you, you can safely ignore this email. If you don't recognize this login, please take immediate action.</p>
            </div>
            
            <div class="device-info">
              <h3>📱 Device Information</h3>
              <p><strong>Device:</strong> ${deviceInfo.device}</p>
              <p><strong>Browser:</strong> ${deviceInfo.browser}</p>
              <p><strong>Operating System:</strong> ${deviceInfo.os}</p>
              <p><strong>IP Address:</strong> ${deviceInfo.ipAddress}</p>
              <p><strong>Login Time:</strong> ${new Date(deviceInfo.loginTime).toLocaleString()}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" class="btn btn-primary">Review Active Devices</a>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/login" class="btn">Secure Your Account</a>
            </div>
            
            <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>🔒 Security Tips</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Use strong, unique passwords</li>
                <li>Enable two-factor authentication</li>
                <li>Regularly review your active devices</li>
                <li>Log out from devices you no longer use</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated security alert from CreatorShield</p>
            <p>If you have any questions, contact our support team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using Brevo
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY || '',
      },
      body: JSON.stringify({
        sender: {
          name: 'CreatorShield Security',
          email: process.env.BREVO_SENDER_EMAIL || 'security@creatorshield.com'
        },
        to: [
          {
            email: userEmail,
            name: userEmail.split('@')[0]
          }
        ],
        subject: '🔔 New Device Login Alert - CreatorShield',
        htmlContent: emailHtml
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API error:', errorData);
      return NextResponse.json({ error: 'Failed to send email via Brevo' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully via Brevo' });
  } catch (error) {
    console.error('Error sending new device email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
} 