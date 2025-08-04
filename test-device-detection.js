// Test script for device detection and notifications
// Run this with: node test-device-detection.js

const fetch = require('node-fetch');

async function testDeviceDetection() {
  console.log('🧪 Testing Device Detection and Notifications...\n');

  try {
    // Test 1: Check if login API accepts userAgent
    console.log('1. Testing login API with userAgent...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      })
    });

    console.log('Login API Response Status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login API Response:', JSON.stringify(loginData, null, 2));

    // Test 2: Check device sessions API
    console.log('\n2. Testing device sessions API...');
    const sessionsResponse = await fetch('http://localhost:3000/api/settings/devices?email=test@example.com');
    console.log('Device Sessions API Response Status:', sessionsResponse.status);
    const sessionsData = await sessionsResponse.json();
    console.log('Device Sessions API Response:', JSON.stringify(sessionsData, null, 2));

    // Test 3: Check email service
    console.log('\n3. Testing email service...');
    const emailResponse = await fetch('http://localhost:3000/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Test Device Detection',
        html: '<h1>Test Email</h1><p>This is a test email for device detection.</p>'
      })
    });
    console.log('Email API Response Status:', emailResponse.status);
    const emailData = await emailResponse.json();
    console.log('Email API Response:', JSON.stringify(emailData, null, 2));

    console.log('\n✅ Device detection test completed!');
    console.log('\n📋 Summary:');
    console.log('- Login API: ' + (loginResponse.ok ? '✅ Working' : '❌ Failed'));
    console.log('- Device Sessions API: ' + (sessionsResponse.ok ? '✅ Working' : '❌ Failed'));
    console.log('- Email Service: ' + (emailResponse.ok ? '✅ Working' : '❌ Failed'));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDeviceDetection(); 