import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongodb';
import Platform from '@/models/Platform';

const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID;
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/instagram/callback';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      console.error('Instagram OAuth error:', error);
      return NextResponse.redirect('/dashboard/integrations?error=user_denied');
    }

    // Verify state parameter
    const storedState = req.cookies.get('instagram_oauth_state')?.value;
    if (!state || !storedState || state !== storedState) {
      console.error('Instagram OAuth state mismatch');
      return NextResponse.redirect('/dashboard/integrations?error=invalid_state');
    }

    if (!code) {
      console.error('No authorization code received');
      return NextResponse.redirect('/dashboard/integrations?error=no_code');
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: INSTAGRAM_APP_ID!,
        client_secret: INSTAGRAM_APP_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for token');
      return NextResponse.redirect('/dashboard/integrations?error=token_exchange_failed');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, user_id } = tokenData;

    // Get user info from Instagram
    const userResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${access_token}`
    );

    if (!userResponse.ok) {
      console.error('Failed to get Instagram user info');
      return NextResponse.redirect('/dashboard/integrations?error=user_info_failed');
    }

    const userData = await userResponse.json();

    // Get user's Instagram account info
    const accountResponse = await fetch(
      `https://graph.instagram.com/${user_id}?fields=id,username,followers_count,media_count&access_token=${access_token}`
    );

    let accountData = null;
    if (accountResponse.ok) {
      accountData = await accountResponse.json();
    }

    // Connect to database
    await dbConnect();

    // Get user from JWT token (we'll need to pass this somehow)
    // For now, we'll use a session-based approach
    const userEmail = req.cookies.get('user_email')?.value;
    
    if (!userEmail) {
      console.error('No user email found');
      return NextResponse.redirect('/dashboard/integrations?error=no_user');
    }

    // Disable all other platforms for this user
    await Platform.updateMany(
      { userId: userEmail },
      { status: 'disabled' }
    );

    // Create or update Instagram platform connection
    await Platform.findOneAndUpdate(
      { userId: userEmail, platform: 'instagram' },
      {
        status: 'connected',
        data: {
          accountId: user_id,
          username: userData.username,
          followers: accountData?.followers_count || 0,
          posts: accountData?.media_count || 0,
          accessToken: access_token
        },
        connectedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Clear OAuth state cookie
    const response = NextResponse.redirect('/dashboard/integrations?success=instagram_connected');
    response.cookies.delete('instagram_oauth_state');
    
    return response;

  } catch (error) {
    console.error('Instagram OAuth callback error:', error);
    return NextResponse.redirect('/dashboard/integrations?error=callback_failed');
  }
} 