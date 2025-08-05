import razorpay from 'razorpay';
import dbConnect from '@/lib/mongodb';
import Creator from '@/models/Creator';

export async function POST(req) {
  const body = await req.json();
  const { planId, userId } = body;
  
  await dbConnect();
  
  // Handle free plan separately (no Razorpay subscription needed)
  if (planId === 'free') {
    try {
      // Check if user already has a free plan or has used free trial
      const existingUser = await Creator.findById(userId);
      
      if (existingUser.plan === 'free' || existingUser.freeTrialUsed) {
        return Response.json({ 
          error: 'You have already used your free trial. Please choose a paid plan.',
          success: false
        }, { status: 400 });
      }
      
      // Calculate free trial expiry (7 days)
      const planExpiry = new Date();
      planExpiry.setDate(planExpiry.getDate() + 7);
      
      // Update user's plan directly
      await Creator.findOneAndUpdate(
        { _id: userId }, 
        {
          plan: 'free',
          planExpiry: planExpiry,
          subscriptionStatus: 'active',
          lastPaymentDate: new Date(),
          freeTrialUsed: true // Mark that free trial has been used
        }
      );
      
      return Response.json({ 
        success: true,
        subscriptionId: 'free_trial_' + Date.now(), // Generate a unique ID for free trial
        plan: 'free',
        planExpiry: planExpiry
      });
    } catch (err) {
      console.error('FREE PLAN ACTIVATION ERROR:', err);
      return Response.json({ error: 'Failed to activate free trial', details: err }, { status: 500 });
    }
  }
  
  // TODO: Update these Razorpay plan IDs in your Razorpay dashboard to match new pricing:
  // - Monthly plan ($70): Update plan_QvemyKdfzVGTLc to $70/month
  // - Yearly plan ($500): Update plan_Qvenh9X4D8ggzw to $500/year
  
  // Map user-friendly planId to Razorpay plan id
  let razorpayPlanId = planId;
  if (planId === 'monthly') razorpayPlanId = 'plan_QvemyKdfzVGTLc';
  if (planId === 'yearly') razorpayPlanId = 'plan_Qvenh9X4D8ggzw';
  
  const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  
  try {
    const subscription = await razorpayInstance.subscriptions.create({
      plan_id: razorpayPlanId,
      customer_notify: 1,
      total_count: razorpayPlanId === 'plan_QvemyKdfzVGTLc' ? 12 : 1,
    });
    
    // Calculate plan expiry date
    let planExpiry = null;
    if (planId === 'monthly') {
      planExpiry = new Date();
      planExpiry.setMonth(planExpiry.getMonth() + 1);
    } else if (planId === 'yearly') {
      planExpiry = new Date();
      planExpiry.setFullYear(planExpiry.getFullYear() + 1);
    }
    
    await Creator.findOneAndUpdate(
      { _id: userId }, 
      {
        subscriptionId: subscription.id,
        plan: planId,
        planExpiry: planExpiry,
        subscriptionStatus: 'pending',
        lastPaymentDate: new Date()
      }
    );
    
    return Response.json({ 
      success: true,
      subscriptionId: subscription.id,
      plan: planId,
      planExpiry: planExpiry
    });
  } catch (err) {
    console.error('CREATE SUBSCRIPTION ERROR:', err);
    return Response.json({ error: err.message, details: err }, { status: 500 });
  }
} 