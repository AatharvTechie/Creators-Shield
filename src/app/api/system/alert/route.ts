import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Creator from '@/models/Creator';
import { triggerSystemAlertNotification } from '@/lib/audio-notification-utils';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { alertType, message, targetCreators } = await req.json();

    if (!alertType || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let creators = [];

    // If specific creators are targeted, get their info
    if (targetCreators && targetCreators.length > 0) {
      creators = await Creator.find({ _id: { $in: targetCreators } });
    } else {
      // Get all active creators for system-wide alerts
      creators = await Creator.find({ status: 'active' });
    }

    // Trigger audio notifications for all affected creators
    const notifications = creators.map(creator => ({
      creatorName: creator.name || creator.email.split('@')[0],
      alertMessage: message
    }));

    // Add pending notifications for each creator
    notifications.forEach(({ creatorName, alertMessage }) => {
      triggerSystemAlertNotification(creatorName, alertMessage);
    });

    return NextResponse.json({ 
      success: true, 
      message: `System alert sent to ${creators.length} creators`,
      affectedCreators: creators.length,
      alertType,
      message
    });

  } catch (error) {
    console.error('Error sending system alert:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint to retrieve system alerts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const alertType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10');

    // This would typically fetch from a SystemAlert model
    // For now, return mock data
    const alerts = [
      {
        id: '1',
        type: 'maintenance',
        message: 'Scheduled maintenance on Sunday at 2 AM',
        createdAt: new Date().toISOString(),
        priority: 'medium'
      },
      {
        id: '2',
        type: 'security',
        message: 'New security features have been deployed',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        priority: 'high'
      }
    ];

    const filteredAlerts = alertType 
      ? alerts.filter(alert => alert.type === alertType)
      : alerts;

    return NextResponse.json({ 
      success: true, 
      alerts: filteredAlerts.slice(0, limit)
    });

  } catch (error) {
    console.error('Error fetching system alerts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 