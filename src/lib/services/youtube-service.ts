'use server';

import dotenv from "dotenv";
dotenv.config();


import { google } from 'googleapis';

const getYouTubeClient = () => {
    console.log("ENV KEY:", process.env.YOUTUBE_API_KEY ? "Present" : "Missing");

    if (!process.env.YOUTUBE_API_KEY) {
        throw new Error("YouTube API key is not configured.");
    }
    return google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });
};


/**
 * Fetches core statistics for a given YouTube channel ID.
 * @returns An object with channel statistics or null if an error occurs.
 */
export async function getChannelStats(channelId: string) {
    console.log(`Fetching stats for channel ID: ${channelId}`);
    const youtube = getYouTubeClient();

    try {
        const response = await youtube.channels.list({
            part: ['snippet', 'statistics'],
            id: [channelId],
            fields: 'items(id,snippet(title,thumbnails(high)),statistics(subscriberCount,viewCount,videoCount))' // Added videoCount
        });

        console.log('YouTube API response:', response.data);
        const channel = response.data.items?.[0];

        if (!channel || !channel.statistics || !channel.snippet) {
            console.warn("Could not retrieve channel statistics from YouTube API.");
            console.warn("Channel:", channel);
            console.warn("Statistics:", channel?.statistics);
            console.warn("Snippet:", channel?.snippet);
            return null;
        }

        const result = {
            id: channel.id!,
            title: channel.snippet.title!,
            avatar: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.medium?.url || channel.snippet.thumbnails?.default?.url,
            subscribers: parseInt(channel.statistics.subscriberCount!, 10),
            views: parseInt(channel.statistics.viewCount!, 10),
            videos: parseInt(channel.statistics.videoCount!, 10), // Added video count
            url: `https://www.youtube.com/channel/${channel.id!}`
        };
        console.log('Channel stats result:', result);
        return result;
    } catch (error) {
        console.error(`Error fetching real channel stats for ${channelId}:`, error);
        
        // Check if it's a quota exceeded error
        if (error.message && error.message.includes('quota')) {
            console.warn('YouTube API quota exceeded. Using fallback data.');
            // Return fallback data when quota is exceeded
            return {
                id: channelId,
                title: 'Channel Data Unavailable',
                avatar: null,
                subscribers: 0,
                views: 0,
                videos: 0,
                url: `https://www.youtube.com/channel/${channelId}`
            };
        }
        
        throw new Error("Failed to fetch channel statistics from YouTube. Please check the Channel ID.");
    }
}


/**
 * Fetches the most viewed video for a given YouTube channel.
 * @returns An object with the most viewed video's details.
 */
export async function getMostViewedVideo(channelId: string) {
    const youtube = getYouTubeClient();
    
    try {
        const response = await youtube.search.list({
            part: ['snippet'],
            channelId: channelId,
            order: 'viewCount',
            type: ['video'],
            maxResults: 1,
            fields: 'items(id(videoId),snippet(title))' // Only fetch needed fields
        });
        
        const mostViewed = response.data.items?.[0];
        if (!mostViewed || !mostViewed.id?.videoId) {
            return { title: "No videos found", views: 0 };
        }

        const videoDetails = await youtube.videos.list({
            part: ['statistics'],
            id: [mostViewed.id.videoId],
            fields: 'items(statistics(viewCount))' // Only fetch view count
        });

        const views = videoDetails.data.items?.[0]?.statistics?.viewCount;

        return {
            title: mostViewed.snippet?.title,
            views: views ? parseInt(views, 10) : 'N/A'
        };

    } catch (error) {
        console.error(`Error fetching most viewed video for ${channelId}:`, error);
        
        // Check if it's a quota exceeded error
        if (error.message && error.message.includes('quota')) {
            console.warn('YouTube API quota exceeded. Using fallback data for most viewed video.');
            return {
                title: 'Video data unavailable',
                views: 0
            };
        }
        
        throw new Error("Failed to fetch most viewed video.");
    }
}

/**
 * Searches YouTube for videos matching a keyword or content string.
 * @param {string} query - The search query (keywords, title, etc.)
 * @param {number} maxResults - Maximum number of results to return
 * @returns {Promise<Array<{ videoId: string, title: string, url: string, channelTitle: string, channelId: string }>>}
 */
export async function searchYoutubeByKeyword(query: string, maxResults: number = 10) {
    const youtube = getYouTubeClient();
    try {
        const response = await youtube.search.list({
            part: ['snippet'],
            q: query,
            type: ['video'],
            maxResults
        });
        return (response.data.items || []).map(item => ({
            videoId: item.id?.videoId || '',
            title: item.snippet?.title || '',
            url: item.id?.videoId ? `https://www.youtube.com/watch?v=${item.id.videoId}` : '',
            channelTitle: item.snippet?.channelTitle || '',
            channelId: item.snippet?.channelId || ''
        }));
    } catch (error) {
        console.error('Error searching YouTube by keyword:', error);
        throw new Error('Failed to search YouTube.');
    }
}
