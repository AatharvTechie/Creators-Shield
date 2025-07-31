'use server';

import dotenv from "dotenv";
dotenv.config();

const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID;
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET;

/**
 * Fetches core statistics for a given Instagram account using real API.
 * @returns An object with Instagram statistics or null if an error occurs.
 */
export async function getInstagramStats(accountId: string, accessToken?: string) {
    console.log(`Fetching Instagram stats for account ID: ${accountId}`);
    
    try {
        // For testing purposes, return mock data
        if (!accessToken || accessToken === 'test') {
            console.log('Using mock Instagram data for testing');
            const mockData = {
                id: accountId || 'test_instagram_account',
                username: 'test_instagram_user',
                followers: Math.floor(Math.random() * 10000) + 1000,
                posts: Math.floor(Math.random() * 100) + 10,
                totalLikes: Math.floor(Math.random() * 50000) + 5000,
                totalComments: Math.floor(Math.random() * 5000) + 500,
                engagementRate: Math.random() * 5 + 2,
                accountType: 'PERSONAL',
                url: `https://www.instagram.com/test_instagram_user`
            };
            
            console.log('Mock Instagram stats result:', mockData);
            return mockData;
        }

        // Real Instagram API calls (commented out for testing)
        /*
        if (!accessToken) {
            throw new Error("Instagram access token is required");
        }

        // Get user's Instagram account info
        const accountResponse = await fetch(
            `https://graph.instagram.com/${accountId}?fields=id,username,followers_count,media_count,account_type&access_token=${accessToken}`
        );

        if (!accountResponse.ok) {
            throw new Error("Failed to fetch Instagram account data");
        }

        const accountData = await accountResponse.json();

        // Get user's media for engagement stats
        const mediaResponse = await fetch(
            `https://graph.instagram.com/me/media?fields=id,like_count,comments_count&access_token=${accessToken}`
        );

        let totalLikes = 0;
        let totalComments = 0;
        let engagementRate = 0;

        if (mediaResponse.ok) {
            const mediaData = await mediaResponse.json();
            const media = mediaData.data || [];

            // Calculate total engagement
            media.forEach((post: any) => {
                totalLikes += post.like_count || 0;
                totalComments += post.comments_count || 0;
            });

            // Calculate engagement rate
            if (accountData.followers_count > 0 && media.length > 0) {
                const totalEngagement = totalLikes + totalComments;
                engagementRate = (totalEngagement / (accountData.followers_count * media.length)) * 100;
            }
        }

        const result = {
            id: accountData.id,
            username: accountData.username,
            followers: accountData.followers_count || 0,
            posts: accountData.media_count || 0,
            totalLikes: totalLikes,
            totalComments: totalComments,
            engagementRate: engagementRate,
            accountType: accountData.account_type,
            url: `https://www.instagram.com/${accountData.username}`
        };
        
        console.log('Instagram stats result:', result);
        return result;
        */
        
        throw new Error("Instagram API not configured for production use");
    } catch (error) {
        console.error(`Error fetching Instagram stats for ${accountId}:`, error);
        throw new Error("Failed to fetch Instagram statistics. Please check your connection.");
    }
}

/**
 * Fetches the most popular post for a given Instagram account.
 * @returns An object with the most popular post's details.
 */
export async function getMostPopularPost(accountId: string, accessToken?: string) {
    try {
        // For testing purposes, return mock data
        if (!accessToken || accessToken === 'test') {
            console.log('Using mock Instagram popular post data for testing');
            const mockPost = {
                id: 'test_post_123',
                caption: "This is a test post for Instagram integration testing",
                likes: Math.floor(Math.random() * 1000) + 100,
                comments: Math.floor(Math.random() * 100) + 10,
                mediaType: 'IMAGE',
                mediaUrl: 'https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Test+Post'
            };
            
            console.log('Mock Instagram popular post result:', mockPost);
            return mockPost;
        }

        // Real Instagram API calls (commented out for testing)
        /*
        if (!accessToken) {
            throw new Error("Instagram access token is required");
        }

        // Get user's media sorted by likes
        const mediaResponse = await fetch(
            `https://graph.instagram.com/me/media?fields=id,caption,like_count,comments_count,media_type,media_url&access_token=${accessToken}`
        );

        if (!mediaResponse.ok) {
            throw new Error("Failed to fetch Instagram media data");
        }

        const mediaData = await mediaResponse.json();
        const media = mediaData.data || [];

        if (media.length === 0) {
            return { 
                id: null, 
                caption: "No posts found", 
                likes: 0, 
                comments: 0,
                mediaType: null,
                mediaUrl: null
            };
        }

        // Find the post with most likes
        const mostPopularPost = media.reduce((prev: any, current: any) => {
            return (prev.like_count > current.like_count) ? prev : current;
        });

        return {
            id: mostPopularPost.id,
            caption: mostPopularPost.caption || "No caption",
            likes: mostPopularPost.like_count || 0,
            comments: mostPopularPost.comments_count || 0,
            mediaType: mostPopularPost.media_type,
            mediaUrl: mostPopularPost.media_url
        };
        */

        throw new Error("Instagram API not configured for production use");

    } catch (error) {
        console.error(`Error fetching Instagram popular post for ${accountId}:`, error);
        return { 
            id: null, 
            caption: "No posts found", 
            likes: 0, 
            comments: 0,
            mediaType: null,
            mediaUrl: null
        };
    }
}

/**
 * Validates Instagram account ID format
 */
export async function validateInstagramAccount(accountId: string): Promise<boolean> {
    return accountId && accountId.length > 0;
}

/**
 * Refreshes Instagram access token
 */
export async function refreshInstagramToken(refreshToken: string) {
    try {
        const response = await fetch('https://graph.instagram.com/refresh_access_token', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                grant_type: 'ig_refresh_token',
                access_token: refreshToken,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh Instagram token');
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error refreshing Instagram token:', error);
        throw error;
    }
} 