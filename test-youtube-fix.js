require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing YouTube API Configuration...');
console.log('');

// Check if the API key is present
const apiKey = process.env.YOUTUBE_API_KEY;
if (!apiKey) {
    console.log('❌ YOUTUBE_API_KEY is missing from .env.local');
    console.log('💡 Please add your YouTube API key to .env.local:');
    console.log('YOUTUBE_API_KEY=your_api_key_here');
    process.exit(1);
}

console.log('✅ YOUTUBE_API_KEY is present');
console.log('  Key starts with:', apiKey.substring(0, 10) + '...');

// Test the API key with a simple request
const { google } = require('googleapis');

async function testYouTubeAPI() {
    try {
        console.log('');
        console.log('🔍 Testing YouTube API connection...');
        
        const youtube = google.youtube({
            version: 'v3',
            auth: apiKey
        });

        // Test with a known channel ID (YouTube's official channel)
        const testChannelId = 'UCBR8-60-B28hp2BmDPdntcQ';
        
        const response = await youtube.channels.list({
            part: ['snippet'],
            id: [testChannelId],
            maxResults: 1
        });

        if (response.data.items && response.data.items.length > 0) {
            const channel = response.data.items[0];
            console.log('✅ YouTube API is working correctly!');
            console.log('  Test channel:', channel.snippet?.title);
            console.log('  Channel ID:', channel.id);
        } else {
            console.log('⚠️  API responded but no channel data found');
        }

    } catch (error) {
        console.log('❌ YouTube API test failed:');
        console.log('  Error:', error.message);
        
        if (error.message.includes('quota')) {
            console.log('');
            console.log('💡 This might be a quota issue. Try:');
            console.log('  1. Check your YouTube API quota in Google Cloud Console');
            console.log('  2. Wait a few minutes and try again');
            console.log('  3. Consider upgrading your API quota if needed');
        }
    }
}

testYouTubeAPI(); 