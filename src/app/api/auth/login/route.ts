import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import Creator from '@/models/Creator';
import Admin from '@/models/Admin';
import Session from '@/models/Session';
import { checkSuspensionStatus, checkDeactivationStatus, checkApprovalStatus } from '@/lib/users-store';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const ADMIN_EMAILS = [
  'guddumis003@gmail.com',
  'contactpradeeprajput@gmail.com',
];

// Helper function to get device information
const getDeviceInfo = (userAgent: string) => {
  if (userAgent.includes('Mobile')) {
    if (userAgent.includes('Android')) return 'Android Mobile';
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('iPad')) return 'iPad';
    return 'Mobile Device';
  }
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Mac')) return 'Mac';
  if (userAgent.includes('Linux')) return 'Linux PC';
  return 'Desktop';
};

export async function POST(req: Request) {
  try {
    const { email, password, userAgent } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json({ error: 'Database connection failed. Please try again.' }, { status: 500 });
    }
    
    if (ADMIN_EMAILS.includes(email)) {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      const valid = await bcrypt.compare(password, admin.password);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      const token = jwt.sign({ id: admin._id, email: admin.email, name: admin.name, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
      
      // Create response with token in cookies
      const response = NextResponse.json({ 
        token, 
        user: { id: admin._id, email: admin.email, name: admin.name, role: 'admin' } 
      });
      
      // Set JWT token in HTTP-only cookie
      response.cookies.set('admin_jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      });
      
      return response;
    } else {
      // Fix: Creator.findOne is not callable directly, use Creator.findOne.call or ensure correct import
      const user = await (Creator as any).findOne({ email });
      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      
      // Check suspension status
      const suspensionStatus = await checkSuspensionStatus(user._id.toString());
      
      if (suspensionStatus.isSuspended) {
        const hours = Math.floor(suspensionStatus.timeRemaining! / (1000 * 60 * 60));
        const minutes = Math.floor((suspensionStatus.timeRemaining! % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((suspensionStatus.timeRemaining! % (1000 * 60)) / 1000);
        
        return NextResponse.json({ 
          error: 'Account Suspended',
          message: `Your account has been suspended due to suspicious activity. You can login again in ${hours}h ${minutes}m ${seconds}s.`,
          timeRemaining: suspensionStatus.timeRemaining,
          hours,
          minutes,
          seconds
        }, { status: 403 });
      }
      
      // Check deactivation status
      const deactivationStatus = await checkDeactivationStatus(user._id.toString());
      
      if (deactivationStatus.isDeactivated) {
        // Check if reactivation was approved and countdown is active
        const approvalStatus = await checkApprovalStatus(user._id.toString());
        
        if (approvalStatus.isApproved) {
          const hours = Math.floor(approvalStatus.timeRemaining! / (1000 * 60 * 60));
          const minutes = Math.floor((approvalStatus.timeRemaining! % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((approvalStatus.timeRemaining! % (1000 * 60)) / 1000);
          
          return NextResponse.json({ 
            error: 'Account Reactivation Pending',
            message: `Your reactivation request has been approved! Your account will be activated in ${hours}h ${minutes}m ${seconds}s.`,
            timeRemaining: approvalStatus.timeRemaining,
            hours,
            minutes,
            seconds,
            isApproved: true
          }, { status: 403 });
        }
        
        return NextResponse.json({ 
          error: 'Account Deactivated',
          message: 'Your account has been deactivated by an administrator. You must submit a reactivation request to regain access.',
          hasReactivationRequest: deactivationStatus.hasReactivationRequest,
          reactivationStatus: deactivationStatus.reactivationStatus
        }, { status: 403 });
      }
      
      const token = jwt.sign({ id: user._id, email: user.email, name: user.name, role: 'creator', plan: user.plan }, JWT_SECRET, { expiresIn: '7d' });
      
      // Create session for device tracking
      try {
        const deviceInfo = getDeviceInfo(userAgent || 'Unknown');
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await (Session as any).findOneAndUpdate(
          { 
            user: user._id,
            userAgent: userAgent || 'Unknown',
            device: deviceInfo
          },
          {
            sessionId,
            device: deviceInfo,
            userAgent: userAgent || 'Unknown',
            lastActive: new Date()
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
          }
        );
        
        console.log(`Session created for user ${email} on device: ${deviceInfo}`);
      } catch (sessionError) {
        console.error('Error creating session:', sessionError);
        // Don't fail login if session creation fails
      }
      
      // Create response with token in cookies
      const response = NextResponse.json({ 
        token, 
        user: { id: user._id, email: user.email, name: user.name, role: 'creator', plan: user.plan } 
      });
      
      // Set JWT token in HTTP-only cookie
      response.cookies.set('creator_jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      });
      
      return response;
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 });
  }
} 