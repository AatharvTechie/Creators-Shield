/**
 * Test script for admin email functionality
 * This script tests all admin action emails to ensure they work correctly
 */

const { sendDisconnectApprovalEmail, sendMarkAsReadNotificationEmail, sendFeedbackReplyEmail } = require('./src/lib/services/backend-services');

// Test data
const testData = {
  disconnectApproval: {
    to: 'test@example.com',
    creatorName: 'Test Creator',
    approvalTime: new Date().toLocaleString()
  },
  markAsRead: {
    to: 'test@example.com',
    creatorName: 'Test Creator',
    feedbackTitle: 'Test Feedback',
    readTime: new Date().toLocaleString()
  },
  feedbackReply: {
    to: 'test@example.com',
    creatorName: 'Test Creator',
    feedbackTitle: 'Test Feedback',
    adminReply: 'Thank you for your feedback. We appreciate your input and will consider it in our platform improvements.',
    replyTime: new Date().toLocaleString()
  }
};

async function testAdminEmails() {
  console.log('🧪 Testing Admin Email Functionality...\n');

  try {
    // Test Disconnect Approval Email
    console.log('1. Testing Disconnect Approval Email...');
    const disconnectResult = await sendDisconnectApprovalEmail(testData.disconnectApproval);
    console.log('✅ Disconnect Approval Email:', disconnectResult.success ? 'SUCCESS' : 'FAILED');
    if (!disconnectResult.success) {
      console.log('❌ Error:', disconnectResult.message);
    }

    // Test Mark as Read Email
    console.log('\n2. Testing Mark as Read Email...');
    const markAsReadResult = await sendMarkAsReadNotificationEmail(testData.markAsRead);
    console.log('✅ Mark as Read Email:', markAsReadResult.success ? 'SUCCESS' : 'FAILED');
    if (!markAsReadResult.success) {
      console.log('❌ Error:', markAsReadResult.message);
    }

    // Test Feedback Reply Email
    console.log('\n3. Testing Feedback Reply Email...');
    const feedbackReplyResult = await sendFeedbackReplyEmail(testData.feedbackReply);
    console.log('✅ Feedback Reply Email:', feedbackReplyResult.success ? 'SUCCESS' : 'FAILED');
    if (!feedbackReplyResult.success) {
      console.log('❌ Error:', feedbackReplyResult.message);
    }

    console.log('\n🎉 All email tests completed!');
    console.log('\n📧 Note: If RESEND_API_KEY is not configured, emails will be simulated.');
    console.log('   To send real emails, configure your email service credentials.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the tests
testAdminEmails(); 