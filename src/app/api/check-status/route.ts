import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Creator from '@/models/Creator.js';
import { sendAccountReactivationEmail } from '@/lib/services/backend-services';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    console.log('🔍 Starting automatic status check...');
    
    // Get all suspended users
    const suspendedUsers = await Creator.find({ 
      status: 'suspended',
      suspensionTimestamp: { $exists: true, $ne: null }
    });
    
    console.log(`🔍 Found ${suspendedUsers.length} suspended users`);
    
    const reactivatedUsers = [];
    
    for (const user of suspendedUsers) {
      const suspensionTime = new Date(user.suspensionTimestamp);
      const currentTime = new Date();
      const timeDiff = suspensionTime.getTime() + (24 * 60 * 60 * 1000) - currentTime.getTime(); // 24 hours
      
      console.log(`🔍 Checking user ${user.email}:`, {
        suspensionTime: suspensionTime.toISOString(),
        currentTime: currentTime.toISOString(),
        timeDiff: timeDiff,
        timeDiffHours: Math.floor(timeDiff / (1000 * 60 * 60))
      });
      
      if (timeDiff <= 0) {
        // Suspension has expired, automatically reactivate
        console.log(`✅ Suspension expired for ${user.email}, reactivating...`);
        
        // Update user status
        await Creator.updateOne(
          { _id: user._id },
          { 
            $set: { 
              status: 'active',
              suspensionTimestamp: null 
            } 
          }
        );
        
        // Send reactivation email
        try {
          await sendAccountReactivationEmail({
            to: user.email,
            creatorName: user.displayName || user.name || 'Creator',
            reactivationTime: new Date().toLocaleString()
          });
          console.log(`✅ Reactivation email sent to: ${user.email}`);
          reactivatedUsers.push(user.email);
        } catch (emailError) {
          console.error(`❌ Failed to send reactivation email to ${user.email}:`, emailError);
        }
      }
    }
    
    // Get all deactivated users with approved reactivation requests
    const deactivatedUsers = await Creator.find({ 
      status: 'deactivated',
      'reactivationRequest.status': 'approved',
      'reactivationRequest.approvalTimestamp': { $exists: true, $ne: null }
    });
    
    console.log(`🔍 Found ${deactivatedUsers.length} deactivated users with approved reactivation`);
    
    const activatedUsers = [];
    
    for (const user of deactivatedUsers) {
      const approvalTime = new Date(user.reactivationRequest.approvalTimestamp);
      const currentTime = new Date();
      const timeDiff = approvalTime.getTime() + (24 * 60 * 60 * 1000) - currentTime.getTime(); // 24 hours
      
      console.log(`🔍 Checking deactivated user ${user.email}:`, {
        approvalTime: approvalTime.toISOString(),
        currentTime: currentTime.toISOString(),
        timeDiff: timeDiff,
        timeDiffHours: Math.floor(timeDiff / (1000 * 60 * 60))
      });
      
      if (timeDiff <= 0) {
        // Reactivation time has expired, automatically activate
        console.log(`✅ Reactivation time expired for ${user.email}, activating...`);
        
        // Update user status
        await Creator.updateOne(
          { _id: user._id },
          { 
            $set: { 
              status: 'active',
              deactivationTimestamp: null,
              'reactivationRequest.status': 'completed'
            } 
          }
        );
        
        // Send activation email
        try {
          await sendAccountReactivationEmail({
            to: user.email,
            creatorName: user.displayName || user.name || 'Creator',
            reactivationTime: new Date().toLocaleString()
          });
          console.log(`✅ Activation email sent to: ${user.email}`);
          activatedUsers.push(user.email);
        } catch (emailError) {
          console.error(`❌ Failed to send activation email to ${user.email}:`, emailError);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Status check completed',
      reactivatedUsers,
      activatedUsers,
      totalProcessed: reactivatedUsers.length + activatedUsers.length
    });
    
  } catch (error) {
    console.error('❌ Error in status check:', error);
    return NextResponse.json({ 
      error: 'Failed to check statuses',
      details: (error as Error).message 
    }, { status: 500 });
  }
}

// GET endpoint for manual status check
export async function GET() {
  try {
    await connectToDatabase();
    
    // Count suspended users
    const suspendedCount = await Creator.countDocuments({ 
      status: 'suspended',
      suspensionTimestamp: { $exists: true, $ne: null }
    });
    
    // Count deactivated users with approved reactivation
    const deactivatedCount = await Creator.countDocuments({ 
      status: 'deactivated',
      'reactivationRequest.status': 'approved',
      'reactivationRequest.approvalTimestamp': { $exists: true, $ne: null }
    });
    
    return NextResponse.json({
      success: true,
      suspendedUsers: suspendedCount,
      deactivatedUsers: deactivatedCount,
      message: 'Status check endpoint is working'
    });
    
  } catch (error) {
    console.error('❌ Error in status check GET:', error);
    return NextResponse.json({ 
      error: 'Failed to get status counts',
      details: (error as Error).message 
    }, { status: 500 });
  }
} 