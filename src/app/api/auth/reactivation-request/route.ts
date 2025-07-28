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

    console.log('✅ All required fields present, calling submitReactivationRequest');
    const result = await submitReactivationRequest(userId, reason, explanation);
    
    console.log('📊 submitReactivationRequest result:', result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Reactivation request submitted successfully. Admin will review your request.',
      result
    });
  } catch (error) {
    console.error('❌ Reactivation request error:', error);
    return NextResponse.json({ 
      error: 'Failed to submit reactivation request',
      message: 'An error occurred while submitting your reactivation request. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 