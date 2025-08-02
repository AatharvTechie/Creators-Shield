import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Creator from '@/models/Creator';

export async function GET() {
  try {
    console.log('🔌 Testing database connection...');
    
    // Test database connection
    await connectToDatabase();
    console.log('✅ Database connected successfully');
    
    // Test a simple query
    const userCount = await Creator.countDocuments();
    console.log('📊 Total users in database:', userCount);
    
    // Test creating a simple document
    const testUser = await Creator.findOne({ email: 'test@example.com' });
    console.log('🔍 Test query result:', testUser ? 'User found' : 'No test user found');
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount,
      testQuery: testUser ? 'User found' : 'No test user found'
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 