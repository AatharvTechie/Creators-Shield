// Debug new device flow - comprehensive test
// Run this with: node debug-new-device-flow.js

const fetch = require('node-fetch');

async function debugNewDeviceFlow() {
  console.log('🔍 Debugging New Device Flow...\n');

  const testEmail = 'pradeeprajput@gmail.com';
  const testPassword = 'testpassword123';

  try {
    // Test 1: Login with a completely new device
    console.log('1. Testing login with new device...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1'
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
        
        console.log('\n🔍 Expected Flow:');
        console.log('1. Login page stores deviceInfo in localStorage');
        console.log('2. Login page redirects to dashboard with ?newDevice=true');
        console.log('3. VoiceAlertProvider detects URL parameter');
        console.log('4. VoiceAlertProvider gets deviceInfo from localStorage');
        console.log('5. Dialog appears and voice alert plays');
        
        console.log('\n🎯 Manual Verification Steps:');
        console.log('1. Check browser console for these logs:');
        console.log('   - "🔊 Login: New device detected, storing device info:"');
        console.log('   - "🔊 Login: Redirecting to: /dashboard/overview?newDevice=true"');
        console.log('   - "🔍 VoiceAlertProvider: useEffect triggered"');
        console.log('   - "🔍 VoiceAlertProvider: URL newDevice param: true"');
        console.log('   - "🔍 VoiceAlertProvider: localStorage deviceData:"');
        console.log('   - "🔍 Voice Alert: New device detected, showing dialog:"');
        console.log('   - "🔊 Voice alert triggered for new device"');
        
        console.log('\n2. Check localStorage:');
        console.log('   - Open browser dev tools → Application → Local Storage');
        console.log('   - Look for "newDeviceInfo" key');
        
        console.log('\n3. Check URL:');
        console.log('   - Should be: /dashboard/overview?newDevice=true');
        
        console.log('\n4. Check for dialog:');
        console.log('   - Dialog should appear immediately');
        console.log('   - Voice alert should play automatically');
        
      } else {
        console.log('ℹ️ Not a new device or missing deviceInfo');
        console.log('isNewDevice:', loginData.isNewDevice);
        console.log('deviceInfo present:', !!loginData.deviceInfo);
      }
    } else {
      console.log('❌ Login failed:', loginData.error || loginData.message);
    }

    // Test 2: Check if device appears in active devices
    console.log('\n2. Checking active devices...');
    if (loginData.token) {
      try {
        const devicesResponse = await fetch(`http://localhost:3000/api/settings/devices?email=${encodeURIComponent(testEmail)}`, {
          headers: {
            'Authorization': `Bearer ${loginData.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (devicesResponse.ok) {
          const devicesData = await devicesResponse.json();
          console.log('✅ Devices API response:', devicesData);
          
          if (devicesData.devices && devicesData.devices.length > 0) {
            console.log(`📱 Found ${devicesData.devices.length} devices:`);
            devicesData.devices.forEach((device, index) => {
              console.log(`   ${index + 1}. ${device.device} (${device.browser} on ${device.os})`);
              console.log(`      Current: ${device.isCurrentSession ? 'Yes' : 'No'}`);
              console.log(`      Location: ${device.location}`);
            });
          } else {
            console.log('❌ No devices found');
          }
        } else {
          console.log('❌ Failed to fetch devices:', devicesResponse.status);
        }
      } catch (error) {
        console.log('❌ Error fetching devices:', error.message);
      }
    }

    console.log('\n📋 Debug Checklist:');
    console.log('□ Login response includes isNewDevice: true');
    console.log('□ Login response includes deviceInfo object');
    console.log('□ localStorage has newDeviceInfo key');
    console.log('□ URL includes ?newDevice=true parameter');
    console.log('□ Console shows VoiceAlertProvider logs');
    console.log('□ Dialog appears on dashboard');
    console.log('□ Voice alert plays automatically');
    console.log('□ Device appears in Settings → Active Devices');

    console.log('\n🔧 If issues persist:');
    console.log('1. Check browser console for errors');
    console.log('2. Verify VoiceAlertProvider is imported in dashboard layout');
    console.log('3. Check if localStorage is being set correctly');
    console.log('4. Verify URL parameters are being passed');
    console.log('5. Test manual voice alert button (bottom right)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the debug
debugNewDeviceFlow(); 