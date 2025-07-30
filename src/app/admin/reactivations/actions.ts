
'use server';

import { revalidatePath } from 'next/cache';
import { updateReactivationStatus, getUserById } from '@/lib/users-store';
import { sendCreatorNotification } from '@/lib/email-service';

export async function approveReactivationRequest(creatorId: string) {
  try {
    // Get creator details before approval
    const creator = await getUserById(creatorId);
    if (!creator || !creator.email) {
      throw new Error('Creator not found or email is missing');
    }

    // Update reactivation status
    await updateReactivationStatus(creatorId, 'approved');
    
    // Send email notification
    const approvalTime = new Date().toLocaleString();
    const emailResult = await sendCreatorNotification(
      creator.email,
      creator.displayName || creator.name || 'Creator',
      'reactivation-approved',
      approvalTime
    );

    if (!emailResult.success) {
      console.warn('⚠️ Email notification failed:', emailResult.message);
    }

    revalidatePath('/admin/reactivations');
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${creatorId}`);
    return { 
      success: true, 
      message: 'Reactivation request approved. Email notification sent.' 
    };
  } catch(error) {
    console.error('❌ Reactivation approval error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unknown error occurred." 
    };
  }
}

export async function rejectReactivationRequest(creatorId: string) {
  try {
    // Get creator details before rejection
    const creator = await getUserById(creatorId);
    if (!creator || !creator.email) {
      throw new Error('Creator not found or email is missing');
    }

    // Update reactivation status
    await updateReactivationStatus(creatorId, 'rejected');
    
    // Send email notification
    const rejectionTime = new Date().toLocaleString();
    const emailResult = await sendCreatorNotification(
      creator.email,
      creator.displayName || creator.name || 'Creator',
      'reactivation-rejected',
      rejectionTime
    );

    if (!emailResult.success) {
      console.warn('⚠️ Email notification failed:', emailResult.message);
    }

    revalidatePath('/admin/reactivations');
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${creatorId}`);
    return { 
      success: true, 
      message: 'Reactivation request rejected. Email notification sent.' 
    };
  } catch(error) {
    console.error('❌ Reactivation rejection error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unknown error occurred." 
    };
  }
}
