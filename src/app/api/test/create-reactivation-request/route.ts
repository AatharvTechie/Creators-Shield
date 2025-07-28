import { NextResponse } from 'next/server';
import { submitReactivationRequest } from '@/lib/users-store';

export async function POST(req: Request) {
  try {
    const { userId, reason, explanation } = await req.json();
    
    if (!userId || !reason || !explanation) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        message: 'Please provide userId, reason, and explanation for reactivation request.'
      }, { status: 400 });
    }

    console.log('🧪 Test: Creating reactivation request for user:', userId);
    console.log('🧪 Test: Reason:', reason);
    console.log('🧪 Test: Explanation:', explanation);

    const result = await submitReactivationRequest(userId, reason, explanation);
    
    console.log('🧪 Test: Result:', result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test reactivation request created successfully.',
      result
    });
  } catch (error) {
    console.error('Test reactivation request error:', error);
    return NextResponse.json({ 
      error: 'Failed to create test reactivation request',
      message: 'An error occurred while creating the test reactivation request.'
    }, { status: 500 });
  }
} 