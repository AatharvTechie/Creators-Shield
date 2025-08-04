
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

    console.log('Reactivation approval email result:', emailResult);

    return {
      success: true,
      message: `Reactivation request approved for ${creator.displayName || creator.name}.`,
      emailSent: emailResult.success,
      action: 'reactivation-approved'
    };

  } catch (error: any) {
    console.error('Approve reactivation error:', error);
    return {
      success: false,
      message: error.message || 'Failed to approve reactivation request',
      action: 'reactivation-approved'
    };
  }
}

export async function rejectReactivationRequest(creatorId: string, reason?: string) {
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

    console.log('Reactivation rejection email result:', emailResult);

    return {
      success: true,
      message: `Reactivation request rejected for ${creator.displayName || creator.name}.`,
      emailSent: emailResult.success,
      action: 'reactivation-rejected'
    };

  } catch (error: any) {
    console.error('Reject reactivation error:', error);
    return {
      success: false,
      message: error.message || 'Failed to reject reactivation request',
      action: 'reactivation-rejected'
    };
  }
}
