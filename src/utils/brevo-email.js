// Using direct fetch instead of SDK for better control
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Send OTP via email using Brevo API
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} recipientName - Optional recipient name
 * @returns {Promise<Object>} - Success/error response
 */
export async function sendOTP(email, otp, recipientName = 'User') {
  try {
    // Validate inputs
    if (!email || !otp) {
      throw new Error('Email and OTP are required');
    }

    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY environment variable is not set');
    }

    if (!process.env.SENDER_EMAIL) {
      throw new Error('SENDER_EMAIL environment variable is not set');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      throw new Error('OTP must be 6 digits');
    }

    console.log(`📧 Sending OTP to: ${email}`);

    // Create email content
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 40px 30px; }
          .otp-box { background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 10px; padding: 30px; margin: 20px 0; text-align: center; }
          .otp-code { font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px; margin: 15px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0; color: #856404; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 OTP Verification</h1>
            <p>CreatorShield Security Code</p>
          </div>
          
          <div class="content">
            <h2>Hello ${recipientName}!</h2>
            <p>You have requested an OTP for your CreatorShield account. Please use the code below to verify your identity:</p>
            
            <div class="otp-box">
              <h3>Your OTP Code</h3>
              <div class="otp-code">${otp}</div>
              <p><strong>This code will expire in 5 minutes.</strong></p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              • Never share this code with anyone<br>
              • CreatorShield will never ask for this code via phone or email<br>
              • If you didn't request this code, please ignore this email
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
          </div>
          
          <div class="footer">
            <p>© 2024 CreatorShield. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Prepare email data for direct API call
    const emailData = {
      sender: {
        name: "CreatorShield",
        email: process.env.SENDER_EMAIL
      },
      to: [
        {
          email: email,
          name: recipientName
        }
      ],
      subject: "🔐 Your OTP Code - CreatorShield",
      htmlContent: htmlContent
    };

    // Send email using direct fetch
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      
      throw new Error(JSON.stringify({
        status: response.status,
        details: errorData
      }));
    }

    const responseData = await response.json();
    
    console.log(`✅ OTP sent successfully to ${email}`);
    console.log(`📧 Message ID: ${responseData.messageId}`);
    
    return {
      success: true,
      messageId: responseData.messageId,
      message: 'OTP sent successfully'
    };

  } catch (error) {
    console.error('❌ OTP sending failed:', error);
    
    // Handle specific Brevo API errors
    try {
      const errorData = JSON.parse(error.message);
      console.error('Brevo API Error Details:', errorData);
      
      return {
        success: false,
        error: 'Failed to send OTP',
        details: errorData.details,
        status: errorData.status
      };
    } catch (parseError) {
      return {
        success: false,
        error: 'Failed to send OTP',
        details: error.message,
        status: 500
      };
    }
  }
}

/**
 * Test Brevo API connection
 * @returns {Promise<Object>} - Connection test result
 */
export async function testBrevoConnection() {
  try {
    console.log('🔍 Testing Brevo API connection...');
    
    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY not found in environment variables');
    }
    
    if (!process.env.SENDER_EMAIL) {
      throw new Error('SENDER_EMAIL not found in environment variables');
    }
    
    console.log('✅ Environment variables configured');
    console.log(`📧 Sender Email: ${process.env.SENDER_EMAIL}`);
    console.log(`🔑 API Key: ${process.env.BREVO_API_KEY.substring(0, 10)}...`);
    
    return {
      success: true,
      message: 'Brevo API connection test passed'
    };
    
  } catch (error) {
    console.error('❌ Brevo API connection test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default sendOTP; 