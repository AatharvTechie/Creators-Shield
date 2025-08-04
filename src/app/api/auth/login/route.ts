import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import Creator from '@/models/Creator';
import Admin from '@/models/Admin';
import Session from '@/models/Session';
import { checkSuspensionStatus, checkDeactivationStatus, checkApprovalStatus } from '@/lib/users-store';
import { parseUserAgent, getClientIP, generateSessionId } from '@/lib/device-utils';
import { sendEmail } from '@/lib/email-service';
import { getLocationFromIP, formatLocation } from '@/lib/location-service';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const ADMIN_EMAILS = [
  'guddumis003@gmail.com',
  'contactpradeeprajput@gmail.com',
];

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
      
      // Enhanced device detection and session management
      let isNewDevice = false; // Initialize outside try-catch
      let deviceInfo: any = null; // Initialize deviceInfo outside try-catch
      let locationString = 'Unknown'; // Initialize location outside try-catch
      let ipAddress = 'Unknown'; // Initialize IP outside try-catch
      
      // Create session ID first
      const sessionId = generateSessionId();
      const token = jwt.sign({ 
        id: user._id, 
        email: user.email, 
        name: user.name, 
        role: 'creator', 
        plan: user.plan,
        sessionId: sessionId // Include sessionId in JWT
      }, JWT_SECRET, { expiresIn: '7d' });
        
      try {
        deviceInfo = parseUserAgent(userAgent || 'Unknown');
        ipAddress = getClientIP(req);
          
          console.log(`🔍 Device detection for user ${email}:`, {
            device: deviceInfo.device,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            ipAddress
          });
          
          // Get location information
          const locationData = await getLocationFromIP(ipAddress);
          locationString = formatLocation(locationData);
          
          console.log(`📍 Location detected: ${locationString} (IP: ${ipAddress})`);
          
          // Check if this device already exists for this user (more accurate comparison)
          // Create a unique device fingerprint
          const deviceFingerprint = `${ipAddress}-${deviceInfo.device}-${deviceInfo.browser}-${deviceInfo.os}`;
          
          console.log(`🔍 Looking for existing session with criteria:`, {
            user: user._id,
            device: deviceInfo.device,
            browser: deviceInfo.browser,
            os: deviceInfo.os
          });
          
          const existingSession = await Session.findOne({
            user: user._id,
            ipAddress: ipAddress,
            device: deviceInfo.device,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            // Also check if session is not expired
            expiresAt: { $gt: new Date() }
          });
          
          console.log(`🔍 Device fingerprint: ${deviceFingerprint}`);
          console.log(`🔍 Existing session found: ${existingSession ? 'YES' : 'NO'}`);
          console.log(`🔍 User ID: ${user._id}`);
          console.log(`🔍 Device info: ${JSON.stringify(deviceInfo)}`);
          
          isNewDevice = !existingSession;
          
          console.log(`📱 Device check result: ${isNewDevice ? 'NEW DEVICE' : 'EXISTING DEVICE'}`);
          console.log(`📱 isNewDevice value: ${isNewDevice}`);
        
        // Mark all existing sessions as not current
          await Session.updateMany(
          { user: user._id },
          { isCurrentSession: false }
        );
        
        if (existingSession) {
          // Update existing session
          try {
            await Session.updateOne(
              { _id: existingSession._id },
              {
                $set: {
                  isCurrentSession: true,
                  lastActive: new Date(),
                  ipAddress: ipAddress,
                  userAgent: userAgent || 'Unknown',
                  location: locationString,
                  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
                }
              }
            );
            
            console.log(`✅ Existing session updated for user ${email} on device: ${deviceInfo.device} (${deviceInfo.browser} on ${deviceInfo.os})`);
          } catch (updateError) {
            console.error('❌ Failed to update existing session:', updateError);
          }
        } else {
          // Create new session for new device
          try {
            await Session.create({
          user: user._id,
          sessionId,
          device: deviceInfo.device,
          userAgent: userAgent || 'Unknown',
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          ipAddress,
              location: locationString,
          isCurrentSession: true,
          lastActive: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
        
            console.log(`✅ New session created for user ${email} on device: ${deviceInfo.device} (${deviceInfo.browser} on ${deviceInfo.os}) at ${locationString}`);
          } catch (createError) {
            console.error('❌ Failed to create new session:', createError);
            // Set isNewDevice to false to avoid sending notifications for failed sessions
            isNewDevice = false;
          }
        }
        
                 // Send notification for new device
         if (isNewDevice) {
           console.log(`📧 Sending new device alert to ${email}...`);
           try {
             // Format the login time
             const loginTime = new Date().toLocaleString('en-US', {
               year: 'numeric',
               month: 'long',
               day: 'numeric',
               hour: '2-digit',
               minute: '2-digit',
               timeZoneName: 'short'
             });

             // Create email content
             const emailContent = `
               <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                 <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                   <h1 style="margin: 0; font-size: 24px;">🔐 New Login Alert</h1>
                   <p style="margin: 10px 0 0 0; opacity: 0.9;">Your CreatorShield account has been accessed</p>
                 </div>
                 
                 <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                   <h2 style="color: #333; margin-top: 0;">Hello ${user.name || 'there'},</h2>
                   
                   <p style="color: #666; line-height: 1.6;">
                     We detected a new login to your CreatorShield account. If this was you, you can safely ignore this email.
                   </p>
                   
                   <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                     <h3 style="color: #333; margin-top: 0;">📱 Device Information</h3>
                     <table style="width: 100%; border-collapse: collapse;">
                       <tr>
                         <td style="padding: 8px 0; color: #666; font-weight: bold;">Device:</td>
                         <td style="padding: 8px 0; color: #333;">${deviceInfo.device}</td>
                       </tr>
                       <tr>
                         <td style="padding: 8px 0; color: #666; font-weight: bold;">Browser:</td>
                         <td style="padding: 8px 0; color: #333;">${deviceInfo.browser}</td>
                       </tr>
                       <tr>
                         <td style="padding: 8px 0; color: #666; font-weight: bold;">Operating System:</td>
                         <td style="padding: 8px 0; color: #333;">${deviceInfo.os}</td>
                       </tr>
                       <tr>
                         <td style="padding: 8px 0; color: #666; font-weight: bold;">Location:</td>
                         <td style="padding: 8px 0; color: #333;">${locationString}</td>
                       </tr>
                       <tr>
                         <td style="padding: 8px 0; color: #666; font-weight: bold;">IP Address:</td>
                         <td style="padding: 8px 0; color: #333;">${ipAddress}</td>
                       </tr>
                       <tr>
                         <td style="padding: 8px 0; color: #666; font-weight: bold;">Login Time:</td>
                         <td style="padding: 8px 0; color: #333;">${loginTime}</td>
                       </tr>
                     </table>
                   </div>
                   
                   <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                     <h3 style="color: #856404; margin-top: 0;">⚠️ Security Notice</h3>
                     <p style="color: #856404; margin: 0; line-height: 1.6;">
                       If this login wasn't you, please take immediate action:
                     </p>
                     <ul style="color: #856404; margin: 10px 0 0 0; padding-left: 20px;">
                       <li>Change your password immediately</li>
                       <li>Enable two-factor authentication</li>
                       <li>Contact our support team</li>
                     </ul>
                   </div>
                   
                   <div style="text-align: center; margin-top: 30px;">
                     <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" 
                        style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                       Go to Account Settings
                     </a>
                   </div>
                   
                   <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                     This is an automated security alert from CreatorShield.<br>
                     If you have any questions, please contact our support team.
                   </p>
                 </div>
               </div>
             `;

             // Send the email
             const emailResult = await sendEmail({
               to: email,
               subject: '🔐 New Login Alert - CreatorShield Account',
               html: emailContent
             });

             if (emailResult.success) {
               console.log(`✅ New device login alert sent successfully to ${email}`);
             } else {
               console.error(`❌ Failed to send email to ${email}:`, emailResult.message);
             }
           } catch (emailError) {
             console.error('❌ Failed to send new device alert:', emailError);
           }
         } else {
           console.log(`ℹ️ No new device alert needed for ${email} - existing device`);
         }
      } catch (sessionError) {
        console.error('Error creating session:', sessionError);
        // Don't fail login if session creation fails
        // Keep isNewDevice as false if session creation fails
        isNewDevice = false;
      }
      
      // Create response with token in cookies
      const responseData: any = { 
        token, 
        user: { id: user._id, email: user.email, name: user.name, role: 'creator', plan: user.plan },
        isNewDevice: isNewDevice
      };

      // If new device, include device info for voice alert
      if (isNewDevice && deviceInfo) {
        responseData.deviceInfo = {
          device: deviceInfo.device,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          location: locationString,
          ipAddress: ipAddress
        };
        console.log(`🔊 Response: Including device info for voice alert:`, responseData.deviceInfo);
      } else {
        console.log(`🔊 Response: No device info included (not new device or deviceInfo is null)`);
      }

      console.log(`🔊 Final response data:`, JSON.stringify(responseData, null, 2));
      const response = NextResponse.json(responseData);
      
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