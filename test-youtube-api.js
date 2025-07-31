const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function testYouTubeAPI() {
  console.log('Testing YouTube API connection...');
  console.log('API Key present:', !!process.env.YOUTUBE_API_KEY);
  
  if (!process.env.YOUTUBE_API_KEY) {
    console.error('YouTube API key is missing!');
    console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('YOUTUBE')));
    return;
  }

  const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
  });

  try {
    // Test with a known channel ID (PewDiePie's channel)
    const testChannelId = 'UC-lHJZR3Gqxm24_Vd_AJ5Yw';
    
    console.log('Testing with channel ID:', testChannelId);
    
    const response = await youtube.channels.list({
      part: ['snippet', 'statistics'],
      id: [testChannelId],
      fields: 'items(id,snippet(title,thumbnails(high)),statistics(subscriberCount,viewCount,videoCount))'
    });

    console.log('API Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.items && response.data.items.length > 0) {
      const channel = response.data.items[0];
      console.log('✅ YouTube API is working!');
      console.log('Channel Title:', channel.snippet.title);
      console.log('Subscribers:', channel.statistics.subscriberCount);
      console.log('Views:', channel.statistics.viewCount);
      console.log('Videos:', channel.statistics.videoCount);
    } else {
      console.log('❌ No channel data returned');
    }
    
  } catch (error) {
    console.error('❌ YouTube API Error:', error.message);
    console.error('Full error:', error);
  }
}

testYouTubeAPI(); 