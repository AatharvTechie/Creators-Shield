
/**
 * @file This file contains server-side functions for interacting with external services
 * like a FastAPI backend, YouTube Data API, and Brevo for emails.
 */
'use server';

import { createViolation } from '@/lib/violations-store';
import type { Violation } from '@/lib/types';
import nodemailer from 'nodemailer';
import { unifiedEmailTemplates, createEmailData } from '@/lib/unified-email-templates';

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

const fromEmail = process.env.SENDER_EMAIL || process.env.BREVO_SMTP_USERNAME || 'noreply@creatorshield.com';

// Helper function to send email via Brevo
async function sendEmailViaBrevo({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.BREVO_SMTP_USERNAME || !process.env.BREVO_SMTP_PASSWORD) {
    console.warn('❌ Brevo SMTP credentials not configured');
    return { success: false, error: 'Brevo SMTP not configured' };
  }

  try {
    const result = await transporter.sendMail({
      from: fromEmail,
      to: to,
      subject: subject,
      html: html
    });
    
    console.log(`✅ Email sent via Brevo to ${to}, Message ID: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Brevo email sending failed:', error);
    return { success: false, error: (error as Error).message };
  }
}


/**
 * Stores a violation reported by the backend and sends an email alert to the creator.
 * This function is intended to be called by a webhook from our FastAPI service.
 */
export async function processViolationFromFastApi(violationData: Omit<Violation, 'id' | 'detectedAt'> & { creatorEmail: string }) {
  if (!transporter) {
    console.warn('Brevo SMTP is not configured. Email will not be sent, but violation will be stored.');
  }

  try {
    const newViolation = await createViolation({
      creatorId: violationData.creatorId,
      matchedURL: violationData.matchedURL,
      platform: violationData.platform,
      matchScore: violationData.matchScore,
      status: violationData.status,
      originalContentUrl: "http://example.com/original", 
      originalContentTitle: "Sample Original Work", 
      infringingContentSnippet: "A snippet of the infringing content..."
    });
    console.log(`Stored violation with ID: ${newViolation.id}`);

    if (transporter) {
      const emailData = {
        firstName: 'Creator',
        actionType: 'Potential Copyright Violation Detected',
        status: 'Alert',
        timestamp: new Date().toLocaleString(),
        referenceId: `VIOLATION-${newViolation.id}`,
        customMessage: `CreatorShield found a potential violation of your content at ${violationData.matchedURL}. Please log in to your dashboard to review and take appropriate action.`,
        dashboardLink: 'https://creatorshield.com/dashboard',
        reportLink: 'https://creatorshield.com/violations'
      };
      
      const emailContent = unifiedEmailTemplates.generateTemplate(emailData);
      
      await transporter.sendMail({
            from: fromEmail,
            to: violationData.creatorEmail,
          subject: emailContent.subject,
          html: emailContent.html,
        });
        console.log(`Sent violation alert email to ${violationData.creatorEmail}`);
    }
    
    return { success: true, violationId: newViolation.id };
  } catch (error) {
    console.error('Error processing violation or sending email:', error);
    return { success: false, error: (error as Error).message };
  }
}


export async function updateAllUserAnalytics() {
  console.log('Skipping analytics update: No database connected.');
  return { success: true, updated: 0, total: 0 };
}

// Enhanced strike approval email using unified template
export async function sendStrikeApprovalEmail({ to, creatorName, infringingUrl, submissionDate, templateId }: { to: string; creatorName: string; infringingUrl: string; submissionDate: string, templateId: string }) {
  if (!transporter) {
    console.warn(`SIMULATING: Sending strike approval email to ${to}. BREVO_SMTP not configured.`);
    return { success: true, simulated: true };
  }
  
  const emailData = createEmailData.strikeApproval(creatorName, infringingUrl, new Date().toLocaleString());
  const emailContent = unifiedEmailTemplates.generateTemplate(emailData);
  
  try {
    const result = await transporter.sendMail({
        from: fromEmail,
        to: to,
        subject: emailContent.subject,
        html: emailContent.html,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to send strike approval email:", error);
    return { success: false, message: "Could not send email." };
  }
}

// Enhanced strike denial email using unified template
export async function sendStrikeDenialEmail({ to, creatorName, infringingUrl, reason }: { to: string; creatorName: string; infringingUrl: string; reason: string }) {
  if (!transporter) {
    console.warn(`SIMULATING: Sending strike denial email to ${to}. BREVO_SMTP not configured.`);
    return { success: true, simulated: true };
  }
  
  const emailData = {
    firstName: creatorName.split(' ')[0] || creatorName,
    actionType: 'Copyright Strike Request',
    status: 'Rejected',
    timestamp: new Date().toLocaleString(),
    referenceId: `STRIKE-${Date.now()}`,
    customMessage: `After careful review, we have decided not to proceed with your takedown request for ${infringingUrl}. Reason: ${reason || 'No specific reason provided.'} If you have new information or believe this decision was made in error, you can resubmit your request with additional details.`,
    dashboardLink: 'https://creatorshield.com/dashboard',
    reportLink: 'https://creatorshield.com/reports'
  };
  
  const emailContent = unifiedEmailTemplates.generateTemplate(emailData);

  try {
    const result = await transporter.sendMail({
        from: fromEmail,
        to: to,
        subject: emailContent.subject,
        html: emailContent.html,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to send strike denial email:", error);
    return { success: false, message: "Could not send email." };
  }
}

// Enhanced reactivation approval email using unified template
export async function sendReactivationApprovalEmail({ to, name }: { to: string; name:string }) {
  if (!transporter) {
    console.warn(`SIMULATING: Sending reactivation approval email to ${to}. BREVO_SMTP not configured.`);
    return { success: true, simulated: true };
  }
  
  const emailData = createEmailData.accountReactivation(name, new Date().toLocaleString());
  const emailContent = unifiedEmailTemplates.generateTemplate(emailData);
  
  try {
    const result = await transporter.sendMail({
        from: fromEmail,
        to: to,
        subject: emailContent.subject,
        html: emailContent.html,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to send reactivation approval email:", error);
    return { success: false, message: "Could not send email." };
  }
}

// Enhanced reactivation denial email using unified template
export async function sendReactivationDenialEmail({ to, name }: { to: string; name: string }) {
  if (!transporter) {
    console.warn(`SIMULATING: Sending reactivation denial email to ${to}. BREVO_SMTP not configured.`);
    return { success: true, simulated: true };
  }
  
  const emailData = {
    firstName: name.split(' ')[0] || name,
    actionType: 'Account Reactivation Request',
    status: 'Rejected',
    timestamp: new Date().toLocaleString(),
    referenceId: `ACC-${Date.now()}`,
    customMessage: 'We have reviewed your request for account reactivation and have decided not to proceed at this time. If you believe this decision was made in error or have new information to share, please contact our support team.',
    dashboardLink: 'https://creatorshield.com/support'
  };
  
  const emailContent = unifiedEmailTemplates.generateTemplate(emailData);
  
  try {
    const result = await transporter.sendMail({
        from: fromEmail,
        to: to,
        subject: emailContent.subject,
        html: emailContent.html,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to send reactivation denial email:", error);
    return { success: false, message: "Could not send email." };
  }
}

// Enhanced takedown confirmation email using unified template
export async function sendTakedownConfirmationEmail(data: {
  to: string;
  creatorName: string;
  infringingUrl: string;
  originalUrl: string;
}) {
  if (!transporter) {
    console.warn(`SIMULATING: Sending takedown confirmation email to ${data.to}. BREVO_SMTP not configured.`);
    return { success: true, simulated: true };
  }
  
  const emailData = {
    firstName: data.creatorName.split(' ')[0] || data.creatorName,
    actionType: 'DMCA Takedown Notice',
    status: 'Submitted',
    timestamp: new Date().toLocaleString(),
    referenceId: `DMCA-${Date.now()}`,
    customMessage: `Your takedown request for the content at ${data.infringingUrl} has been submitted to YouTube. We will notify you of any updates from the platform regarding this request.`,
    dashboardLink: 'https://creatorshield.com/dashboard',
    reportLink: 'https://creatorshield.com/reports'
  };
  
  const emailContent = unifiedEmailTemplates.generateTemplate(emailData);
  
  try {
    const result = await transporter.sendMail({
          from: fromEmail,
          to: data.to,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    return { success: true, data: result };
  } catch (error) {
      console.error("Failed to send takedown confirmation email:", error);
      return { success: false, message: "Could not send email." };
  }
}

// New email functions for admin actions using unified template
export async function sendDisconnectApprovalEmail({ to, creatorName, approvalTime }: { to: string; creatorName: string; approvalTime: string }) {
  if (!transporter) {
    console.warn(`SIMULATING: Sending disconnect approval email to ${to}. BREVO_SMTP not configured.`);
    return { success: true, simulated: true };
  }
  
  const emailData = createEmailData.disconnectApproval(creatorName, approvalTime);
  const emailContent = unifiedEmailTemplates.generateTemplate(emailData);
  
  try {
    const result = await transporter.sendMail({
        from: fromEmail,
        to: to,
        subject: emailContent.subject,
        html: emailContent.html,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to send disconnect approval email:", error);
    return { success: false, message: "Could not send email." };
  }
}

export async function sendMarkAsReadNotificationEmail({ to, creatorName, feedbackTitle, readTime }: { to: string; creatorName: string; feedbackTitle: string; readTime: string }) {
  if (!transporter) {
    console.warn(`SIMULATING: Sending mark as read notification email to ${to}. BREVO_SMTP not configured.`);
    return { success: true, simulated: true };
  }
  
  const emailData = createEmailData.markAsRead(creatorName, feedbackTitle, readTime);
  const emailContent = unifiedEmailTemplates.generateTemplate(emailData);
  
  try {
    const result = await transporter.sendMail({
        from: fromEmail,
        to: to,
        subject: emailContent.subject,
        html: emailContent.html,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to send mark as read notification email:", error);
    return { success: false, message: "Could not send email." };
  }
}

export async function sendFeedbackReplyEmail({ to, creatorName, feedbackTitle, adminReply, replyTime }: { to: string; creatorName: string; feedbackTitle: string; adminReply: string; replyTime: string }) {
  if (!transporter) {
    console.warn(`SIMULATING: Sending feedback reply email to ${to}. BREVO_SMTP not configured.`);
    return { success: true, simulated: true };
  }
  
  const emailData = createEmailData.feedbackReply(creatorName, feedbackTitle, adminReply, replyTime);
  const emailContent = unifiedEmailTemplates.generateTemplate(emailData);
  
  try {
    const result = await transporter.sendMail({
        from: fromEmail,
        to: to,
        subject: emailContent.subject,
        html: emailContent.html,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to send feedback reply email:", error);
    return { success: false, message: "Could not send email." };
  }
}

// New function for account deactivation email
export async function sendAccountDeactivationEmail({ to, creatorName, deactivationTime }: { to: string; creatorName: string; deactivationTime: string }) {
  if (!transporter) {
    console.warn(`SIMULATING: Sending account deactivation email to ${to}. BREVO_SMTP not configured.`);
    return { success: true, simulated: true };
  }
  
  const emailData = createEmailData.accountDeactivation(creatorName, deactivationTime);
  const emailContent = unifiedEmailTemplates.generateTemplate(emailData);
  
  try {
    const result = await transporter.sendMail({
        from: fromEmail,
        to: to,
        subject: emailContent.subject,
        html: emailContent.html,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to send account deactivation email:", error);
    return { success: false, message: "Could not send email." };
  }
}

// New function for account reactivation email
export async function sendAccountReactivationEmail({ to, creatorName, reactivationTime }: { to: string; creatorName: string; reactivationTime: string }) {
  if (!transporter) {
    console.warn('Brevo SMTP is not configured. Email will not be sent.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const emailData = {
      firstName: creatorName.split(' ')[0] || creatorName,
      actionType: 'Account Reactivation',
      status: 'Approved',
      timestamp: reactivationTime,
      referenceId: `REACTIVATION-${Date.now()}`,
      customMessage: `Your CreatorShield account has been successfully reactivated. You can now log in and access all your features. Welcome back!`,
      dashboardLink: 'https://creatorshield.com/dashboard',
      reportLink: 'https://creatorshield.com/reports',
      settingsLink: 'https://creatorshield.com/settings'
    };
    
    const emailContent = unifiedEmailTemplates.generateTemplate(emailData);
    
    await transporter.sendMail({
      from: fromEmail,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html,
    });
    
    console.log(`Sent reactivation email to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending reactivation email:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function sendWelcomeEmail({ to, creatorName }: { to: string; creatorName: string }) {
  console.log(`🔍 sendWelcomeEmail called with:`, { to, creatorName });
  console.log(`🔍 BREVO_SMTP exists:`, !!process.env.BREVO_SMTP_USERNAME);
  
  if (!process.env.BREVO_SMTP_USERNAME || !process.env.BREVO_SMTP_PASSWORD) {
    console.warn('❌ Brevo SMTP is not configured. Email will not be sent.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    console.log(`🔍 Creating email data for welcome email`);
    const emailData = {
      firstName: creatorName.split(' ')[0] || creatorName,
      actionType: 'Account Registration',
      status: 'Successful',
      timestamp: new Date().toLocaleString(),
      referenceId: `WELCOME-${Date.now()}`,
      customMessage: `Welcome to CreatorShield! Your account has been successfully created. We're excited to help you protect your creative content and manage your digital assets. You can now choose a subscription plan and start using our powerful copyright protection features.`,
      dashboardLink: 'https://creatorshield.com/dashboard',
      reportLink: 'https://creatorshield.com/reports',
      settingsLink: 'https://creatorshield.com/settings'
    };
    
    console.log(`🔍 Email data created:`, emailData);
    const emailContent = unifiedEmailTemplates.generateTemplate(emailData);
    console.log(`🔍 Email content generated, subject:`, emailContent.subject);
    
    console.log(`🔍 Attempting to send email via Brevo`);
    const result = await sendEmailViaBrevo({
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    });
    
    console.log(`✅ Brevo API response:`, result);
    if (result.success) {
      console.log(`✅ Welcome email sent to ${to}`);
    } else {
      console.error(`❌ Welcome email failed:`, result.error);
    }
    return result;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function sendAdminNotificationEmail({ 
  to, 
  subject, 
  message, 
  creatorName, 
  creatorEmail 
}: { 
  to: string; 
  subject: string; 
  message: string; 
  creatorName?: string; 
  creatorEmail?: string; 
}) {
  console.log(`🔍 sendAdminNotificationEmail called with:`, { to, subject, message, creatorName, creatorEmail });
  console.log(`🔍 BREVO_SMTP exists:`, !!process.env.BREVO_SMTP_USERNAME);
  
  if (!process.env.BREVO_SMTP_USERNAME || !process.env.BREVO_SMTP_PASSWORD) {
    console.warn('❌ Brevo SMTP is not configured. Email will not be sent.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    console.log(`🔍 Creating email data for admin notification`);
    const emailData = {
      firstName: 'Admin',
      actionType: 'Admin Notification',
      status: 'New Alert',
      timestamp: new Date().toLocaleString(),
      referenceId: `ADMIN-${Date.now()}`,
      customMessage: message,
      dashboardLink: 'https://creatorshield.com/admin',
      reportLink: 'https://creatorshield.com/admin/reports',
      settingsLink: 'https://creatorshield.com/admin/settings'
    };
    
    console.log(`🔍 Email data created:`, emailData);
    const emailContent = unifiedEmailTemplates.generateTemplate(emailData);
    console.log(`🔍 Email content generated, subject:`, emailContent.subject);
    
    console.log(`🔍 Attempting to send admin notification via Brevo`);
    const result = await sendEmailViaBrevo({
      to: to,
      subject: subject,
      html: emailContent.html
    });
    
    console.log(`✅ Brevo API response for admin notification:`, result);
    if (result.success) {
      console.log(`✅ Admin notification email sent to ${to}`);
    } else {
      console.error(`❌ Admin notification failed:`, result.error);
    }
    return result;
  } catch (error) {
    console.error('❌ Error sending admin notification email:', error);
    return { success: false, error: (error as Error).message };
  }
}

    