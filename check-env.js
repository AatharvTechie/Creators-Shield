require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking environment variables...');
console.log('');

// Check for YouTube API key
console.log('YouTube API Key:', process.env.YOUTUBE_API_KEY ? '✅ Present' : '❌ Missing');
if (process.env.YOUTUBE_API_KEY) {
    console.log('  Key starts with:', process.env.YOUTUBE_API_KEY.substring(0, 10) + '...');
}

// Check for Google API key (alternative)
console.log('Google API Key:', process.env.GOOGLE_API_KEY ? '✅ Present' : '❌ Missing');
if (process.env.GOOGLE_API_KEY) {
    console.log('  Key starts with:', process.env.GOOGLE_API_KEY.substring(0, 10) + '...');
}

// Check for other possible API key names
const possibleKeys = [
    'YOUTUBE_API_KEY',
    'GOOGLE_API_KEY', 
    'GOOGLE_YOUTUBE_API_KEY',
    'YOUTUBE_KEY',
    'API_KEY'
];

console.log('');
console.log('🔍 All environment variables that might be API keys:');
Object.keys(process.env).forEach(key => {
    if (key.toLowerCase().includes('api') || key.toLowerCase().includes('youtube') || key.toLowerCase().includes('google')) {
        const value = process.env[key];
        console.log(`  ${key}: ${value ? '✅ Present' : '❌ Missing'}`);
        if (value) {
            console.log(`    Starts with: ${value.substring(0, 10)}...`);
        }
    }
});

console.log('');
console.log('💡 If YOUTUBE_API_KEY is missing, add it to your .env.local file:');
console.log('YOUTUBE_API_KEY=your_youtube_api_key_here'); 