export const emailTemplates = {
  // Template for when a creator is suspended
  suspension: (creatorName: string, suspensionTime: string) => ({
    subject: 'Account Suspended - Creator Shield',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Suspended - Creator Shield</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center;">
            <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px; color: white;">⚠️</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Account Suspended</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">Creator Shield Platform</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px; font-weight: 600;">Dear ${creatorName},</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin-bottom: 20px;">
                We regret to inform you that your Creator Shield account has been temporarily suspended for <strong>24 hours</strong> due to a violation of our platform policies and community guidelines.
              </p>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin-bottom: 25px;">
                This action was taken to maintain the integrity and safety of our platform for all creators. We understand this may be concerning, and we want to provide you with clear information about what this means.
              </p>
            </div>

            <!-- Suspension Details Card -->
            <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 1px solid #fecaca; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background-color: #dc2626; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-size: 18px;">⏰</span>
                </div>
                <h3 style="color: #991b1b; margin: 0; font-size: 18px; font-weight: 600;">Suspension Details</h3>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="background-color: white; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px; text-transform: uppercase; font-weight: 600;">Duration</p>
                  <p style="color: #1f2937; font-size: 16px; margin: 0; font-weight: 600;">24 Hours</p>
                </div>
                <div style="background-color: white; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px; text-transform: uppercase; font-weight: 600;">Status</p>
                  <p style="color: #1f2937; font-size: 16px; margin: 0; font-weight: 600;">Suspended</p>
                </div>
              </div>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #6b7280; font-size: 14px;">Start Time:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${suspensionTime}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-size: 14px;">End Time:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${new Date(new Date(suspensionTime).getTime() + 24 * 60 * 60 * 1000).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <!-- What This Means -->
            <div style="margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px; font-size: 18px; font-weight: 600;">What This Means</h3>
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                <ul style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">You cannot access your Creator Shield dashboard</li>
                  <li style="margin-bottom: 8px;">All platform services are temporarily unavailable</li>
                  <li style="margin-bottom: 8px;">Your account will automatically resume after 24 hours</li>
                  <li style="margin-bottom: 0;">No data or content will be lost during this period</li>
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
                If you believe this suspension was issued in error or have any questions, our support team is here to help.
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

            <!-- Next Steps -->
            <div style="margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px; font-size: 18px; font-weight: 600;">What Happens Next?</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                <div style="text-align: center; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                  <div style="background-color: #dc2626; border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                    <span style="color: white; font-size: 24px;">1</span>
                  </div>
                  <p style="color: #1f2937; font-size: 14px; margin: 0; font-weight: 600;">Suspension Period</p>
                  <p style="color: #6b7280; font-size: 12px; margin: 5px 0 0;">24 hours from now</p>
                </div>
                <div style="text-align: center; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                  <div style="background-color: #f59e0b; border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                    <span style="color: white; font-size: 24px;">2</span>
                  </div>
                  <p style="color: #1f2937; font-size: 14px; margin: 0; font-weight: 600;">Auto-Resume</p>
                  <p style="color: #6b7280; font-size: 12px; margin: 5px 0 0;">Account reactivates automatically</p>
                </div>
                <div style="text-align: center; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                  <div style="background-color: #10b981; border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                    <span style="color: white; font-size: 24px;">3</span>
                  </div>
                  <p style="color: #1f2937; font-size: 14px; margin: 0; font-weight: 600;">Full Access</p>
                  <p style="color: #6b7280; font-size: 12px; margin: 5px 0 0;">All features restored</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 20px;">
              <img src="https://via.placeholder.com/150x40/1f2937/ffffff?text=Creator+Shield" alt="Creator Shield" style="height: 40px;">
            </div>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px;">
              Thank you for your understanding and cooperation.
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

  // Template for when a creator is deactivated
  deactivation: (creatorName: string, deactivationTime: string) => ({
    subject: 'Account Deactivated - Creator Shield',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Deactivated - Creator Shield</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center;">
            <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px; color: white;">🚫</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Account Deactivated</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">Creator Shield Platform</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px; font-weight: 600;">Dear ${creatorName},</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin-bottom: 20px;">
                We regret to inform you that your Creator Shield account has been <strong>deactivated</strong> due to a serious violation of our platform policies, terms of service, or community guidelines.
              </p>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin-bottom: 25px;">
                This action was taken after careful review to maintain the integrity, safety, and quality of our platform for all creators. We understand this may be concerning, and we want to provide you with clear information about what this means and how to proceed.
              </p>
            </div>

            <!-- Deactivation Details Card -->
            <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 1px solid #fecaca; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background-color: #dc2626; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-size: 18px;">🔒</span>
                </div>
                <h3 style="color: #991b1b; margin: 0; font-size: 18px; font-weight: 600;">Deactivation Details</h3>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="background-color: white; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px; text-transform: uppercase; font-weight: 600;">Status</p>
                  <p style="color: #1f2937; font-size: 16px; margin: 0; font-weight: 600;">Deactivated</p>
                </div>
                <div style="background-color: white; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px; text-transform: uppercase; font-weight: 600;">Access</p>
                  <p style="color: #1f2937; font-size: 16px; margin: 0; font-weight: 600;">Blocked</p>
                </div>
              </div>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #6b7280; font-size: 14px;">Deactivation Date:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${deactivationTime}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-size: 14px;">Reactivation:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">Manual Request Required</span>
                </div>
              </div>
            </div>

            <!-- What This Means -->
            <div style="margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px; font-size: 18px; font-weight: 600;">What This Means</h3>
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                <ul style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Your account access is completely blocked</li>
                  <li style="margin-bottom: 8px;">You cannot access any Creator Shield services</li>
                  <li style="margin-bottom: 8px;">Your account will not automatically reactivate</li>
                  <li style="margin-bottom: 0;">You must submit a reactivation request to regain access</li>
                </ul>
              </div>
            </div>

            <!-- Reactivation Process -->
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background-color: #0ea5e9; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-size: 18px;">🔄</span>
                </div>
                <h3 style="color: #0c4a6e; margin: 0; font-size: 18px; font-weight: 600;">How to Request Reactivation</h3>
              </div>
              
              <p style="color: #0c4a6e; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                To regain access to your account, follow these steps:
              </p>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px;">
                <div style="text-align: center; padding: 15px; background-color: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <div style="background-color: #0ea5e9; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">
                    <span style="color: white; font-size: 18px;">1</span>
                  </div>
                  <p style="color: #1f2937; font-size: 12px; margin: 0; font-weight: 600;">Visit Platform</p>
                </div>
                <div style="text-align: center; padding: 15px; background-color: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <div style="background-color: #0ea5e9; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">
                    <span style="color: white; font-size: 18px;">2</span>
                  </div>
                  <p style="color: #1f2937; font-size: 12px; margin: 0; font-weight: 600;">Submit Request</p>
                </div>
                <div style="text-align: center; padding: 15px; background-color: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <div style="background-color: #0ea5e9; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">
                    <span style="color: white; font-size: 18px;">3</span>
                  </div>
                  <p style="color: #1f2937; font-size: 12px; margin: 0; font-weight: 600;">Provide Details</p>
                </div>
                <div style="text-align: center; padding: 15px; background-color: white; border-radius: 8px; border: 1px solid #e5e7eb;">
                  <div style="background-color: #0ea5e9; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">
                    <span style="color: white; font-size: 18px;">4</span>
                  </div>
                  <p style="color: #1f2937; font-size: 12px; margin: 0; font-weight: 600;">Wait Approval</p>
                </div>
              </div>
            </div>

            <!-- Reactivation Instructions -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #fcd34d; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background-color: #f59e0b; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-size: 18px;">📋</span>
                </div>
                <h3 style="color: #92400e; margin: 0; font-size: 18px; font-weight: 600;">Reactivation Request Process</h3>
              </div>
              
              <p style="color: #92400e; font-size: 15px; line-height: 1.6; margin-bottom: 15px;">
                <strong>Step-by-step instructions:</strong>
              </p>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <ol style="color: #1f2937; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;"><strong>Visit Creator Shield:</strong> Go to <a href="https://creatorshield.com" style="color: #0ea5e9;">creatorshield.com</a></li>
                  <li style="margin-bottom: 8px;"><strong>Try to Login:</strong> Attempt to log in with your credentials</li>
                  <li style="margin-bottom: 8px;"><strong>See Deactivation Notice:</strong> You'll see a message that your account is deactivated</li>
                  <li style="margin-bottom: 8px;"><strong>Click Reactivation:</strong> Click the "Request Reactivation" button</li>
                  <li style="margin-bottom: 8px;"><strong>Fill the Form:</strong> Complete the reactivation request form with your details</li>
                  <li style="margin-bottom: 0;"><strong>Submit & Wait:</strong> Submit your request and wait for admin approval</li>
                </ol>
              </div>
            </div>

            <!-- Support Section -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #fcd34d; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background-color: #f59e0b; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-size: 18px;">💬</span>
                </div>
                <h3 style="color: #92400e; margin: 0; font-size: 18px; font-weight: 600;">Need Assistance?</h3>
              </div>
              
              <p style="color: #92400e; font-size: 15px; line-height: 1.6; margin-bottom: 15px;">
                If you have questions about this deactivation or need help with the reactivation process, our support team is here to assist you.
              </p>
              
              <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <p style="color: #1f2937; font-size: 14px; margin: 0;">
                  <strong>📧 Email:</strong> 
                  <a href="mailto:creatorshieldcommunity@gmail.com" style="color: #0ea5e9; text-decoration: none;">creatorshieldcommunity@gmail.com</a>
                </p>
                <p style="color: #1f2937; font-size: 14px; margin: 5px 0 0;">
                  <strong>⏰ Response Time:</strong> Within 24-48 hours
                </p>
              </div>
            </div>

            <!-- Important Notice -->
            <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 1px solid #fecaca; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background-color: #dc2626; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-size: 18px;">⚠️</span>
                </div>
                <h3 style="color: #991b1b; margin: 0; font-size: 18px; font-weight: 600;">Important Notice</h3>
              </div>
              
              <p style="color: #991b1b; font-size: 15px; line-height: 1.6; margin: 0;">
                Your account data and content remain safe and will be preserved during this period. However, you will need to complete the reactivation process to regain access to your account and services.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="margin-bottom: 20px;">
              <img src="https://via.placeholder.com/150x40/1f2937/ffffff?text=Creator+Shield" alt="Creator Shield" style="height: 40px;">
            </div>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px;">
              We appreciate your understanding and cooperation.
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

  // Template for when suspension is lifted
  suspensionLifted: (creatorName: string) => ({
    subject: 'Account Access Restored - Creator Shield',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Access Restored - Creator Shield</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center;">
            <div style="background-color: rgba(255, 255, 255, 0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px; color: white;">✅</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Account Access Restored</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">Creator Shield Platform</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px; font-size: 22px; font-weight: 600;">Dear ${creatorName},</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin-bottom: 20px;">
                Great news! 🎉 Your Creator Shield account suspension has been lifted, and you now have full access to all platform features and services.
              </p>

              <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin-bottom: 25px;">
                We're glad to have you back in our community. Your account is now fully active and ready for you to continue creating and protecting your content.
              </p>
            </div>

            <!-- Account Status Card -->
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #bbf7d0; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background-color: #059669; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-size: 18px;">🟢</span>
                </div>
                <h3 style="color: #166534; margin: 0; font-size: 18px; font-weight: 600;">Account Status</h3>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div style="background-color: white; padding: 15px; border-radius: 8px; border-left: 4px solid #059669;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px; text-transform: uppercase; font-weight: 600;">Status</p>
                  <p style="color: #1f2937; font-size: 16px; margin: 0; font-weight: 600;">Active</p>
                </div>
                <div style="background-color: white; padding: 15px; border-radius: 8px; border-left: 4px solid #059669;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px; text-transform: uppercase; font-weight: 600;">Access</p>
                  <p style="color: #1f2937; font-size: 16px; margin: 0; font-weight: 600;">Full</p>
                </div>
                <div style="background-color: white; padding: 15px; border-radius: 8px; border-left: 4px solid #059669;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0 0 5px; text-transform: uppercase; font-weight: 600;">Features</p>
                  <p style="color: #1f2937; font-size: 16px; margin: 0; font-weight: 600;">All Available</p>
                </div>
              </div>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #6b7280; font-size: 14px;">Restoration Time:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">${new Date().toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-size: 14px;">Next Login:</span>
                  <span style="color: #1f2937; font-size: 14px; font-weight: 600;">Available Now</span>
                </div>
              </div>
            </div>

            <!-- What You Can Do Now -->
            <div style="margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px; font-size: 18px; font-weight: 600;">What You Can Do Now</h3>
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                <ul style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Access your Creator Shield dashboard</li>
                  <li style="margin-bottom: 8px;">Use all platform features and services</li>
                  <li style="margin-bottom: 8px;">Monitor and protect your content</li>
                  <li style="margin-bottom: 0;">Continue creating and growing your audience</li>
                </ul>
              </div>
            </div>

            <!-- Guidelines Reminder -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #fcd34d; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="background-color: #f59e0b; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                  <span style="color: white; font-size: 18px;">📋</span>
                </div>
                <h3 style="color: #92400e; margin: 0; font-size: 18px; font-weight: 600;">Platform Guidelines Reminder</h3>
              </div>
              
              <p style="color: #92400e; font-size: 15px; line-height: 1.6; margin-bottom: 15px;">
                To ensure a positive experience for everyone, please remember to follow our community guidelines:
              </p>
              
              <div style="background-color: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <ul style="color: #1f2937; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 5px;">Respect community guidelines and policies</li>
                  <li style="margin-bottom: 5px;">Maintain appropriate content standards</li>
                  <li style="margin-bottom: 5px;">Report any violations you encounter</li>
                  <li style="margin-bottom: 0;">Engage positively with other creators</li>
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
                If you have any questions or need assistance with your account, our support team is here to help.
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

            <!-- Welcome Back Message -->
            <div style="text-align: center; margin: 30px 0; padding: 30px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px;">
              <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
              <h3 style="color: #166534; margin: 0 0 10px; font-size: 20px; font-weight: 600;">Welcome Back!</h3>
              <p style="color: #166534; font-size: 16px; margin: 0;">
                We're excited to have you back in our community. Happy creating!
              </p>
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

  // Template for reactivation request approval
  reactivationApproved: (creatorName: string, approvalTime: string) => ({
    subject: 'Reactivation Request Approved - Creator Shield',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #059669; margin: 0; font-size: 24px;">Reactivation Approved</h1>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Dear <strong>${creatorName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Great news! Your reactivation request has been approved by our admin team. Your account will be automatically activated after 24 hours.
          </p>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #166534; font-size: 14px; margin: 0;">
              <strong>Approval Details:</strong><br>
              • Status: Approved<br>
              • Approval Time: ${approvalTime}<br>
              • Activation Time: ${new Date(new Date(approvalTime).getTime() + 24 * 60 * 60 * 1000).toLocaleString()}<br>
              • Process: Automatic after 24 hours
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            You will receive another notification when your account is fully activated. Thank you for your patience during this process.
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              We look forward to having you back!<br>
              <strong>Creator Shield Team</strong>
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // Template for reactivation request rejection
  reactivationRejected: (creatorName: string, rejectionTime: string) => ({
    subject: 'Reactivation Request Rejected - Creator Shield',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin: 0; font-size: 24px;">Reactivation Rejected</h1>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Dear <strong>${creatorName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We regret to inform you that your reactivation request has been rejected by our admin team after careful review.
          </p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #991b1b; font-size: 14px; margin: 0;">
              <strong>Rejection Details:</strong><br>
              • Status: Rejected<br>
              • Rejection Time: ${rejectionTime}<br>
              • Account Status: Remains Deactivated
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Your account will remain deactivated. If you believe this decision was made in error, you may submit a new reactivation request with additional documentation or clarification.
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            For further assistance, please contact our support team at 
            <a href="mailto:creatorshieldcommunity@gmail.com" style="color: #2563eb;">creatorshieldcommunity@gmail.com</a>
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Thank you for your understanding.<br>
              <strong>Creator Shield Team</strong>
            </p>
          </div>
        </div>
      </div>
    `
  })
}; 