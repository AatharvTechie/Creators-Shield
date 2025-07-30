
'use server';

import { revalidatePath } from 'next/cache';
import { addReplyToFeedback } from '@/lib/feedback-store';
import { sendDisconnectApprovalEmail, sendMarkAsReadNotificationEmail, sendFeedbackReplyEmail } from '@/lib/services/backend-services';
import { getUserById } from '@/lib/users-store';

export async function replyToFeedbackAction(feedbackId: string, replyMessage: string, creatorId?: string) {
  if (!replyMessage.trim()) {
    return { success: false, message: 'Reply message cannot be empty.' };
  }

  // Hardcoded admin name as session is removed
  const adminName = 'Admin';

  try {
    await addReplyToFeedback(feedbackId, {
      adminName: adminName,
      message: replyMessage,
    }, creatorId);
    
    // Send email notification for the reply
    if (creatorId) {
      try {
        const creator = await getUserById(creatorId);
        if (creator && creator.email) {
          await sendFeedbackReplyEmail({
            to: creator.email,
            creatorName: creator.displayName || creator.name || 'Creator',
            feedbackTitle: 'Feedback Response', // You might want to get the actual title from the feedback
            adminReply: replyMessage,
            replyTime: new Date().toLocaleString()
          });
        }
      } catch (emailError) {
        console.error('Failed to send feedback reply email:', emailError);
        // Don't fail the entire operation if email fails
      }
    }
    
    revalidatePath('/admin/feedback');
    revalidatePath('/dashboard/feedback'); // Revalidate for the creator too
    return { success: true, message: 'Reply sent successfully.' };
  } catch (error) {
    console.error('Error replying to feedback:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message };
  }
}

export async function approveDisconnectAction(creatorId: string, creatorEmail: string) {
  try {
    // Import the function from feedback-store
    const { approveDisconnectForCreator } = await import('@/lib/feedback-store');
    
    // Approve the disconnect
    await approveDisconnectForCreator(creatorId);
    
    // Send email notification
    try {
      const creator = await getUserById(creatorId);
      const creatorName = creator?.displayName || creator?.name || 'Creator';
      
      await sendDisconnectApprovalEmail({
        to: creatorEmail,
        creatorName: creatorName,
        approvalTime: new Date().toLocaleString()
      });
    } catch (emailError) {
      console.error('Failed to send disconnect approval email:', emailError);
      // Don't fail the entire operation if email fails
    }
    
    revalidatePath('/admin/feedback');
    return { success: true, message: 'Disconnect request approved and notification sent.' };
  } catch (error) {
    console.error('Error approving disconnect:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message };
  }
}

export async function markFeedbackAsReadAction(feedbackId: string, creatorId?: string, feedbackTitle?: string) {
  try {
    // Import the mark as read function from feedback-store
    const { markFeedbackAsRead } = await import('@/lib/feedback-store');
    
    // Call the mark as read function directly
    await markFeedbackAsRead(feedbackId, creatorId);
    
    // Send email notification for mark as read
    if (creatorId) {
      try {
        const creator = await getUserById(creatorId);
        if (creator && creator.email) {
          await sendMarkAsReadNotificationEmail({
            to: creator.email,
            creatorName: creator.displayName || creator.name || 'Creator',
            feedbackTitle: feedbackTitle || 'Feedback Submission',
            readTime: new Date().toLocaleString()
          });
        }
      } catch (emailError) {
        console.error('Failed to send mark as read notification email:', emailError);
        // Don't fail the entire operation if email fails
      }
    }
    
    revalidatePath('/admin/feedback');
    return { success: true, message: 'Feedback marked as read and notification sent.' };
  } catch (error) {
    console.error('Error marking feedback as read:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, message };
  }
}
