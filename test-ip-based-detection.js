// Test IP-based device detection
// Run this with: node test-ip-based-detection.js

const fetch = require('node-fetch');

async function testIPBasedDetection() {
  console.log('🔍 Testing IP-based Device Detection...\n');

  const testEmail = 'pradeeprajput@gmail.com';
  const testPassword = 'testpassword123';

  // Test different IP addresses with same device type
  const testCases = [
    {
      name: 'Android Device 1 (IP: 192.168.1.100)',
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      ipAddress: '192.168.1.100'
    },
    {
      name: 'Android Device 2 (IP: 192.168.1.101)',
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      ipAddress: '192.168.1.101'
    },
    {
      name: 'Android Device 3 (IP: 10.0.0.50)',
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      ipAddress: '10.0.0.50'
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n${i + 1}. Testing: ${testCase.name}`);
    
    try {
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': testCase.ipAddress,
          'X-Real-IP': testCase.ipAddress
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          userAgent: testCase.userAgent
        })
      });

      console.log('Login Response Status:', loginResponse.status);
      const loginData = await loginResponse.json();
      
      if (loginResponse.ok) {
        console.log('✅ Login successful');
        console.log('📱 isNewDevice:', loginData.isNewDevice);
        console.log('📱 deviceInfo:', loginData.deviceInfo);
        
        if (loginData.isNewDevice) {
          console.log('🎉 NEW DEVICE DETECTED (Correct!)');
        } else {
          console.log('ℹ️ Existing device (Should be detected as existing)');
        }
        
        // Wait 2 seconds before next test
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } else {
        console.log('❌ Login failed:', loginData.error || loginData.message);
      }
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  }

  // Test 2: Check all devices in the list
  console.log('\n📋 Checking all devices in the list...');
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
          console.log(`      IP: ${device.ipAddress}`);
          console.log(`      Location: ${device.location}`);
          console.log(`      Current: ${device.isCurrentSession ? 'Yes' : 'No'}`);
        });
        
        // Check if we have multiple Android devices with different IPs
        const androidDevices = devicesData.devices.filter(device => 
          device.os.toLowerCase().includes('android')
        );
        
        const uniqueIPs = [...new Set(androidDevices.map(device => device.ipAddress))];
        
        console.log(`\n📊 Analysis:`);
        console.log(`   Total Android devices: ${androidDevices.length}`);
        console.log(`   Unique IP addresses: ${uniqueIPs.length}`);
        console.log(`   IP addresses: ${uniqueIPs.join(', ')}`);
        
        if (androidDevices.length > 1 && uniqueIPs.length > 1) {
          console.log('✅ SUCCESS: Multiple Android devices with different IPs detected correctly!');
        } else if (androidDevices.length === 1) {
          console.log('ℹ️ Only one Android device found (expected for first test)');
        } else {
          console.log('❌ ISSUE: Multiple Android devices not detected or same IP used');
        }
        
      } else {
        console.log('❌ No devices found');
      }
    } else {
      console.log('❌ Failed to fetch devices:', devicesResponse.status);
    }
  } catch (error) {
    console.log('❌ Error fetching devices:', error.message);
  }

  console.log('\n📋 Expected Results:');
  console.log('□ First login: isNewDevice = true (new device)');
  console.log('□ Second login: isNewDevice = true (different IP)');
  console.log('□ Third login: isNewDevice = true (different IP)');
  console.log('□ Device list shows 3 separate Android devices');
  console.log('□ Each device has a different IP address');
  console.log('□ Dialog and voice alert trigger for each new device');

}

// Run the test
testIPBasedDetection(); 