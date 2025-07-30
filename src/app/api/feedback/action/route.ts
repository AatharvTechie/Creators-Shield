import connectToDatabase from '@/lib/mongodb';
import Feedback from '@/models/Feedback.js';
import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/send-mail';
import { sendDisconnectApprovalEmail } from '@/lib/services/backend-services';

export async function POST(req: Request) {
  await connectToDatabase();
  const { feedbackId, action } = await req.json();
  const feedback = await Feedback.findById(feedbackId);
  if (!feedback) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  feedback.status = action === 'approve' ? 'approved' : 'rejected';
  await feedback.save();

  if (action === 'approve') {
    // Send email notification for disconnect approval
    try {
      await sendDisconnectApprovalEmail({
        to: feedback.creator.email,
        creatorName: feedback.creator.name || 'Creator',
        approvalTime: new Date().toLocaleString()
      });
    } catch (emailError) {
      console.error('Failed to send disconnect approval email:', emailError);
      // Don't fail the entire operation if email fails
    }
  }

  return NextResponse.json({ success: true });
} 