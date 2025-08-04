import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';

export async function DELETE(request: NextRequest) {
  try {
    const { email, permanentDelete, deleteAllData } = await request.json();
    
    if (!email || !permanentDelete || !deleteAllData) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.email !== email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await connectToDatabase();

    // Permanently delete user account and all associated data
    const result = await db.collection('creators').deleteOne({ email });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Delete all associated data
    await Promise.all([
      // Delete all sessions
      db.collection('sessions').deleteMany({ userEmail: email }),
      
      // Delete all analytics data
      db.collection('analytics').deleteMany({ userEmail: email }),
      
      // Delete all content scans
      db.collection('content_scans').deleteMany({ userEmail: email }),
      
      // Delete all copyright matches
      db.collection('copyright_matches').deleteMany({ userEmail: email }),
      
      // Delete all activity logs
      db.collection('activity_logs').deleteMany({ userEmail: email }),
      
      // Delete all feedback
      db.collection('feedback').deleteMany({ userEmail: email }),
      
      // Delete all platform connections
      db.collection('platform_connections').deleteMany({ userEmail: email }),
      
      // Delete all usage statistics
      db.collection('usage_stats').deleteMany({ userEmail: email })
    ]);

    // Log the deletion (this will be the last log for this user)
    await db.collection('deletion_logs').insertOne({
      userEmail: email,
      action: 'permanent_account_deletion',
      timestamp: new Date(),
      details: {
        permanentDelete,
        deleteAllData,
        ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        deletedCollections: [
          'creators',
          'sessions', 
          'analytics',
          'content_scans',
          'copyright_matches',
          'activity_logs',
          'feedback',
          'platform_connections',
          'usage_stats'
        ]
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Account permanently deleted. All data has been removed from our servers.'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 