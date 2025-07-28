import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Creator from '@/models/Creator';
import { checkSuspensionStatus, updateUserStatus } from '@/lib/users-store';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    // Find a user to test with (you can change this to any user email)
    // @ts-ignore
    const testUser = await Creator.findOne({ 
      email: 'algobreaker@gmail.com'
    });
    
    if (!testUser) {
      return NextResponse.json({ 
        error: 'User not found',
        message: 'No user found with email algobreaker@gmail.com'
      }, { status: 404 });
    }
    
    console.log('🧪 Test: Found user:', {
      id: testUser._id.toString(),
      name: testUser.name,
      email: testUser.email,
      status: testUser.status,
      suspensionTimestamp: testUser.suspensionTimestamp
    });
    
    // Check current suspension status
    const currentSuspensionStatus = await checkSuspensionStatus(testUser._id.toString());
    console.log('🧪 Test: Current suspension status:', currentSuspensionStatus);
    
    // Simulate admin suspension
    console.log('🧪 Test: Simulating admin suspension...');
    const suspensionResult = await updateUserStatus(testUser._id.toString(), 'suspended');
    console.log('🧪 Test: Suspension result:', suspensionResult);
    
    // Check suspension status after suspension
    const newSuspensionStatus = await checkSuspensionStatus(testUser._id.toString());
    console.log('🧪 Test: New suspension status:', newSuspensionStatus);
    
    // Get updated user
    // @ts-ignore
    const updatedUser = await Creator.findById(testUser._id);
    console.log('🧪 Test: Updated user:', {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      status: updatedUser.status,
      suspensionTimestamp: updatedUser.suspensionTimestamp
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test suspension flow completed successfully.',
      beforeSuspension: currentSuspensionStatus,
      afterSuspension: newSuspensionStatus,
      updatedUser: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        status: updatedUser.status,
        suspensionTimestamp: updatedUser.suspensionTimestamp
      }
    });
  } catch (error) {
    console.error('Test suspension flow error:', error);
    return NextResponse.json({ 
      error: 'Failed to test suspension flow',
      message: 'An error occurred while testing the suspension flow.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 