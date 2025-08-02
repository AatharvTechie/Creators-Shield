import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Creator from '@/models/Creator';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    if (!signature) {
      console.error('No signature found in webhook');
      return NextResponse.json({ error: 'No signature found' }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log('Razorpay webhook event:', event);

    const subscriptionId = event.payload?.subscription?.entity?.id;
    if (!subscriptionId) {
      console.error('No subscription ID found in webhook');
      return NextResponse.json({ error: 'No subscription ID' }, { status: 400 });
    }

    // Find creator by subscription ID
    const creator = await Creator.findOne({ subscriptionId });
    if (!creator) {
      console.error('Creator not found for subscription:', subscriptionId);
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const eventType = event.event;
    console.log('Processing event type:', eventType);

    switch (eventType) {
      case 'subscription.activated':
      case 'subscription.authenticated':
        // Update plan to active status
        const planId = event.payload.subscription.entity.plan_id;
        let planType = 'monthly';
        
        // Map Razorpay plan ID to our plan type
        if (planId === 'plan_QvemyKdfzVGTLc') {
          planType = 'monthly';
        } else if (planId === 'plan_Qvenh9X4D8ggzw') {
          planType = 'yearly';
        }

        // Calculate plan expiry date
        let planExpiry = null;
        if (planType === 'monthly') {
          planExpiry = new Date();
          planExpiry.setMonth(planExpiry.getMonth() + 1);
        } else if (planType === 'yearly') {
          planExpiry = new Date();
          planExpiry.setFullYear(planExpiry.getFullYear() + 1);
        }

        await Creator.findByIdAndUpdate(creator._id, {
          plan: planType,
          planExpiry: planExpiry,
          subscriptionStatus: 'active',
          lastPaymentDate: new Date()
        });

        console.log(`Plan updated to ${planType} for creator:`, creator.email);
        break;

      case 'subscription.completed':
        // Plan is active and payment successful
        await Creator.findByIdAndUpdate(creator._id, {
          subscriptionStatus: 'active',
          lastPaymentDate: new Date()
        });
        console.log('Subscription completed for creator:', creator.email);
        break;

      case 'subscription.cancelled':
      case 'subscription.halted':
        // Plan cancelled or halted
        await Creator.findByIdAndUpdate(creator._id, {
          plan: 'free',
          subscriptionStatus: 'cancelled',
          planExpiry: new Date()
        });
        console.log('Subscription cancelled for creator:', creator.email);
        break;

      case 'subscription.charged':
        // Payment successful
        await Creator.findByIdAndUpdate(creator._id, {
          lastPaymentDate: new Date(),
          subscriptionStatus: 'active'
        });
        console.log('Payment successful for creator:', creator.email);
        break;

      case 'subscription.pending':
        // Payment pending
        await Creator.findByIdAndUpdate(creator._id, {
          subscriptionStatus: 'pending'
        });
        console.log('Payment pending for creator:', creator.email);
        break;

      case 'subscription.updated':
        // Plan updated
        const updatedPlanId = event.payload.subscription.entity.plan_id;
        let updatedPlanType = 'monthly';
        
        if (updatedPlanId === 'plan_QvemyKdfzVGTLc') {
          updatedPlanType = 'monthly';
        } else if (updatedPlanId === 'plan_Qvenh9X4D8ggzw') {
          updatedPlanType = 'yearly';
        }

        let updatedPlanExpiry = null;
        if (updatedPlanType === 'monthly') {
          updatedPlanExpiry = new Date();
          updatedPlanExpiry.setMonth(updatedPlanExpiry.getMonth() + 1);
        } else if (updatedPlanType === 'yearly') {
          updatedPlanExpiry = new Date();
          updatedPlanExpiry.setFullYear(updatedPlanExpiry.getFullYear() + 1);
        }

        await Creator.findByIdAndUpdate(creator._id, {
          plan: updatedPlanType,
          planExpiry: updatedPlanExpiry,
          subscriptionStatus: 'active'
        });

        console.log(`Plan updated to ${updatedPlanType} for creator:`, creator.email);
        break;

      default:
        console.log('Unhandled event type:', eventType);
        break;
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error processing Razorpay webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 