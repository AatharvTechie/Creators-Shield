import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import Creator from '@/models/Creator';
import Admin from '@/models/Admin';
import Settings from '@/models/Settings';
import { sendWelcomeEmail, sendAdminNotificationEmail } from '@/lib/services/backend-services';

const ADMIN_EMAILS = [
  'guddumis003@gmail.com',
  'contactpradeeprajput@gmail.com',
];

export async function POST(req: Request) {
  const { name, email, password, location, avatar } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ 
      error: 'Missing required fields',
      message: 'Please fill in all required fields: name, email, and password are mandatory for registration.'
    }, { status: 400 });
  }
  
  await connectToDatabase();
  
  // Check if registrations are allowed
  const settings = await Settings.findOne();
  if (settings && !settings.allowRegistrations) {
    return NextResponse.json({ 
      error: 'Registration temporarily disabled',
      message: 'Registration is temporarily disabled while we perform essential system maintenance and updates. This ensures we provide you with the best possible experience. Please check back later or contact our support team at creatorshieldcommunity@gmail.com if you need immediate assistance.'
    }, { status: 403 });
  }
  
  if (ADMIN_EMAILS.includes(email)) {
    const existing = await Admin.findOne({ email });
    if (existing) {
      return NextResponse.json({ 
        error: 'Account already exists',
        message: 'An account with this email address already exists. Please try logging in instead, or use a different email address if you need to create a new account.'
      }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    await Admin.create({ name, email, password: hashed, location: location || 'N/A' });
    return NextResponse.json({ 
      success: true, 
      role: 'admin',
      message: 'Admin account created successfully! You will be redirected to the login page.'
    });
  } else {
    const existing = await Creator.findOne({ email });
    if (existing) {
      return NextResponse.json({ 
        error: 'Account already exists',
        message: 'An account with this email address already exists. Please try logging in instead, or use a different email address if you need to create a new account.'
      }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    await Creator.create({ name, email, password: hashed, avatar });
    
    // Send welcome email to the new creator
    try {
      console.log(`🔍 Attempting to send welcome email to: ${email}`);
      const welcomeResult = await sendWelcomeEmail({ to: email, creatorName: name });
      console.log(`✅ Welcome email result:`, welcomeResult);
      if (welcomeResult.success) {
        console.log(`✅ Welcome email sent successfully to ${email}`);
      } else {
        console.error(`❌ Welcome email failed:`, welcomeResult.error);
      }
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      // Don't fail registration if email fails
    }
    
    // Send admin notification emails
    try {
      console.log(`🔍 Attempting to send admin notification emails`);
      const adminMessage = `New creator registration: ${name} (${email}) has successfully registered on CreatorShield.`;
      const adminSubject = '[CreatorShield] New Creator Registration';
      
      // Get settings to check if notifications are enabled
      const settings = await Settings.findOne();
      console.log(`🔍 Settings found:`, settings);
      const notifyOnNewRegistrations = settings?.notifyOnNewRegistrations !== false; // Default to true
      console.log(`🔍 Notify on new registrations:`, notifyOnNewRegistrations);
      
      if (notifyOnNewRegistrations) {
        const adminEmails = [];
        
        // Add primary admin email if it exists
        if (settings?.notificationEmail) {
          adminEmails.push(settings.notificationEmail);
          console.log(`🔍 Added primary admin email: ${settings.notificationEmail}`);
        }
        
        // Add secondary admin email (always contactpradeeprajput@gmail.com)
        adminEmails.push('contactpradeeprajput@gmail.com');
        console.log(`🔍 Added secondary admin email: contactpradeeprajput@gmail.com`);
        
        // Remove duplicates
        const uniqueEmails = [...new Set(adminEmails)];
        console.log(`🔍 Final admin emails to send to:`, uniqueEmails);
        
        // Send to all admin emails
        const adminResults = await Promise.all(
          uniqueEmails.map(async (adminEmail) => {
            console.log(`🔍 Sending admin notification to: ${adminEmail}`);
            const result = await sendAdminNotificationEmail({ 
              to: adminEmail, 
              subject: adminSubject, 
              message: adminMessage,
              creatorName: name,
              creatorEmail: email
            });
            console.log(`🔍 Admin notification result for ${adminEmail}:`, result);
            return result;
          })
        );
        
        const successfulEmails = adminResults.filter(result => result.success);
        console.log(`✅ Admin notification emails sent successfully to ${successfulEmails.length}/${uniqueEmails.length} emails`);
      } else {
        console.log(`⚠️ Admin notifications are disabled in settings`);
      }
    } catch (error) {
      console.error('❌ Failed to send admin notification emails:', error);
      // Don't fail registration if admin emails fail
    }
    
    return NextResponse.json({ 
      success: true, 
      role: 'creator',
      message: 'Account created successfully! You will be redirected to choose your subscription plan.'
    });
  }
} 