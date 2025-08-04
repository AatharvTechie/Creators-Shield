// Debug test for voice alert system
// Run this with: node test-voice-alert-debug.js

const fetch = require('node-fetch');

async function testVoiceAlertDebug() {
  console.log('🔊 Testing Voice Alert Debug...\n');

  const testEmail = 'pradeeprajput@gmail.com';
  const testPassword = 'testpassword123';

  try {
    // Test 1: Login with iPhone (should be new device)
    console.log('1. Testing login with iPhone (should trigger voice alert)...');
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
    console.log('Login Response:', JSON.stringify(loginData, null, 2));

    if (!loginResponse.ok) {
      console.log('❌ Login failed, skipping other tests');
      return;
    }

    // Check if new device was detected
    if (loginData.isNewDevice) {
      console.log('✅ New device detected!');
      console.log('📱 Device Info:', loginData.deviceInfo);
      
      if (loginData.deviceInfo) {
        console.log('📍 Location:', loginData.deviceInfo.location);
        console.log('🌐 Browser:', loginData.deviceInfo.browser);
        console.log('💻 OS:', loginData.deviceInfo.os);
        console.log('🔗 IP:', loginData.deviceInfo.ipAddress);
      }
    } else {
      console.log('ℹ️ Existing device - no voice alert needed');
    }

    // Test 2: Login with Windows PC (should be new device)
    console.log('\n2. Testing login with Windows PC (should trigger voice alert)...');
    const loginResponse2 = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      })
    });

    console.log('Second Login Response Status:', loginResponse2.status);
    const loginData2 = await loginResponse2.json();
    console.log('Second Login Response:', JSON.stringify(loginData2, null, 2));

    // Check if new device was detected
    if (loginData2.isNewDevice) {
      console.log('✅ New device detected!');
      console.log('📱 Device Info:', loginData2.deviceInfo);
    } else {
      console.log('ℹ️ Existing device - no voice alert needed');
    }

    // Test 3: Login with same iPhone again (should NOT trigger voice alert)
    console.log('\n3. Testing login with same iPhone again (should NOT trigger voice alert)...');
    const loginResponse3 = await fetch('http://localhost:3000/api/auth/login', {
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

    console.log('Third Login Response Status:', loginResponse3.status);
    const loginData3 = await loginResponse3.json();
    console.log('Third Login Response:', JSON.stringify(loginData3, null, 2));

    // Check if new device was detected
    if (loginData3.isNewDevice) {
      console.log('⚠️ Unexpected: New device detected for same device!');
    } else {
      console.log('✅ Correct: Existing device - no voice alert needed');
    }

    console.log('\n✅ Voice alert debug test completed!');
    console.log('\n📋 Summary:');
    console.log('- iPhone login (new device): ' + (loginData.isNewDevice ? '✅ Detected' : '❌ Not detected'));
    console.log('- Windows PC login (new device): ' + (loginData2.isNewDevice ? '✅ Detected' : '❌ Not detected'));
    console.log('- iPhone login again (same device): ' + (loginData3.isNewDevice ? '❌ Wrongly detected' : '✅ Correctly not detected'));

    console.log('\n🎯 Expected Results:');
    console.log('- First iPhone login: Should trigger voice alert');
    console.log('- Windows PC login: Should trigger voice alert');
    console.log('- Second iPhone login: Should NOT trigger voice alert');

    console.log('\n🔍 Debug Info:');
    console.log('- Check browser console for voice alert logs');
    console.log('- Check if localStorage has newDeviceInfo');
    console.log('- Check if URL has newDevice=true parameter');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testVoiceAlertDebug(); 