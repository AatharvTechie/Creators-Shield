// Simple test for cleanup API
// Run with: node test-cleanup-api.js

const fetch = require('node-fetch');

async function testCleanupAPI() {
  console.log('🧪 Testing Cleanup API...\n');

  const testEmail = 'test@example.com';

  try {
    // Test cleanup API
    console.log('Testing session cleanup...');
    const cleanupResponse = await fetch('http://localhost:3000/api/auth/cleanup-sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userEmail: testEmail })
    });

    console.log('Cleanup Response Status:', cleanupResponse.status);
    const cleanupData = await cleanupResponse.json();
    console.log('Cleanup Response:', JSON.stringify(cleanupData, null, 2));

    if (cleanupResponse.ok) {
      console.log('✅ Cleanup API working correctly!');
    } else {
      console.log('❌ Cleanup API failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCleanupAPI(); 