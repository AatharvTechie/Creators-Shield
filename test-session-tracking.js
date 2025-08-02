// Test script for session tracking system
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';

async function testSessionTracking() {
  console.log('🧪 Testing Session Tracking System...\n');

  try {
    // 1. Test login and session creation
    console.log('1. Testing login and session creation...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('   Token received:', loginData.token ? 'Yes' : 'No');

    // 2. Test fetching devices
    console.log('\n2. Testing device list fetch...');
    const devicesResponse = await fetch(`${BASE_URL}/api/settings/devices?email=${encodeURIComponent(TEST_EMAIL)}`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!devicesResponse.ok) {
      console.log('❌ Devices fetch failed:', await devicesResponse.text());
      return;
    }

    const devicesData = await devicesResponse.json();
    console.log('✅ Devices fetched successfully');
    console.log('   Devices found:', devicesData.devices?.length || 0);
    console.log('   Current session ID:', devicesData.currentSessionId);

    if (devicesData.devices && devicesData.devices.length > 0) {
      const currentDevice = devicesData.devices.find(d => d.isCurrentSession);
      if (currentDevice) {
        console.log('   Current device:', {
          device: currentDevice.device,
          browser: currentDevice.browser,
          os: currentDevice.os,
          ipAddress: currentDevice.ipAddress
        });
      }
    }

    // 3. Test session activity update
    console.log('\n3. Testing session activity update...');
    const activityResponse = await fetch(`${BASE_URL}/api/session/activity`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!activityResponse.ok) {
      console.log('❌ Session activity update failed:', await activityResponse.text());
    } else {
      console.log('✅ Session activity updated successfully');
    }

    // 4. Test logout and session removal
    console.log('\n4. Testing logout and session removal...');
    const logoutResponse = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!logoutResponse.ok) {
      console.log('❌ Logout failed:', await logoutResponse.text());
    } else {
      console.log('✅ Logout successful');
    }

    // 5. Test session cleanup
    console.log('\n5. Testing session cleanup...');
    const cleanupResponse = await fetch(`${BASE_URL}/api/cron/cleanup-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!cleanupResponse.ok) {
      console.log('❌ Session cleanup failed:', await cleanupResponse.text());
    } else {
      const cleanupData = await cleanupResponse.json();
      console.log('✅ Session cleanup successful');
      console.log('   Sessions cleaned:', cleanupData.cleanedCount || 0);
    }

    console.log('\n🎉 All session tracking tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testSessionTracking(); 