
'use server';

import { revalidatePath } from 'next/cache';
import { updateReactivationStatus } from '@/lib/users-store';

export async function approveReactivationRequest(creatorId: string) {
  try {
    await updateReactivationStatus(creatorId, 'approved');
    revalidatePath('/admin/reactivations');
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${creatorId}`);
    return { 
      success: true, 
      message: 'Reactivation request approved. Creator account will be automatically activated after 24 hours.' 
    };
  } catch(error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unknown error occurred." 
    };
  }
}

export async function rejectReactivationRequest(creatorId: string) {
  try {
    await updateReactivationStatus(creatorId, 'rejected');
    revalidatePath('/admin/reactivations');
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${creatorId}`);
    return { 
      success: true, 
      message: 'Reactivation request has been rejected.' 
    };
  } catch(error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unknown error occurred." 
    };
  }
}
