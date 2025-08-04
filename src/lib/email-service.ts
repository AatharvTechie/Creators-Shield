import { emailTemplates } from './email-templates';
import { checkEmailConfiguration, getEmailSetupInstructions } from './email-config-checker';
import nodemailer from 'nodemailer';

// Brevo SMTP configuration
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

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    // Check if Brevo credentials are configured
    const emailConfig = checkEmailConfiguration();
    if (!emailConfig.isConfigured) {
      console.warn('⚠️ Email configuration incomplete. Missing:', emailConfig.missingFields.join(', '));
      console.log(getEmailSetupInstructions());
      return {
        success: false,
        message: `Brevo SMTP credentials not configured - Missing: ${emailConfig.missingFields.join(', ')}`,
        provider: 'None',
        timestamp: new Date().toISOString()
      };
    }

    console.log(`📧 Sending email to: ${to}`);

    // Send email using Brevo SMTP
    const result = await transporter.sendMail({
      from: process.env.SENDER_EMAIL || process.env.BREVO_SMTP_USERNAME,
      to,
      subject,
      html
    });

    console.log(`✅ Email sent successfully to: ${to}`);
    console.log(`📧 Message ID: ${result.messageId}`);

    return {
      success: true,
      message: 'Email sent successfully via Brevo SMTP',
      messageId: result.messageId,
      provider: 'Brevo',
      timestamp: new Date().toISOString()
    };

  } catch (error: any) {
    console.error(`❌ Failed to send email to ${to}`, error.message);
    
    // Check if it's a credentials error
    if (error.message.includes('Invalid login') || error.message.includes('Authentication failed')) {
      return {
        success: false,
        message: 'Brevo SMTP credentials not configured or invalid',
        provider: 'Brevo',
        timestamp: new Date().toISOString()
      };
    }
    
    // Don't throw error, just log it and return failure
    return {
      success: false,
      message: `Email sending failed: ${error.message}`,
      provider: 'Brevo',
      timestamp: new Date().toISOString()
    };
  }
}

export async function sendCreatorNotification(
  creatorEmail: string,
  creatorName: string,
  action: 'suspend' | 'deactivate' | 'lift-suspension' | 'reactivation-approved' | 'reactivation-rejected' | 
         'mark-as-read' | 'disconnect-approved' | 'disconnect-denied' | 'platform-connected' | '2fa-setup' |
         'new-device-login' | 'subscription-activated' | 'copyright-match' | 'weekly-report' | 'promotional' |
         'feature-update' | 'welcome' | 'test',
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
        // For other actions, use a generic template
        emailData = {
          subject: `Creator Shield Notification - ${action}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Creator Shield Notification</title>
            </head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Hello ${creatorName},</h2>
              <p>This is a notification from Creator Shield regarding: ${action}</p>
              <p>Time: ${timestamp || new Date().toLocaleString()}</p>
              <p>Thank you for using Creator Shield!</p>
            </body>
            </html>
          `
        };
    }

    // Check if Brevo credentials are configured
    const emailConfig = checkEmailConfiguration();
    if (!emailConfig.isConfigured) {
      console.warn('⚠️ Email configuration incomplete. Missing:', emailConfig.missingFields.join(', '));
      console.log(getEmailSetupInstructions());
      return {
        success: false,
        message: `Brevo SMTP credentials not configured - Missing: ${emailConfig.missingFields.join(', ')}`,
        provider: 'None',
        timestamp: new Date().toISOString()
      };
    }

    console.log(`📧 Sending ${action} notification email to: ${creatorEmail}`);

    // Send email using Brevo SMTP
    const result = await transporter.sendMail({
      from: process.env.SENDER_EMAIL || process.env.BREVO_SMTP_USERNAME,
      to: creatorEmail,
      subject: emailData.subject,
      html: emailData.html
    });

    console.log(`✅ Email sent successfully to: ${creatorEmail}`);
    console.log(`📧 Message ID: ${result.messageId}`);

    // Voice notifications are handled on the client side
    // Server-side voice notification removed

    return {
      success: true,
      message: 'Email sent successfully via Brevo SMTP',
      messageId: result.messageId,
      provider: 'Brevo',
      timestamp: new Date().toISOString()
    };

  } catch (error: any) {
    console.error(`❌ Failed to send email to ${creatorEmail} for action: ${action}`, error.message);
    
    // Check if it's a credentials error
    if (error.message.includes('Invalid login') || error.message.includes('Authentication failed')) {
      return {
        success: false,
        message: 'Brevo SMTP credentials not configured or invalid',
        provider: 'Brevo',
        timestamp: new Date().toISOString()
      };
    }
    
    // Don't throw error, just log it and return failure
    return {
      success: false,
      message: `Email sending failed: ${error.message}`,
      provider: 'Brevo',
      timestamp: new Date().toISOString()
    };
  }
} 