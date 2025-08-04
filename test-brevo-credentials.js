require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

console.log('🔍 Testing Brevo SMTP Configuration...');
console.log('');

// Check environment variables
const brevoUsername = process.env.BREVO_SMTP_USERNAME;
const brevoPassword = process.env.BREVO_SMTP_PASSWORD;
const senderEmail = process.env.SENDER_EMAIL;

console.log('Environment Variables:');
console.log('BREVO_SMTP_USERNAME:', brevoUsername ? 'Present' : 'Missing');
console.log('BREVO_SMTP_PASSWORD:', brevoPassword ? 'Present' : 'Missing');
console.log('SENDER_EMAIL:', senderEmail ? 'Present' : 'Missing');
console.log('');

if (!brevoUsername || !brevoPassword) {
  console.log('❌ Missing Brevo credentials in .env.local');
  console.log('💡 Please add:');
  console.log('BREVO_SMTP_USERNAME=your_brevo_username');
  console.log('BREVO_SMTP_PASSWORD=your_brevo_api_key');
  console.log('SENDER_EMAIL=your-verified-email@yourdomain.com');
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransporter({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: brevoUsername,
    pass: brevoPassword,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test connection
async function testConnection() {
  try {
    console.log('🔌 Testing SMTP connection...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Test sending a simple email
    console.log('📧 Testing email sending...');
    const result = await transporter.sendMail({
      from: senderEmail || brevoUsername,
      to: 'test@example.com',
      subject: 'Test Email from CreatorShield',
      text: 'This is a test email to verify Brevo SMTP configuration.'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    
  } catch (error) {
    console.error('❌ SMTP test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('💡 This indicates invalid Brevo credentials. Please check:');
      console.log('1. Your Brevo username is correct');
      console.log('2. Your Brevo API key is correct');
      console.log('3. Your sender email is verified in Brevo');
    } else if (error.message.includes('Authentication failed')) {
      console.log('💡 Authentication failed. Please check your credentials.');
    } else {
      console.log('💡 Unknown error. Please check your Brevo configuration.');
    }
  }
}

testConnection(); 