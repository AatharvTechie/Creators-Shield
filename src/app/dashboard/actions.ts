
'use server';

import type { User, UserAnalytics, Violation, DashboardData } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import { subDays, format } from 'date-fns';
import { getUserById, getUserByEmail } from '@/lib/users-store';
import { revalidatePath } from 'next/cache';
import { getViolationsForUser } from '@/lib/violations-store';
import { getChannelStats, getMostViewedVideo } from '@/lib/services/youtube-service';

/**
 * Fetches dashboard data for a given user ID.
 * @returns An object containing analytics and activity data, or null if an error occurs.
 */
export async function getDashboardData(userEmail?: string): Promise<DashboardData | null> {
  noStore();
  if (!userEmail) return null;
  const dbUser = await getUserByEmail(userEmail);
  if (!dbUser) return null;

  try {
    if (!dbUser) {
        console.log(`User not found.`);
        return null;
    }
    
    let userAnalytics: UserAnalytics | null = null;
    const channelId = dbUser.youtubeChannel?.id || dbUser.youtubeChannelId;
    console.log('Dashboard data - User:', dbUser.email, 'Channel ID:', channelId, 'YouTube Channel:', dbUser.youtubeChannel);
    
    // Validate channel ID format
    if (channelId && !channelId.startsWith('UC')) {
      console.warn('Invalid channel ID format:', channelId, 'Expected format: UC...');
    }
    
    let stats: any = null;
    let mostViewed: any = null;
    let violations: Violation[] = [];
    
    // Always fetch violations first
    violations = await getViolationsForUser(dbUser.id);
    
    if (channelId) {
        try {
            console.log('🔄 Fetching YouTube data for channel:', channelId);
            
            // Fetch stats, mostViewed in parallel
            const [statsResult, mostViewedResult] = await Promise.all([
                getChannelStats(channelId),
                getMostViewedVideo(channelId),
            ]);
            
            stats = statsResult;
            mostViewed = mostViewedResult;
            console.log('✅ YouTube data fetched successfully:', { stats, mostViewed });
            
            if (stats) {
                userAnalytics = {
                    subscribers: stats.subscribers,
                    views: stats.views,
                    mostViewedVideo: {
                        title: mostViewed.title || 'No video data',
                        views: mostViewed.views || 0
                    },
                    dailyData: Array.from({ length: 15 }, (_, i) => {
                        const date = subDays(new Date(), 14 - i);
                        const progress = (i + 1) / 15;
                        const curve = Math.pow(progress, 1.2);
                        const dailyViews = Math.round((stats.views * curve - stats.views * Math.pow((i) / 15, 1.2)));
                        const dailySubscribers = Math.round((stats.subscribers * curve - stats.subscribers * Math.pow((i) / 15, 1.2)));
                        return {
                            date: format(date, 'yyyy-MM-dd'),
                            views: Math.max(0, dailyViews),
                            subscribers: Math.max(0, dailySubscribers),
                        };
                    }),
                };
                console.log('✅ User analytics created:', userAnalytics);
            } else {
                console.warn('⚠️ No stats returned from YouTube API');
            }
        } catch (error) {
            console.error("❌ Could not fetch YouTube analytics:", error);
            
            // Check if it's a quota exceeded error
            if (error.message && error.message.includes('quota')) {
                console.warn("⚠️ YouTube API quota exceeded. Using fallback data.");
                // Create fallback analytics data
                userAnalytics = {
                    subscribers: 0,
                    views: 0,
                    mostViewedVideo: {
                        title: 'Data unavailable (API quota exceeded)',
                        views: 0
                    },
                    dailyData: Array.from({ length: 15 }, (_, i) => {
                        const date = subDays(new Date(), 14 - i);
                        return {
                            date: format(date, 'yyyy-MM-dd'),
                            views: 0,
                            subscribers: 0,
                        };
                    }),
                };
            } else {
                console.warn("This might be due to an invalid API key or channel ID.");
                userAnalytics = null;
            }
        }
    } else {
        console.log('ℹ️ No YouTube channel ID found for user');
    }

    const activity = violations.slice(0, 5).map((violation: Violation) => {
      let status: string;
      let variant: 'destructive' | 'default' | 'secondary' | 'outline';
      switch (violation.status) {
          case 'pending_review': status = 'Action Required'; variant = 'destructive'; break;
          case 'action_taken': status = 'Reported'; variant = 'default'; break;
          case 'dismissed': status = 'Ignored'; variant = 'secondary'; break;
          default: status = 'Unknown'; variant = 'outline';
      }
      return {
          type: "Infringement Detected",
          details: `On ${violation.platform}: ${violation.matchedURL}`,
          status,
          date: new Date(violation.detectedAt).toISOString(),
          variant
      };
    });

    return { 
      analytics: userAnalytics, 
      activity: activity, 
      user: dbUser,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    if (dbUser) {
        return { analytics: null, activity: [], user: dbUser };
    }
    return null;
  }
}
