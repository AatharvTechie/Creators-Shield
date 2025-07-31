import razorpay from 'razorpay';
import dbConnect from '@/lib/mongodb';
import Creator from '@/models/Creator';

export async function POST(req) {
  const body = await req.json();
  const { planId, userId } = body;
  
  // TODO: Update these Razorpay plan IDs in your Razorpay dashboard to match new pricing:
  // - Monthly plan ($70): Update plan_QvemyKdfzVGTLc to $70/month
  // - Yearly plan ($500): Update plan_Qvenh9X4D8ggzw to $500/year
  
  // Map user-friendly planId to Razorpay plan id
  let razorpayPlanId = planId;
  if (planId === 'monthly') razorpayPlanId = 'plan_QvemyKdfzVGTLc';
  if (planId === 'yearly') razorpayPlanId = 'plan_Qvenh9X4D8ggzw';
  
  await dbConnect();
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
    await Creator.findByIdAndUpdate(userId, {
      subscriptionId: subscription.id,
      plan: planId,
      planExpiry: planExpiry,
    });
    return Response.json({ subscriptionId: subscription.id });
  } catch (err) {
    console.error('CREATE SUBSCRIPTION ERROR:', err);
    return Response.json({ error: err.message, details: err }, { status: 500 });
  }
} 