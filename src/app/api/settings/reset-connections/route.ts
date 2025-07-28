import { NextResponse } from 'next/server';
import { getUserByEmail, updateUserWithUnset } from '@/lib/users-store';

export async function POST(req: any) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ success: false, error: 'Missing email' }, { status: 400 });
    const creator = await getUserByEmail(email);
    if (!creator) return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
    if (!creator.disconnectApproved) {
      return NextResponse.json({ success: false, error: 'Channel disconnection is restricted. Please request admin approval.' }, { status: 403 });
    }
    // Debug log
    console.log('Disconnecting creator:', creator._id, creator.email);
    // Clear YouTube channel info only, do not reset approval here
    await updateUserWithUnset(creator._id.toString(), ['youtubeChannel', 'youtubeChannelId']);
    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}