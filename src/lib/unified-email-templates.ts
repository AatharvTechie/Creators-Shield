/**
 * Unified Email Template System for Creator Shield
 * Based on the provided design template
 */

export interface EmailTemplateData {
  firstName: string;
  actionType: string;
  status: string;
  timestamp: string;
  referenceId?: string;
  customMessage: string;
  dashboardLink?: string;
  reportLink?: string;
  settingsLink?: string;
  videoTitle?: string;
}

export const unifiedEmailTemplates = {
  // Generate unified email template
  generateTemplate: (data: EmailTemplateData) => ({
    subject: `[CreatorShield] Confirmation of Recent Activity on Your Account`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CreatorShield - Account Activity Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 30px; text-align: center;">
            <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px; color: white;">🛡️</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">CreatorShield</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">Account Activity Confirmation</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px; font-weight: 600;">Hi ${data.firstName},</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin-bottom: 20px;">
                We appreciate your continued trust in <strong>CreatorShield</strong> — the platform dedicated to safeguarding your digital content and creative assets.
              </p>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin-bottom: 25px;">
                Here's a summary of your recent activity:
              </p>
            </div>

            <!-- Activity Summary Card -->
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background-color: #0ea5e9; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-size: 18px;">📊</span>
                </div>
                <h3 style="color: #0c4a6e; margin: 0; font-size: 18px; font-weight: 600;">Activity Summary</h3>
              </div>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #6b7280; font-size: 14px;">🔹 Action:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${data.actionType}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #6b7280; font-size: 14px;">🔹 Status:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${data.status}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #6b7280; font-size: 14px;">🔹 Date & Time:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${data.timestamp}</span>
                </div>
                ${data.referenceId ? `
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-size: 14px;">🔹 Reference ID:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${data.referenceId}</span>
                </div>
                ` : ''}
              </div>
            </div>

            <!-- Custom Message -->
            <div style="margin: 30px 0;">
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; border-left: 4px solid #0ea5e9;">
                <p style="color: #1f2937; font-size: 15px; line-height: 1.7; margin: 0; font-style: italic;">
                  ${data.customMessage}
                </p>
              </div>
            </div>

            <!-- Next Steps -->
            <div style="margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px; font-size: 18px; font-weight: 600;">Next Steps</h3>
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="color: #0ea5e9; font-size: 18px; margin-right: 10px;">📊</span>
                  <span style="color: #1f2937; font-size: 14px;">
                    <strong>View Dashboard:</strong> 
                    <a href="${data.dashboardLink || '#'}" style="color: #0ea5e9; text-decoration: none;">Dashboard</a>
                  </span>
                </div>
                ${data.reportLink ? `
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="color: #0ea5e9; font-size: 18px; margin-right: 10px;">📝</span>
                  <span style="color: #1f2937; font-size: 14px;">
                    <strong>Review Full Report:</strong> 
                    <a href="${data.reportLink}" style="color: #0ea5e9; text-decoration: none;">View Report</a>
                  </span>
                </div>
                ` : ''}
                <div style="display: flex; align-items: center;">
                  <span style="color: #0ea5e9; font-size: 18px; margin-right: 10px;">⚙️</span>
                  <span style="color: #1f2937; font-size: 14px;">
                    <strong>Manage Account Settings:</strong> 
                    <a href="${data.settingsLink || '#'}" style="color: #0ea5e9; text-decoration: none;">Settings</a>
                  </span>
                </div>
              </div>
            </div>

            <!-- Need Assistance -->
            <div style="margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px; font-size: 18px; font-weight: 600;">Need Assistance?</h3>
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 15px;">
                  If you have any questions or notice suspicious activity, we're here to help:
                </p>
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                  <span style="color: #0ea5e9; font-size: 16px; margin-right: 10px;">💬</span>
                  <span style="color: #1f2937; font-size: 14px;">
                    <strong>Support:</strong> 
                    <a href="mailto:support@creatorshield.com" style="color: #0ea5e9; text-decoration: none;">support@creatorshield.com</a>
                  </span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="color: #0ea5e9; font-size: 16px; margin-right: 10px;">📚</span>
                  <span style="color: #1f2937; font-size: 14px;">
                    <strong>Help Center:</strong> 
                    <a href="https://www.creatorshield.com/help" style="color: #0ea5e9; text-decoration: none;">www.creatorshield.com/help</a>
                  </span>
                </div>
              </div>
            </div>

            <!-- Security Reminder -->
            <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 1px solid #fecaca; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background-color: #dc2626; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-size: 18px;">🔒</span>
                </div>
                <h3 style="color: #991b1b; margin: 0; font-size: 18px; font-weight: 600;">Security Reminder</h3>
              </div>
              
              <p style="color: #991b1b; font-size: 15px; line-height: 1.6; margin: 0;">
                If you did not initiate this action, please secure your account immediately by resetting your password and reviewing your activity logs.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 20px;">
              <img src="https://via.placeholder.com/150x40/1f2937/ffffff?text=Creator+Shield" alt="Creator Shield" style="height: 40px;">
            </div>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px;">
              Warm regards,<br>
              <strong>The CreatorShield Team</strong>
            </p>
            <div style="margin-top: 15px;">
              <a href="https://www.creatorshield.com" style="color: #0ea5e9; text-decoration: none; margin-right: 15px;">🌐 www.creatorshield.com</a>
              <a href="mailto:support@creatorshield.com" style="color: #0ea5e9; text-decoration: none;">✉️ support@creatorshield.com</a>
            </div>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                This is an automated notification. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Helper function to create email data for different actions
export const createEmailData = {
  // Disconnect Approval
  disconnectApproval: (creatorName: string, approvalTime: string) => ({
    firstName: creatorName.split(' ')[0] || creatorName,
    actionType: 'YouTube Channel Disconnect Request',
    status: 'Approved',
    timestamp: approvalTime,
    customMessage: 'Your request to disconnect or change your YouTube channel has been approved. You can now proceed with disconnecting your current YouTube channel and connecting a new one through your Creator Shield dashboard.',
    dashboardLink: 'https://creatorshield.com/dashboard',
    settingsLink: 'https://creatorshield.com/settings'
  }),

  // Mark as Read
  markAsRead: (creatorName: string, feedbackTitle: string, readTime: string) => ({
    firstName: creatorName.split(' ')[0] || creatorName,
    actionType: 'Feedback Review',
    status: 'Reviewed',
    timestamp: readTime,
    referenceId: `FB-${Date.now()}`,
    customMessage: `Your feedback submission "${feedbackTitle}" has been reviewed by our admin team. We appreciate you taking the time to share your thoughts with us.`,
    dashboardLink: 'https://creatorshield.com/dashboard'
  }),

  // Feedback Reply
  feedbackReply: (creatorName: string, feedbackTitle: string, adminReply: string, replyTime: string) => ({
    firstName: creatorName.split(' ')[0] || creatorName,
    actionType: 'Feedback Response',
    status: 'Replied',
    timestamp: replyTime,
    referenceId: `FB-${Date.now()}`,
    customMessage: `Our admin team has provided a response to your feedback "${feedbackTitle}". We value your input and are committed to continuously improving our platform based on creator feedback.`,
    dashboardLink: 'https://creatorshield.com/dashboard'
  }),

  // Strike Approval
  strikeApproval: (creatorName: string, infringingUrl: string, approvalTime: string) => ({
    firstName: creatorName.split(' ')[0] || creatorName,
    actionType: 'Copyright Strike Request',
    status: 'Approved',
    timestamp: approvalTime,
    referenceId: `STRIKE-${Date.now()}`,
    customMessage: `Your copyright strike request for the content at ${infringingUrl} has been approved. We will now proceed with the formal takedown process with the concerned platform.`,
    dashboardLink: 'https://creatorshield.com/dashboard',
    reportLink: 'https://creatorshield.com/reports'
  }),

  // Account Deactivation
  accountDeactivation: (creatorName: string, deactivationTime: string) => ({
    firstName: creatorName.split(' ')[0] || creatorName,
    actionType: 'Account Status Change',
    status: 'Deactivated',
    timestamp: deactivationTime,
    referenceId: `ACC-${Date.now()}`,
    customMessage: 'Your Creator Shield account has been deactivated due to a violation of our platform policies. To regain access, you must submit a reactivation request through our platform.',
    dashboardLink: 'https://creatorshield.com/reactivation'
  }),

  // Account Reactivation
  accountReactivation: (creatorName: string, reactivationTime: string) => ({
    firstName: creatorName.split(' ')[0] || creatorName,
    actionType: 'Account Reactivation',
    status: 'Approved',
    timestamp: reactivationTime,
    referenceId: `ACC-${Date.now()}`,
    customMessage: 'Your reactivation request has been approved. Your account will be automatically activated after 24 hours.',
    dashboardLink: 'https://creatorshield.com/dashboard',
    settingsLink: 'https://creatorshield.com/settings'
  })
}; 