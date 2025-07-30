
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

    if (!emailResult.success) {
      console.warn('⚠️ Email notification failed:', emailResult.message);
    }

    revalidatePath(`/admin/users/${creatorId}`);
    revalidatePath('/admin/users');
    return { 
      success: true, 
      message: 'Creator has been suspended for 24 hours. Email notification sent.' 
    };
  } catch(error) {
    console.error('❌ Suspension error:', error);
    return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred." };
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
    const emailResult = await sendCreatorNotification(
      creator.email,
      creator.displayName || creator.name || 'Creator',
      'lift-suspension'
    );

    if (!emailResult.success) {
      console.warn('⚠️ Email notification failed:', emailResult.message);
    }

    revalidatePath(`/admin/users/${creatorId}`);
    revalidatePath('/admin/users');
    return { 
      success: true, 
      message: 'Creator suspension has been lifted. Email notification sent.' 
    };
  } catch(error) {
    console.error('❌ Lift suspension error:', error);
    return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred." };
  }
}

export async function deactivateCreator(creatorId: string) {
    try {
        console.log('🔄 Deactivating creator:', creatorId);
        
        // Get creator details before deactivation
        const creator = await getUserById(creatorId);
        if (!creator || !creator.email) {
            throw new Error('Creator not found or email is missing');
        }

        // Update user status
        const result = await updateUserStatus(creatorId, 'deactivated');
        console.log('📝 Deactivation result:', result);
        
        // Send email notification
        const deactivationTime = new Date().toLocaleString();
        const emailResult = await sendCreatorNotification(
            creator.email,
            creator.displayName || creator.name || 'Creator',
            'deactivate',
            deactivationTime
        );

        if (!emailResult.success) {
            console.warn('⚠️ Email notification failed:', emailResult.message);
        }
        
        revalidatePath(`/admin/users/${creatorId}`);
        revalidatePath('/admin/users');
        
        return { 
            success: true, 
            message: 'Creator has been deactivated. Email notification sent.' 
        };
    } catch(error) {
        console.error('❌ Deactivation error:', error);
        return { 
            success: false, 
            message: error instanceof Error ? error.message : "An unknown error occurred." 
        };
    }
}
