/**
 * Admin Email Templates for Creator Shield
 * Professional email templates for all admin actions
 */

export interface AdminEmailData {
  creatorName: string;
  actionTime: string;
  actionType: string;
  additionalData?: Record<string, any>;
}

export const adminEmailTemplates = {
  // Disconnect Approval Email
  disconnectApproval: (data: AdminEmailData) => ({
    subject: 'YouTube Channel Disconnect Request Approved - Creator Shield',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>YouTube Channel Disconnect Request Approved</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center;">
            <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px; color: white;">✅</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Request Approved</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">YouTube Channel Disconnect</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px; font-weight: 600;">Dear ${data.creatorName},</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin-bottom: 20px;">
                Great news! Your request to disconnect or change your YouTube channel has been <strong>approved</strong> by our admin team.
              </p>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin-bottom: 25px;">
                You can now proceed with disconnecting your current YouTube channel and connecting a new one through your Creator Shield dashboard.
              </p>
            </div>

            <!-- Approval Details Card -->
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #bbf7d0; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background-color: #059669; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-size: 18px;">🔄</span>
                </div>
                <h3 style="color: #166534; margin: 0; font-size: 18px; font-weight: 600;">Approval Details</h3>
              </div>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #6b7280; font-size: 14px;">Status:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">Approved</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #6b7280; font-size: 14px;">Approval Time:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${data.actionTime}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-size: 14px;">Action:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">Channel Disconnect/Change</span>
                </div>
              </div>
            </div>

            <!-- Next Steps -->
            <div style="margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px; font-size: 18px; font-weight: 600;">What You Can Do Now</h3>
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                <ul style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Log into your Creator Shield dashboard</li>
                  <li style="margin-bottom: 8px;">Navigate to the YouTube integration section</li>
                  <li style="margin-bottom: 8px;">Disconnect your current YouTube channel</li>
                  <li style="margin-bottom: 0;">Connect your new YouTube channel</li>
                </ul>
              </div>
            </div>

            <!-- Important Notice -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #fcd34d; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background-color: #f59e0b; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-size: 18px;">⚠️</span>
                </div>
                <h3 style="color: #92400e; margin: 0; font-size: 18px; font-weight: 600;">Important Notice</h3>
              </div>
              
              <p style="color: #92400e; font-size: 15px; line-height: 1.6; margin: 0;">
                Please ensure that you only connect your own YouTube channel. Connecting someone else's channel may result in account suspension. Make sure you have the necessary permissions for the channel you wish to connect.
              </p>
            </div>

            <!-- Support Section -->
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background-color: #0ea5e9; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-size: 18px;">💬</span>
                </div>
                <h3 style="color: #0c4a6e; margin: 0; font-size: 18px; font-weight: 600;">Need Help?</h3>
              </div>
              
              <p style="color: #0c4a6e; font-size: 15px; line-height: 1.6; margin-bottom: 15px;">
                If you encounter any issues during the channel disconnect/change process, our support team is here to help.
              </p>
              
              <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <p style="color: #1f2937; font-size: 14px; margin: 0;">
                  <strong>📧 Email:</strong> 
                  <a href="mailto:creatorshieldcommunity@gmail.com" style="color: #0ea5e9; text-decoration: none;">creatorshieldcommunity@gmail.com</a>
                </p>
                <p style="color: #1f2937; font-size: 14px; margin: 5px 0 0;">
                  <strong>⏰ Response Time:</strong> Within 24 hours
                </p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 20px;">
              <img src="https://via.placeholder.com/150x40/1f2937/ffffff?text=Creator+Shield" alt="Creator Shield" style="height: 40px;">
            </div>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px;">
              Thank you for being part of our community.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              <strong>Creator Shield Team</strong> | Protecting creators worldwide
            </p>
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
  }),

  // Mark as Read Notification Email
  markAsRead: (data: AdminEmailData) => ({
    subject: 'Your Feedback Has Been Reviewed - Creator Shield',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Feedback Acknowledged - Creator Shield</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 30px; text-align: center;">
            <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px; color: white;">📋</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Feedback Acknowledged</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">Creator Shield Support Team</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px; font-weight: 600;">Dear ${data.creatorName},</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin-bottom: 20px;">
                This is to confirm that our admin team has reviewed your feedback submission and marked it as read.
              </p>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin-bottom: 25px;">
                We appreciate you taking the time to share your thoughts with us. Your feedback is valuable to us and helps us improve our platform.
              </p>
            </div>

            <!-- Feedback Details Card -->
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background-color: #0ea5e9; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-size: 18px;">📝</span>
                </div>
                <h3 style="color: #0c4a6e; margin: 0; font-size: 18px; font-weight: 600;">Feedback Details</h3>
              </div>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #6b7280; font-size: 14px;">Title:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${data.additionalData?.feedbackTitle || 'Feedback Submission'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #6b7280; font-size: 14px;">Status:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">Reviewed</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-size: 14px;">Read Time:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${data.actionTime}</span>
                </div>
              </div>
            </div>

            <!-- What This Means -->
            <div style="margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px; font-size: 18px; font-weight: 600;">What This Means</h3>
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                <ul style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Your feedback has been received and reviewed by our team</li>
                  <li style="margin-bottom: 8px;">We are considering your suggestions and concerns</li>
                  <li style="margin-bottom: 8px;">If a response is needed, you will receive a follow-up</li>
                  <li style="margin-bottom: 0;">Your feedback contributes to platform improvements</li>
                </ul>
              </div>
            </div>

            <!-- Support Section -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #fcd34d; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background-color: #f59e0b; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-size: 18px;">💬</span>
                </div>
                <h3 style="color: #92400e; margin: 0; font-size: 18px; font-weight: 600;">Have Questions?</h3>
              </div>
              
              <p style="color: #92400e; font-size: 15px; line-height: 1.6; margin-bottom: 15px;">
                If you have any questions about your feedback or need additional assistance, our support team is here to help.
              </p>
              
              <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <p style="color: #1f2937; font-size: 14px; margin: 0;">
                  <strong>📧 Email:</strong> 
                  <a href="mailto:creatorshieldcommunity@gmail.com" style="color: #0ea5e9; text-decoration: none;">creatorshieldcommunity@gmail.com</a>
                </p>
                <p style="color: #1f2937; font-size: 14px; margin: 5px 0 0;">
                  <strong>⏰ Response Time:</strong> Within 24 hours
                </p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 20px;">
              <img src="https://via.placeholder.com/150x40/1f2937/ffffff?text=Creator+Shield" alt="Creator Shield" style="height: 40px;">
            </div>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px;">
              Thank you for your valuable feedback.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              <strong>Creator Shield Team</strong> | Protecting creators worldwide
            </p>
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
  }),

  // Feedback Reply Email
  feedbackReply: (data: AdminEmailData) => ({
    subject: 'Response to Your Feedback - Creator Shield',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Response to Your Feedback - Creator Shield</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center;">
            <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px; color: white;">💬</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Response to Your Feedback</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">Creator Shield Support Team</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px; font-weight: 600;">Dear ${data.creatorName},</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin-bottom: 20px;">
                Thank you for your feedback. Our admin team has reviewed your submission and has provided a response below.
              </p>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin-bottom: 25px;">
                We value your input and are committed to continuously improving our platform based on creator feedback.
              </p>
            </div>

            <!-- Feedback Details Card -->
            <div style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border: 1px solid #e9d5ff; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background-color: #8b5cf6; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-size: 18px;">📝</span>
                </div>
                <h3 style="color: #581c87; margin: 0; font-size: 18px; font-weight: 600;">Feedback Details</h3>
              </div>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #6b7280; font-size: 14px;">Title:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${data.additionalData?.feedbackTitle || 'Feedback Response'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #6b7280; font-size: 14px;">Status:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">Replied</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-size: 14px;">Reply Time:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${data.actionTime}</span>
                </div>
              </div>
            </div>

            <!-- Admin Response -->
            <div style="margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px; font-size: 18px; font-weight: 600;">Admin Response</h3>
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd; border-radius: 12px; padding: 25px;">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <div style="background-color: #0ea5e9; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                    <span style="color: white; font-size: 18px;">👨‍💼</span>
                  </div>
                  <h4 style="color: #0c4a6e; margin: 0; font-size: 16px; font-weight: 600;">Creator Shield Admin Team</h4>
                </div>
                
                <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <p style="color: #1f2937; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${data.additionalData?.adminReply || 'Thank you for your feedback. We appreciate your input and will consider it in our platform improvements.'}</p>
                </div>
              </div>
            </div>

            <!-- Next Steps -->
            <div style="margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px; font-size: 18px; font-weight: 600;">What Happens Next</h3>
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                <ul style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Our team will continue to monitor your feedback</li>
                  <li style="margin-bottom: 8px;">If additional action is needed, we will follow up</li>
                  <li style="margin-bottom: 8px;">Your feedback helps improve our platform for all creators</li>
                  <li style="margin-bottom: 0;">You can submit additional feedback anytime through your dashboard</li>
                </ul>
              </div>
            </div>

            <!-- Support Section -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #fcd34d; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background-color: #f59e0b; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-size: 18px;">💬</span>
                </div>
                <h3 style="color: #92400e; margin: 0; font-size: 18px; font-weight: 600;">Need Further Assistance?</h3>
              </div>
              
              <p style="color: #92400e; font-size: 15px; line-height: 1.6; margin-bottom: 15px;">
                If you have additional questions or need clarification on our response, please don't hesitate to reach out.
              </p>
              
              <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <p style="color: #1f2937; font-size: 14px; margin: 0;">
                  <strong>📧 Email:</strong> 
                  <a href="mailto:creatorshieldcommunity@gmail.com" style="color: #0ea5e9; text-decoration: none;">creatorshieldcommunity@gmail.com</a>
                </p>
                <p style="color: #1f2937; font-size: 14px; margin: 5px 0 0;">
                  <strong>⏰ Response Time:</strong> Within 24 hours
                </p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 20px;">
              <img src="https://via.placeholder.com/150x40/1f2937/ffffff?text=Creator+Shield" alt="Creator Shield" style="height: 40px;">
            </div>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px;">
              Thank you for being part of our community.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              <strong>Creator Shield Team</strong> | Protecting creators worldwide
            </p>
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
  }),

  // Strike Approval Email
  strikeApproval: (data: AdminEmailData) => ({
    subject: 'Copyright Strike Request Approved - Creator Shield',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Copyright Strike Request Approved</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center;">
            <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px; color: white;">🛡️</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Strike Request Approved</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">Copyright Protection</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px; font-weight: 600;">Dear ${data.creatorName},</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin-bottom: 20px;">
                Great news! Your copyright strike request has been <strong>approved</strong> by our admin team. We will now proceed with the formal takedown process.
              </p>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin-bottom: 25px;">
                We understand the importance of protecting your content and will work diligently to ensure your rights are upheld.
              </p>
            </div>

            <!-- Approval Details Card -->
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #bbf7d0; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background-color: #059669; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-size: 18px;">✅</span>
                </div>
                <h3 style="color: #166534; margin: 0; font-size: 18px; font-weight: 600;">Approval Details</h3>
              </div>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #6b7280; font-size: 14px;">Status:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">Approved</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #6b7280; font-size: 14px;">Approval Time:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${data.actionTime}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-size: 14px;">Infringing URL:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${data.additionalData?.infringingUrl || 'N/A'}</span>
                </div>
              </div>
            </div>

            <!-- Next Steps -->
            <div style="margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px; font-size: 18px; font-weight: 600;">What Happens Next</h3>
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                <ul style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">We will submit the takedown notice to the platform</li>
                  <li style="margin-bottom: 8px;">The platform will review the request (usually 24-48 hours)</li>
                  <li style="margin-bottom: 8px;">You will be notified of any updates or actions taken</li>
                  <li style="margin-bottom: 0;">Monitor your dashboard for status updates</li>
                </ul>
              </div>
            </div>

            <!-- Support Section -->
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background-color: #0ea5e9; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-size: 18px;">💬</span>
                </div>
                <h3 style="color: #0c4a6e; margin: 0; font-size: 18px; font-weight: 600;">Need Help?</h3>
              </div>
              
              <p style="color: #0c4a6e; font-size: 15px; line-height: 1.6; margin-bottom: 15px;">
                If you have any questions about the takedown process or need additional assistance, our support team is here to help.
              </p>
              
              <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <p style="color: #1f2937; font-size: 14px; margin: 0;">
                  <strong>📧 Email:</strong> 
                  <a href="mailto:creatorshieldcommunity@gmail.com" style="color: #0ea5e9; text-decoration: none;">creatorshieldcommunity@gmail.com</a>
                </p>
                <p style="color: #1f2937; font-size: 14px; margin: 5px 0 0;">
                  <strong>⏰ Response Time:</strong> Within 24 hours
                </p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 20px;">
              <img src="https://via.placeholder.com/150x40/1f2937/ffffff?text=Creator+Shield" alt="Creator Shield" style="height: 40px;">
            </div>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px;">
              Thank you for trusting us to protect your content.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              <strong>Creator Shield Team</strong> | Protecting creators worldwide
            </p>
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

/**
 * Helper function to send admin action emails
 */
export async function sendAdminActionEmail(
  actionType: keyof typeof adminEmailTemplates,
  emailData: AdminEmailData,
  to: string
) {
  const template = adminEmailTemplates[actionType];
  if (!template) {
    throw new Error(`Unknown action type: ${actionType}`);
  }

  const emailContent = template(emailData);
  
  // This would integrate with your email service (Resend, etc.)
  // For now, we'll return the email content
  return {
    success: true,
    subject: emailContent.subject,
    html: emailContent.html,
    to: to
  };
} 