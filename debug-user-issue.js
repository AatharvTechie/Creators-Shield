// Debug script to help identify the "User not found" issue
// Run this script to check the database and JWT token

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/creatorshield');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

// Check all users in database
async function checkAllUsers() {
  const Creator = mongoose.model('Creator', new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    plan: String,
    planExpiry: Date,
    createdAt: Date
  }));

  console.log('\n🔍 Checking all users in database...');
  const users = await Creator.find({}).select('name email plan createdAt').lean();
  
  console.log(`📊 Total users found: ${users.length}`);
  
  if (users.length > 0) {
    console.log('\n📋 User list:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Plan: ${user.plan || 'free'} - Created: ${user.createdAt}`);
    });
  } else {
    console.log('❌ No users found in database');
  }
  
  return users;
}

// Test JWT token decoding
function testJWTDecoding() {
  console.log('\n🔍 Testing JWT token decoding...');
  
  // Check if there's a token in localStorage (this would be done in browser)
  console.log('💡 To test JWT decoding in browser:');
  console.log('1. Open browser console');
  console.log('2. Run: localStorage.getItem("creator_jwt")');
  console.log('3. If token exists, run: JSON.parse(atob(token.split(".")[1]))');
  console.log('4. Check if the decoded token has an "email" field');
}

// Test API endpoint
async function testGetUserAPI(email) {
  console.log(`\n🔍 Testing get-user API with email: ${email}`);
  
  try {
    const response = await fetch(`http://localhost:3000/api/get-user?email=${encodeURIComponent(email)}`);
    const data = await response.json();
    
    console.log(`📡 API Response Status: ${response.status}`);
    console.log(`📡 API Response Data:`, data);
    
    if (response.ok) {
      console.log('✅ API call successful');
    } else {
      console.log('❌ API call failed');
    }
  } catch (error) {
    console.error('❌ API call error:', error);
  }
}

// Main function
async function main() {
  console.log('🚀 Starting debug script...\n');
  
  await connectDB();
  const users = await checkAllUsers();
  testJWTDecoding();
  
  if (users.length > 0) {
    console.log('\n🔍 Testing get-user API with first user...');
    await testGetUserAPI(users[0].email);
  }
  
  console.log('\n📝 Debug Summary:');
  console.log('1. Check if users exist in database');
  console.log('2. Verify JWT token contains email field');
  console.log('3. Test get-user API endpoint');
  console.log('4. Check browser console for JWT decode errors');
  
  await mongoose.disconnect();
  console.log('\n✅ Debug script completed');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkAllUsers, testJWTDecoding, testGetUserAPI }; 