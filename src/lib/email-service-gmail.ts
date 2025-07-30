import { emailTemplates } from './email-templates';
import nodemailer from 'nodemailer';

// Gmail SMTP configuration (easier to set up)
const createGmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
    },
  });
};

export async function sendCreatorNotificationGmail(
  creatorEmail: string,
  creatorName: string,
  action: 'suspend' | 'deactivate' | 'lift-suspension' | 'reactivation-approved' | 'reactivation-rejected',
  timestamp?: string
) {
  try {
    let emailData;

    switch (action) {
      case 'suspend':
        emailData = emailTemplates.suspension(creatorName, timestamp || new Date().toLocaleString());
        break;
      case 'deactivate':
        emailData = emailTemplates.deactivation(creatorName, timestamp || new Date().toLocaleString());
        break;
      case 'lift-suspension':
        emailData = emailTemplates.suspensionLifted(creatorName);
        break;
      case 'reactivation-approved':
        emailData = emailTemplates.reactivationApproved(creatorName, timestamp || new Date().toLocaleString());
        break;
      case 'reactivation-rejected':
        emailData = emailTemplates.reactivationRejected(creatorName, timestamp || new Date().toLocaleString());
        break;
      default:
        throw new Error('Invalid action type');
    }

    // Check if Gmail credentials are configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('⚠️ Gmail credentials not configured. Email notification skipped.');
      return {
        success: false,
        message: 'Email notification skipped - Gmail credentials not configured',
        provider: 'None',
        timestamp: new Date().toISOString()
      };
    }

    console.log(`📧 Sending ${action} notification email to: ${creatorEmail} via Gmail`);

    const transporter = createGmailTransporter();

    // Send email using Gmail SMTP
    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: creatorEmail,
      subject: emailData.subject,
      html: emailData.html
    });

    console.log(`✅ Email sent successfully to: ${creatorEmail} via Gmail`);
    console.log(`📧 Message ID: ${result.messageId}`);

    return {
      success: true,
      message: 'Email sent successfully via Gmail SMTP',
      messageId: result.messageId,
      provider: 'Gmail',
      timestamp: new Date().toISOString()
    };

  } catch (error: any) {
    console.error(`❌ Failed to send email to ${creatorEmail} for action: ${action}`, error.message);
    
    return {
      success: false,
      message: `Email sending failed: ${error.message}`,
      provider: 'Gmail',
      timestamp: new Date().toISOString()
    };
  }
} 