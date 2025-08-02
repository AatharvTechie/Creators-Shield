import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      console.error('YOUTUBE_API_KEY is missing');
      return Response.json({ error: 'Missing YOUTUBE_API_KEY' }, { status: 500 });
    }

    const { channelId } = await req.json();

    if (!channelId) {
      return Response.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    const youtube = google.youtube({
      version: 'v3',
      auth: apiKey
    });

    const response = await youtube.channels.list({
      part: ['snippet'],
      id: [channelId]
    });

    if (!response.data.items || response.data.items.length === 0) {
      return Response.json({ 
        error: 'Channel not found',
        message: 'The provided channel ID does not exist or is not accessible.'
      }, { status: 404 });
    }

    const channel = response.data.items[0];
    
    return Response.json({
      success: true,
      channel: {
        id: channel.id,
        title: channel.snippet?.title,
        description: channel.snippet?.description,
        thumbnail: channel.snippet?.thumbnails?.high?.url
      }
    });

  } catch (error) {
    console.error('Error verifying channel:', error);
    
    if (error.message && error.message.includes('quota')) {
      return Response.json({ 
        error: 'API quota exceeded',
        message: 'YouTube API quota has been exceeded. Please try again later.'
      }, { status: 429 });
    }
    
    return Response.json({ 
      error: 'Failed to verify channel',
      message: 'An error occurred while verifying the channel.'
    }, { status: 500 });
  }
} 