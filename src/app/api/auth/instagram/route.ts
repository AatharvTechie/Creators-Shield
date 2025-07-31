import { NextRequest, NextResponse } from 'next/server';

const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID;
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/instagram/callback';

export async function GET(req: NextRequest) {
  try {
    // Check if environment variables are set
    if (!INSTAGRAM_APP_ID || !INSTAGRAM_APP_SECRET) {
      console.error('Instagram OAuth: Missing environment variables');
      return NextResponse.redirect('/dashboard/integrations?error=config_missing');
    }

    // Validate redirect URI
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      console.error('Instagram OAuth: Missing NEXT_PUBLIC_BASE_URL');
      return NextResponse.redirect('/dashboard/integrations?error=config_missing');
    }

    // Generate state parameter for security
    const state = Math.random().toString(36).substring(7);
    
    // Use Instagram Basic Display API endpoint
    const response = NextResponse.redirect(
      `https://api.instagram.com/oauth/authorize?` +
      `client_id=${INSTAGRAM_APP_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `scope=user_profile,user_media&` +
      `response_type=code&` +
      `state=${state}`
    );

    // Set state in cookie for verification
    response.cookies.set('instagram_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10 // 10 minutes
    });

    console.log('Instagram OAuth URL:', `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user_profile,user_media&response_type=code&state=${state}`);

    return response;

  } catch (error) {
    console.error('Instagram OAuth error:', error);
    return NextResponse.redirect('/dashboard/integrations?error=oauth_failed');
  }
} 