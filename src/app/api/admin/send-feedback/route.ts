import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Creator from '@/models/Creator';
import { triggerEmailNotification } from '@/lib/audio-notification-utils';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { creatorId, feedbackType, message, adminName } = await req.json();

    if (!creatorId || !feedbackType || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the creator
    const creator = await Creator.findById(creatorId);
    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    // Send email using Brevo (similar to new device email)
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Admin Feedback - CreatorShield</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feedback-box { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .message-box { background: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .btn { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📬 Admin Feedback</h1>
            <p>You have received feedback from the CreatorShield admin team</p>
          </div>
          
          <div class="content">
            <div class="feedback-box">
              <h2>📋 Feedback Details</h2>
              <p><strong>Type:</strong> ${feedbackType}</p>
              <p><strong>From:</strong> ${adminName || 'CreatorShield Admin'}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="message-box">
              <h3>💬 Message</h3>
              <p>${message}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">View Dashboard</a>
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated message from CreatorShield</p>
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
          name: 'CreatorShield Admin',
          email: process.env.BREVO_SENDER_EMAIL || 'admin@creatorshield.com'
        },
        to: [
          {
            email: creator.email,
            name: creator.name || creator.email.split('@')[0]
          }
        ],
        subject: `📬 Admin Feedback - ${feedbackType}`,
        htmlContent: emailHtml
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API error:', errorData);
      return NextResponse.json({ error: 'Failed to send email via Brevo' }, { status: 500 });
    }

    // Trigger audio notification for the creator
    const creatorName = creator.name || creator.email.split('@')[0];
    triggerEmailNotification(creatorName);

    return NextResponse.json({ 
      success: true, 
      message: 'Feedback sent successfully',
      creatorName,
      feedbackType,
      audioTriggered: true
    });

  } catch (error) {
    console.error('Error sending admin feedback:', error);
    return NextResponse.json({ error: 'Failed to send feedback' }, { status: 500 });
  }
} 