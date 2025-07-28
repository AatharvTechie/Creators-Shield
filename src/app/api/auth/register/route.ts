import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import Creator from '@/models/Creator';
import Admin from '@/models/Admin';
import Settings from '@/models/Settings';

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
    return NextResponse.json({ 
      success: true, 
      role: 'creator',
      message: 'Account created successfully! You will be redirected to choose your subscription plan.'
    });
  }
} 