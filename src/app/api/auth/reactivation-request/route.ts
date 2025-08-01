import { NextResponse } from 'next/server';
import { submitReactivationRequest } from '@/lib/users-store';

export async function POST(req: Request) {
  try {
    console.log('🔍 Reactivation request API called');
    
    const body = await req.json();
    console.log('🔍 Request body:', body);
    
    const { userId, reason, explanation } = body;
    
    console.log('🔍 Extracted data:', { userId, reason, explanation });
    
    if (!userId || !reason || !explanation) {
      console.log('❌ Missing required fields:', { userId: !!userId, reason: !!reason, explanation: !!explanation });
      return NextResponse.json({ 
        error: 'Missing required fields',
        message: 'Please provide userId, reason, and explanation for reactivation request.'
      }, { status: 400 });
    }

    // Validate userId format
    console.log('🔍 Validating userId:', userId);
    console.log('🔍 UserId type:', typeof userId);
    console.log('🔍 UserId length:', userId?.length);

    console.log('✅ All required fields present, calling submitReactivationRequest');
    const result = await submitReactivationRequest(userId, reason, explanation, req);
    
    console.log('📊 submitReactivationRequest result:', result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Reactivation request submitted successfully. Admin will review your request.',
      result
    });
  } catch (error) {
    console.error('❌ Reactivation request error:', error);
    
    // Handle specific error types
    let statusCode = 500;
    let errorMessage = 'An error occurred while submitting your reactivation request. Please try again.';
    
    if (error instanceof Error) {
      if (error.message.includes('User not found')) {
        statusCode = 404;
        errorMessage = 'User not found. Please check your account details.';
      } else if (error.message.includes('not deactivated')) {
        statusCode = 400;
        errorMessage = 'Your account is not deactivated. Reactivation request not needed.';
      } else if (error.message.includes('already have a pending')) {
        statusCode = 409;
        errorMessage = 'You already have a pending reactivation request. Please wait for admin review.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to submit reactivation request',
      message: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: statusCode });
  }
} 