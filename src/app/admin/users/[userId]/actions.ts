
'use server';

import { revalidatePath } from 'next/cache';
import { updateUserStatus, getUserById } from '@/lib/users-store';
import { sendCreatorNotification } from '@/lib/email-service';

export async function suspendCreator(creatorId: string) {
  try {
    // Get creator details before suspension
    const creator = await getUserById(creatorId);
    if (!creator || !creator.email) {
      throw new Error('Creator not found or email is missing');
    }

    // Update user status
    await updateUserStatus(creatorId, 'suspended');
    
    // Send email notification
    const suspensionTime = new Date().toLocaleString();
    const emailResult = await sendCreatorNotification(
      creator.email,
      creator.displayName || creator.name || 'Creator',
      'suspend',
      suspensionTime
    );

    console.log('Suspension email result:', emailResult);

    return {
      success: true,
      message: `Creator ${creator.displayName || creator.name} has been suspended for 24 hours.`,
      emailSent: emailResult.success,
      action: 'suspend' // This will be used by client to trigger voice notification
    };

  } catch (error: any) {
    console.error('Suspend creator error:', error);
    return {
      success: false,
      message: error.message || 'Failed to suspend creator',
      action: 'suspend'
    };
  }
}

export async function liftSuspension(creatorId: string) {
  try {
    // Get creator details before lifting suspension
    const creator = await getUserById(creatorId);
    if (!creator || !creator.email) {
      throw new Error('Creator not found or email is missing');
    }

    // Update user status
    await updateUserStatus(creatorId, 'active');
    
    // Send email notification
    const reactivationTime = new Date().toLocaleString();
    const emailResult = await sendCreatorNotification(
      creator.email,
      creator.displayName || creator.name || 'Creator',
      'lift-suspension',
      reactivationTime
    );

    console.log('Lift suspension email result:', emailResult);

    return {
      success: true,
      message: `Suspension lifted for ${creator.displayName || creator.name}.`,
      emailSent: emailResult.success,
      action: 'lift-suspension'
    };

  } catch (error: any) {
    console.error('Lift suspension error:', error);
    return {
      success: false,
      message: error.message || 'Failed to lift suspension',
      action: 'lift-suspension'
    };
  }
}

export async function deactivateCreator(creatorId: string) {
  try {
    // Get creator details before deactivation
    const creator = await getUserById(creatorId);
    if (!creator || !creator.email) {
      throw new Error('Creator not found or email is missing');
    }

    // Update user status
    await updateUserStatus(creatorId, 'deactivated');
    
    // Send email notification
    const deactivationTime = new Date().toLocaleString();
    const emailResult = await sendCreatorNotification(
      creator.email,
      creator.displayName || creator.name || 'Creator',
      'deactivate',
      deactivationTime
    );

    console.log('Deactivation email result:', emailResult);

    return {
      success: true,
      message: `Creator ${creator.displayName || creator.name} has been deactivated.`,
      emailSent: emailResult.success,
      action: 'deactivate'
    };

  } catch (error: any) {
    console.error('Deactivate creator error:', error);
    return {
      success: false,
      message: error.message || 'Failed to deactivate creator',
      action: 'deactivate'
    };
  }
}
