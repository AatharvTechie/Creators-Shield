// Test immediate notification system
// Run this with: node test-immediate-notification.js

const fetch = require('node-fetch');

async function testImmediateNotification() {
  console.log('⚡ Testing Immediate Notification System...\n');

  const testEmail = 'pradeeprajput@gmail.com';
  const testPassword = 'testpassword123';

  try {
    // Test 1: Login with a completely new device
    console.log('1. Testing login with new device (should trigger immediate notification)...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
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
        
        console.log('\n🔍 Expected Immediate Behavior:');
        console.log('1. Dialog should appear IMMEDIATELY (no refresh needed)');
        console.log('2. Voice alert should play IMMEDIATELY');
        console.log('3. Device should appear in active devices list');
        console.log('4. Console should show detailed logs');
        
        console.log('\n🎯 Manual Verification Steps:');
        console.log('1. Check if dialog appears immediately after login');
        console.log('2. Check if voice alert plays automatically');
        console.log('3. Check browser console for "🔍 VoiceAlertProvider" logs');
        console.log('4. Go to Settings → Active Devices (should show new device)');
        console.log('5. No manual refresh should be needed');
        
      } else {
        console.log('ℹ️ Not a new device or missing deviceInfo');
        console.log('isNewDevice:', loginData.isNewDevice);
        console.log('deviceInfo present:', !!loginData.deviceInfo);
      }
    } else {
      console.log('❌ Login failed:', loginData.error || loginData.message);
    }

    // Test 2: Check JWT token structure
    console.log('\n2. Checking JWT token structure...');
    if (loginData.token) {
      try {
        const tokenParts = loginData.token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          console.log('✅ JWT token structure valid');
          console.log('📋 JWT payload keys:', Object.keys(payload));
          
          if (payload.sessionId) {
            console.log('✅ sessionId included in JWT');
          } else {
            console.log('❌ sessionId missing from JWT');
          }
        } else {
          console.log('❌ Invalid JWT token structure');
        }
      } catch (error) {
        console.log('❌ Error parsing JWT:', error.message);
      }
    }

    // Test 3: Check response data structure
    console.log('\n3. Checking response data structure...');
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
    console.log('- Check browser console for "🔍 VoiceAlertProvider" logs');
    console.log('- Look for "🔊 Voice alert triggered" messages');
    console.log('- Verify dialog appears immediately (no refresh needed)');
    console.log('- Check if voice alert plays automatically');
    console.log('- Verify device appears in Settings → Active Devices');

    console.log('\n🎯 Key Points to Verify:');
    console.log('1. IMMEDIATE dialog appearance (no refresh)');
    console.log('2. IMMEDIATE voice alert (no delay)');
    console.log('3. Device listed in active devices immediately');
    console.log('4. Console logs show proper flow');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testImmediateNotification(); 