// Debug test for mobile login issues
// Run this with: node test-mobile-login-debug.js

const fetch = require('node-fetch');

async function testMobileLoginDebug() {
  console.log('📱 Testing Mobile Login Debug...\n');

  const testEmail = 'pradeeprajput@gmail.com';
  const testPassword = 'testpassword123';

  // Test different mobile user agents
  const mobileUserAgents = [
    // Android Chrome
    'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    // iPhone Safari
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    // Android Samsung Browser
    'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36',
    // iPad Safari
    'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  ];

  for (let i = 0; i < mobileUserAgents.length; i++) {
    const userAgent = mobileUserAgents[i];
    console.log(`\n${i + 1}. Testing mobile login with user agent: ${userAgent.substring(0, 50)}...`);
    
    try {
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          userAgent: userAgent
        })
      });

      console.log('Login Response Status:', loginResponse.status);
      const loginData = await loginResponse.json();
      
      if (loginResponse.ok) {
        console.log('✅ Login successful');
        console.log('📱 isNewDevice:', loginData.isNewDevice);
        console.log('📱 deviceInfo:', loginData.deviceInfo);
        
        if (loginData.isNewDevice) {
          console.log('🎉 NEW DEVICE DETECTED! Should trigger dialog and voice alert');
        } else {
          console.log('ℹ️ Existing device - no alert needed');
        }
      } else {
        console.log('❌ Login failed:', loginData.error || loginData.message);
      }
      
      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  }

  console.log('\n📋 Summary:');
  console.log('- Check if mobile devices are being detected as new devices');
  console.log('- Check if deviceInfo is being included in response');
  console.log('- Check if dialog and voice alerts are triggered');
  
  console.log('\n🔍 Expected Behavior:');
  console.log('- First mobile login: Should be detected as new device');
  console.log('- Subsequent mobile logins: Should be detected as existing device');
  console.log('- Device info should include mobile-specific details');
  console.log('- Voice alert and dialog should trigger for new devices');

  console.log('\n🎯 Debug Steps:');
  console.log('1. Check browser console for voice alert logs');
  console.log('2. Check if localStorage has newDeviceInfo');
  console.log('3. Check if URL has newDevice=true parameter');
  console.log('4. Check if dialog appears on dashboard');
}

// Run the test
testMobileLoginDebug(); 