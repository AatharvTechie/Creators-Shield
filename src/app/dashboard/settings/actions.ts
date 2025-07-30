
'use server';

import { revalidatePath } from 'next/cache';
import { getChannelStats, getMostViewedVideo } from '@/lib/services/youtube-service';
import { getUserByEmail, updateUser } from '@/lib/users-store';

export async function connectYouTubeChannelAction(channelId: string, userEmail: string) {
  try {
    console.log('🔍 Connecting YouTube channel:', channelId, 'for user:', userEmail);
    
    // Fetch both channel stats and most viewed video
    const [stats, mostViewedVideo] = await Promise.all([
      getChannelStats(channelId),
      getMostViewedVideo(channelId)
    ]);
    
    console.log('📊 YouTube stats:', stats);
    console.log('🎥 Most viewed video:', mostViewedVideo);
    
    if (!stats) {
      return { success: false, message: "Could not find a YouTube channel with that ID. Please check and try again." };
    }

    const user = await getUserByEmail(userEmail);
    console.log('👤 Found user:', user);
    console.log('🆔 User ID type:', typeof user.id, 'Value:', user.id);
    
    if (!user) {
       return { success: false, message: "Could not find user to update." };
    }
    
    const updateData = { 
      youtubeChannel: {
        id: channelId,
        title: stats.title || user.displayName,
        thumbnail: stats.avatar || user.avatar,
        url: stats.url,
        subscriberCount: stats.subscribers.toString(),
        viewCount: stats.views.toString(),
        mostViewedVideo: {
          title: mostViewedVideo.title || 'No video found',
          viewCount: mostViewedVideo.views.toString()
        }
      },
      youtubeChannelId: channelId, // Save channel ID separately for easy querying
      displayName: stats.title || user.displayName, // Update user display name from YouTube
      avatar: stats.avatar || user.avatar, // Update avatar from YouTube
      disconnectApproved: false, // Reset approval only after new connect
    };
    
    console.log('🔄 Updating user with data:', updateData);
    
    // Update the user's record with the new channel info
    const updateResult = await updateUser(user._id.toString(), updateData);
    console.log('✅ Update result:', updateResult);

    // Verify the update by fetching the user again
    const updatedUser = await getUserByEmail(userEmail);
    console.log('🔄 Updated user data:', updatedUser);

    // Force revalidation of all relevant paths
    revalidatePath('/dashboard', 'layout');
    revalidatePath('/admin/users', 'page');
    revalidatePath('/admin/overview', 'page');
    revalidatePath('/dashboard/overview', 'page');
    revalidatePath('/dashboard/analytics', 'page');

    return { 
      success: true, 
      message: `Successfully connected to ${stats.title}`,
      channelData: {
        title: stats.title,
        subscribers: stats.subscribers,
        views: stats.views,
        mostViewedVideo: mostViewedVideo
      }
    };
  } catch (error) {
    console.error('❌ Error connecting YouTube channel:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to connect YouTube channel. Please try again." 
    };
  }
}
