
'use server';

import { revalidatePath } from 'next/cache';
import { updateUserStatus } from '@/lib/users-store';

export async function suspendCreator(creatorId: string) {
  try {
    await updateUserStatus(creatorId, 'suspended');
    revalidatePath(`/admin/users/${creatorId}`);
    revalidatePath('/admin/users');
    return { 
      success: true, 
      message: 'Creator has been suspended for 24 hours. They will not be able to login during this period.' 
    };
  } catch(error) {
    return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred." };
  }
}

export async function liftSuspension(creatorId: string) {
  try {
    await updateUserStatus(creatorId, 'active');
    revalidatePath(`/admin/users/${creatorId}`);
    revalidatePath('/admin/users');
    return { 
      success: true, 
      message: 'Creator suspension has been lifted. They can now login to their account.' 
    };
  } catch(error) {
    return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred." };
  }
}

export async function deactivateCreator(creatorId: string) {
    try {
        console.log('🔄 Deactivating creator:', creatorId);
        const result = await updateUserStatus(creatorId, 'deactivated');
        console.log('📝 Deactivation result:', result);
        
        revalidatePath(`/admin/users/${creatorId}`);
        revalidatePath('/admin/users');
        
        return { 
            success: true, 
            message: 'Creator has been deactivated. They must submit a reactivation request to regain access.' 
        };
    } catch(error) {
        console.error('❌ Deactivation error:', error);
        return { 
            success: false, 
            message: error instanceof Error ? error.message : "An unknown error occurred." 
        };
    }
}
