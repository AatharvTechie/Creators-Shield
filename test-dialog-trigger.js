// Test dialog trigger mechanism
// Run this with: node test-dialog-trigger.js

const fetch = require('node-fetch');

async function testDialogTrigger() {
  console.log('🎭 Testing Dialog Trigger Mechanism...\n');

  const testEmail = 'pradeeprajput@gmail.com';
  const testPassword = 'testpassword123';

  try {
    // Test 1: Login with a new device (should trigger dialog)
    console.log('1. Testing login with new device (should trigger dialog)...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      })
    });

    console.log('Login Response Status:', loginResponse.status);
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login successful');
      console.log('📱 isNewDevice:', loginData.isNewDevice);
      console.log('📱 deviceInfo:', loginData.deviceInfo);
      
      if (loginData.isNewDevice && loginData.deviceInfo) {
        console.log('🎉 NEW DEVICE DETECTED!');
        console.log('📍 Device:', loginData.deviceInfo.device);
        console.log('🌐 Browser:', loginData.deviceInfo.browser);
        console.log('💻 OS:', loginData.deviceInfo.os);
        console.log('📍 Location:', loginData.deviceInfo.location);
        
        console.log('\n🔍 Expected Behavior:');
        console.log('1. localStorage should have newDeviceInfo');
        console.log('2. URL should have newDevice=true parameter');
        console.log('3. Dialog should appear on dashboard');
        console.log('4. Voice alert should play');
        
        console.log('\n🎯 Manual Verification Steps:');
        console.log('1. Open browser console');
        console.log('2. Check for "🔍 VoiceAlertProvider" logs');
        console.log('3. Check if dialog appears');
        console.log('4. Check if voice alert plays');
        
      } else {
        console.log('ℹ️ Not a new device or missing deviceInfo');
        console.log('isNewDevice:', loginData.isNewDevice);
        console.log('deviceInfo present:', !!loginData.deviceInfo);
      }
    } else {
      console.log('❌ Login failed:', loginData.error || loginData.message);
    }

    // Test 2: Check if the response includes the correct data structure
    console.log('\n2. Checking response data structure...');
    if (loginData.isNewDevice) {
      const expectedKeys = ['device', 'browser', 'os', 'location', 'ipAddress'];
      const missingKeys = expectedKeys.filter(key => !loginData.deviceInfo[key]);
      
      if (missingKeys.length === 0) {
        console.log('✅ All required device info keys present');
      } else {
        console.log('❌ Missing device info keys:', missingKeys);
      }
    }

    console.log('\n📋 Debug Information:');
    console.log('- Check browser console for detailed logs');
    console.log('- Look for "🔍 VoiceAlertProvider" messages');
    console.log('- Verify localStorage has newDeviceInfo');
    console.log('- Check URL parameters');
    console.log('- Test voice alert button (bottom right)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDialogTrigger(); 