import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Creator from '@/models/Creator';
import { 
  triggerAdminApprovalNotification, 
  triggerAdminDenialNotification, 
  triggerDisconnectNotification 
} from '@/lib/audio-notification-utils';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { creatorId, action } = await req.json();

    if (!creatorId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the creator
    const creator = await Creator.findById(creatorId);
    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    // Update creator status based on action
    let updateData = {};
    let message = '';

    switch (action) {
      case 'approve':
        updateData = { status: 'approved', approvedAt: new Date() };
        message = 'Creator approved successfully';
        // Trigger audio notification
        triggerAdminApprovalNotification(creator.name || creator.email.split('@')[0]);
        break;
      
      case 'deny':
        updateData = { status: 'denied', deniedAt: new Date() };
        message = 'Creator denied successfully';
        // Trigger audio notification
        triggerAdminDenialNotification(creator.name || creator.email.split('@')[0]);
        break;
      
      case 'disconnect':
        updateData = { 
          status: 'disconnected', 
          disconnectedAt: new Date(),
          youtubeChannelId: null,
          youtubeChannel: null
        };
        message = 'Creator disconnected successfully';
        // Trigger audio notification
        triggerDisconnectNotification(creator.name || creator.email.split('@')[0]);
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update the creator
    await Creator.findByIdAndUpdate(creatorId, updateData);

    return NextResponse.json({ 
      success: true, 
      message,
      creatorName: creator.name || creator.email.split('@')[0],
      action
    });

  } catch (error) {
    console.error('Error processing admin action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 