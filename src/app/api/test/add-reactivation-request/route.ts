import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Creator from '@/models/Creator';
import Reactivation from '@/models/Reactivation';

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
    });
    
    // Check if user already has a pending reactivation request
    // @ts-ignore
    const existingRequest = await Reactivation.findOne({
      creatorId: deactivatedUser._id,
      status: 'pending'
    });
    
    if (existingRequest) {
      console.log('🧪 Test: User already has a pending request');
      return NextResponse.json({ 
        error: 'Request already exists',
        message: 'User already has a pending reactivation request'
      }, { status: 400 });
    }
    
    // Create new reactivation request
    const reactivationRequest = new Reactivation({
      creatorId: deactivatedUser._id,
      displayName: deactivatedUser.name,
      email: deactivatedUser.email,
      avatar: deactivatedUser.avatar,
      requestDate: new Date(),
      status: 'pending',
      reason: 'Test reactivation reason - I want to continue using CreatorShield',
      explanation: 'This is a test reactivation request. I believe my account should be reactivated because I am a legitimate creator who wants to continue using the platform.'
    });
    
    console.log('🧪 Test: Creating reactivation request:', {
      creatorId: reactivationRequest.creatorId,
      displayName: reactivationRequest.displayName,
      email: reactivationRequest.email,
      reason: reactivationRequest.reason,
      explanation: reactivationRequest.explanation
    });
    
    // @ts-ignore
    const result = await reactivationRequest.save();
    
    console.log('🧪 Test: Save result:', result);
    
    // Also update the Creator model
    // @ts-ignore
    await Creator.updateOne(
      { _id: deactivatedUser._id },
      { 
        $set: { 
          reactivationRequest: {
            requestedAt: new Date(),
            reason: reactivationRequest.reason,
            explanation: reactivationRequest.explanation,
            status: 'pending'
          }
        }
      }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test reactivation request added successfully.',
      result: {
        id: result._id.toString(),
        creatorId: result.creatorId.toString(),
        displayName: result.displayName,
        email: result.email,
        reason: result.reason,
        explanation: result.explanation,
        status: result.status
      }
    });
  } catch (error) {
    console.error('Test add reactivation request error:', error);
    return NextResponse.json({ 
      error: 'Failed to add test reactivation request',
      message: 'An error occurred while adding the test reactivation request.'
    }, { status: 500 });
  }
} 