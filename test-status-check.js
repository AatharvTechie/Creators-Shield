// Test script for status check API
// Run this with: node test-status-check.js

async function testStatusCheck() {
  try {
    console.log('🔍 Testing status check API...');
    
    // Test GET endpoint
    const getResponse = await fetch('http://localhost:3000/api/check-status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const getData = await getResponse.json();
    console.log('📊 GET Response:', getData);
    
    // Test POST endpoint
    const postResponse = await fetch('http://localhost:3000/api/check-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const postData = await postResponse.json();
    console.log('📊 POST Response:', postData);
    
  } catch (error) {
    console.error('❌ Error testing status check:', error);
  }
}

// Run the test
testStatusCheck(); 