export const additionalEmailTemplates = {
  // Mark as read notification
  markAsRead: (creatorName: string, readTime: string) => ({
    subject: 'Feedback Marked as Read - Creator Shield',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #059669; margin: 0; font-size: 24px;">Feedback Read</h1>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Dear <strong>${creatorName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Your feedback has been reviewed and marked as read by our admin team at ${readTime}.
          </p>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #166534; font-size: 14px; margin: 0;">
              <strong>Status:</strong> Read<br>
              <strong>Read Time:</strong> ${readTime}<br>
              <strong>Next Step:</strong> We will respond if further action is needed
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Thank you for your feedback!<br>
              <strong>Creator Shield Team</strong>
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // Platform connected notification
  platformConnected: (creatorName: string, connectTime: string) => ({
    subject: 'Platform Connected Successfully - Creator Shield',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #059669; margin: 0; font-size: 24px;">Platform Connected!</h1>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Dear <strong>${creatorName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Great news! Your platform has been successfully connected to Creator Shield at ${connectTime}.
          </p>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #166534; font-size: 14px; margin: 0;">
              <strong>Status:</strong> Connected<br>
              <strong>Connect Time:</strong> ${connectTime}<br>
              <strong>Next Step:</strong> Start monitoring your content
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Your content is now protected!<br>
              <strong>Creator Shield Team</strong>
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // 2FA setup notification
  twoFASetup: (creatorName: string, setupTime: string) => ({
    subject: 'Two-Factor Authentication Enabled - Creator Shield',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #059669; margin: 0; font-size: 24px;">2FA Enabled</h1>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Dear <strong>${creatorName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Your two-factor authentication has been successfully enabled at ${setupTime}.
          </p>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #166534; font-size: 14px; margin: 0;">
              <strong>Status:</strong> Enabled<br>
              <strong>Setup Time:</strong> ${setupTime}<br>
              <strong>Security:</strong> Enhanced account protection
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Your account is now more secure!<br>
              <strong>Creator Shield Team</strong>
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // New device login notification
  newDeviceLogin: (creatorName: string, loginTime: string) => ({
    subject: 'New Device Login Detected - Creator Shield',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin: 0; font-size: 24px;">New Device Login</h1>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Dear <strong>${creatorName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We detected a new device login to your Creator Shield account at ${loginTime}.
          </p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #991b1b; font-size: 14px; margin: 0;">
              <strong>Login Time:</strong> ${loginTime}<br>
              <strong>Action:</strong> New device detected<br>
              <strong>Security:</strong> If this wasn't you, please change your password immediately
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Stay safe!<br>
              <strong>Creator Shield Team</strong>
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // Subscription activated notification
  subscriptionActivated: (creatorName: string, activationTime: string) => ({
    subject: 'Subscription Activated - Creator Shield',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #059669; margin: 0; font-size: 24px;">Subscription Active!</h1>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Dear <strong>${creatorName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Your subscription has been successfully activated at ${activationTime}.
          </p>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #166534; font-size: 14px; margin: 0;">
              <strong>Status:</strong> Active<br>
              <strong>Activation Time:</strong> ${activationTime}<br>
              <strong>Features:</strong> All premium features unlocked
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Welcome to premium!<br>
              <strong>Creator Shield Team</strong>
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // Copyright match notification
  copyrightMatch: (creatorName: string, matchTime: string) => ({
    subject: 'Copyright Violation Detected - Creator Shield',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin: 0; font-size: 24px;">Copyright Violation</h1>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Dear <strong>${creatorName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We detected a potential copyright violation of your content at ${matchTime}.
          </p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #991b1b; font-size: 14px; margin: 0;">
              <strong>Detection Time:</strong> ${matchTime}<br>
              <strong>Action Required:</strong> Review and take action<br>
              <strong>Next Step:</strong> Check your dashboard for details
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Protect your content!<br>
              <strong>Creator Shield Team</strong>
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // Welcome email
  welcome: (creatorName: string, welcomeTime: string) => ({
    subject: 'Welcome to Creator Shield!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #059669; margin: 0; font-size: 24px;">Welcome!</h1>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Dear <strong>${creatorName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Welcome to Creator Shield! We're excited to have you on board.
          </p>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #166534; font-size: 14px; margin: 0;">
              <strong>Welcome Time:</strong> ${welcomeTime}<br>
              <strong>Status:</strong> Account created successfully<br>
              <strong>Next Step:</strong> Start protecting your content
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Let's protect your creativity!<br>
              <strong>Creator Shield Team</strong>
            </p>
          </div>
        </div>
      </div>
    `
  }),

  // Test email
  test: (creatorName: string, testTime: string) => ({
    subject: 'Test Email - Creator Shield',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #059669; margin: 0; font-size: 24px;">Test Email</h1>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Dear <strong>${creatorName}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            This is a test email to verify your email notifications are working correctly.
          </p>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #166534; font-size: 14px; margin: 0;">
              <strong>Test Time:</strong> ${testTime}<br>
              <strong>Status:</strong> Email system working<br>
              <strong>Voice:</strong> Should play notification sound
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Test completed successfully!<br>
              <strong>Creator Shield Team</strong>
            </p>
          </div>
        </div>
      </div>
    `
  })
}; 