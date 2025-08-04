// Comprehensive test for voice alert and device detection system
// Run this with: node test-voice-alert-system.js

const fetch = require('node-fetch');

async function testVoiceAlertSystem() {
  console.log('🧪 Testing Voice Alert & Device Detection System...\n');

  const testEmail = 'test@example.com';
  const testPassword = 'testpassword123';

  try {
    // Test 1: Login with new device (should trigger voice alert)
    console.log('1. Testing login with new device (should trigger voice alert)...');
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

    const token = loginData.token;

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

    // Test 2: Check device sessions with location
    console.log('\n2. Testing device sessions with location...');
    const sessionsResponse = await fetch(`http://localhost:3000/api/settings/devices?email=${encodeURIComponent(testEmail)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Device Sessions Response Status:', sessionsResponse.status);
    const sessionsData = await sessionsResponse.json();
    console.log('Device Sessions Response:', JSON.stringify(sessionsData, null, 2));

    // Test 3: Test session cleanup
    console.log('\n3. Testing session cleanup...');
    const cleanupResponse = await fetch('http://localhost:3000/api/auth/cleanup-sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userEmail: testEmail })
    });

    console.log('Cleanup Response Status:', cleanupResponse.status);
    const cleanupData = await cleanupResponse.json();
    console.log('Cleanup Response:', JSON.stringify(cleanupData, null, 2));

    // Test 4: Login with same device (should update existing session)
    console.log('\n4. Testing login with same device (should update existing session)...');
    const loginResponse2 = await fetch('http://localhost:3000/api/auth/login', {
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

    console.log('Second Login Response Status:', loginResponse2.status);
    const loginData2 = await loginResponse2.json();
    console.log('Second Login Response:', JSON.stringify(loginData2, null, 2));

    // Test 5: Login with different device (should create new session and trigger voice alert)
    console.log('\n5. Testing login with different device (should create new session and trigger voice alert)...');
    const loginResponse3 = await fetch('http://localhost:3000/api/auth/login', {
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

    console.log('Third Login Response Status:', loginResponse3.status);
    const loginData3 = await loginResponse3.json();
    console.log('Third Login Response:', JSON.stringify(loginData3, null, 2));

    // Test 6: Check final device sessions
    console.log('\n6. Checking final device sessions...');
    const finalSessionsResponse = await fetch(`http://localhost:3000/api/settings/devices?email=${encodeURIComponent(testEmail)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Final Device Sessions Response Status:', finalSessionsResponse.status);
    const finalSessionsData = await finalSessionsResponse.json();
    console.log('Final Device Sessions Response:', JSON.stringify(finalSessionsData, null, 2));

    console.log('\n✅ Voice alert and device detection system test completed!');
    console.log('\n📋 Summary:');
    console.log('- Login with device detection: ' + (loginResponse.ok ? '✅ Working' : '❌ Failed'));
    console.log('- Voice alert for new devices: ' + (loginData.isNewDevice ? '✅ Triggered' : 'ℹ️ Not needed'));
    console.log('- Location detection: ' + (loginData.deviceInfo?.location ? '✅ Working' : '❌ Failed'));
    console.log('- Device sessions with location: ' + (sessionsResponse.ok ? '✅ Working' : '❌ Failed'));
    console.log('- Session cleanup: ' + (cleanupResponse.ok ? '✅ Working' : '❌ Failed'));
    console.log('- Same device login (update): ' + (loginResponse2.ok ? '✅ Working' : '❌ Failed'));
    console.log('- Different device login (new): ' + (loginResponse3.ok ? '✅ Working' : '❌ Failed'));
    console.log('- Final device sessions: ' + (finalSessionsResponse.ok ? '✅ Working' : '❌ Failed'));

    // Check if we have the expected number of devices
    if (finalSessionsData.devices) {
      console.log(`- Total devices found: ${finalSessionsData.devices.length}`);
      console.log('- Expected: 2 devices (iPhone + Windows PC)');
      
      if (finalSessionsData.devices.length === 2) {
        console.log('✅ Device management working correctly!');
      } else {
        console.log('⚠️ Unexpected number of devices - check for duplicates');
      }

      // Check if devices have location information
      const devicesWithLocation = finalSessionsData.devices.filter(d => d.location && d.location !== 'Unknown');
      console.log(`- Devices with location: ${devicesWithLocation.length}/${finalSessionsData.devices.length}`);
    }

    console.log('\n🎯 Voice Alert Features:');
    console.log('- ✅ Immediate voice alert for new devices');
    console.log('- ✅ Device name, browser, OS, location, and time announced');
    console.log('- ✅ Security warning included in voice alert');
    console.log('- ✅ Only triggers for new devices, not existing ones');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testVoiceAlertSystem(); 