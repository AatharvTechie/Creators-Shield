import dotenv from 'dotenv';
import { sendOTP, testBrevoConnection } from './src/utils/brevo-email.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testBrevoEmail() {
  console.log('🧪 Testing Brevo Email Functionality...\n');
  
  // Test 1: Connection Test
  console.log('1️⃣ Testing Brevo Connection...');
  const connectionTest = await testBrevoConnection();
  console.log('Connection Test Result:', connectionTest);
  console.log('');
  
  if (!connectionTest.success) {
    console.error('❌ Connection test failed. Please check your environment variables.');
    return;
  }
  
  // Test 2: Send Test OTP
  console.log('2️⃣ Testing OTP Sending...');
  const testEmail = 'test@example.com'; // Replace with your test email
  const testOTP = '123456';
  const testName = 'Test User';
  
  console.log(`📧 Sending test OTP to: ${testEmail}`);
  const result = await sendOTP(testEmail, testOTP, testName);
  
  console.log('OTP Send Result:', result);
  console.log('');
  
  if (result.success) {
    console.log('✅ All tests passed! Brevo email is working correctly.');
  } else {
    console.error('❌ OTP sending failed. Check the error details above.');
  }
}

// Run the test
testBrevoEmail().catch(console.error); 