import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Creator from '@/models/Creator';
import Reactivation from '@/models/Reactivation';
import { checkApprovalStatus, updateReactivationStatus } from '@/lib/users-store';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    // Find the deactivated user (Algo Breaker)
    // @ts-ignore
    const deactivatedUser = await Creator.findOne({ 
      email: 'algobreaker@gmail.com',
      status: 'deactivated'
    });
    
    if (!deactivatedUser) {
      return NextResponse.json({ 
        error: 'User not found',
        message: 'No deactivated user found with email algobreaker@gmail.com'
      }, { status: 404 });
    }
    
    console.log('🧪 Test: Found deactivated user:', {
      id: deactivatedUser._id.toString(),
      name: deactivatedUser.name,
      email: deactivatedUser.email,
      status: deactivatedUser.status,
      approvalTimestamp: deactivatedUser.approvalTimestamp,
      reactivationRequest: deactivatedUser.reactivationRequest
    });
    
    // Check current approval status
    const currentApprovalStatus = await checkApprovalStatus(deactivatedUser._id.toString());
    console.log('🧪 Test: Current approval status:', currentApprovalStatus);
    
    // Simulate admin approval
    console.log('🧪 Test: Simulating admin approval...');
    const approvalResult = await updateReactivationStatus(deactivatedUser._id.toString(), 'approved');
    console.log('🧪 Test: Approval result:', approvalResult);
    
    // Check approval status after approval
    const newApprovalStatus = await checkApprovalStatus(deactivatedUser._id.toString());
    console.log('🧪 Test: New approval status:', newApprovalStatus);
    
    // Get updated user
    // @ts-ignore
    const updatedUser = await Creator.findById(deactivatedUser._id);
    console.log('🧪 Test: Updated user:', {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      status: updatedUser.status,
      approvalTimestamp: updatedUser.approvalTimestamp,
      reactivationRequest: updatedUser.reactivationRequest
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test approval flow completed successfully.',
      beforeApproval: currentApprovalStatus,
      afterApproval: newApprovalStatus,
      updatedUser: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        status: updatedUser.status,
        approvalTimestamp: updatedUser.approvalTimestamp,
        reactivationRequest: updatedUser.reactivationRequest
      }
    });
  } catch (error) {
    console.error('Test approval flow error:', error);
    return NextResponse.json({ 
      error: 'Failed to test approval flow',
      message: 'An error occurred while testing the approval flow.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 