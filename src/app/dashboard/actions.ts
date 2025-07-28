
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
    if (channelId) {
        try {
        // Fetch stats, mostViewed, and violations in parallel
        const [statsResult, mostViewedResult, violationsResult] = await Promise.all([
          getChannelStats(channelId),
          getMostViewedVideo(channelId),
          getViolationsForUser(dbUser.id),
        ]);
        stats = statsResult;
        mostViewed = mostViewedResult;
        violations = violationsResult;
        console.log('Dashboard data results:', { stats, mostViewed, violations });
            if (stats) {
                userAnalytics = {
                    subscribers: stats.subscribers,
                    views: stats.views,
                    mostViewedVideo: {
                        title: mostViewed.title || undefined,
                        views: mostViewed.views
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
                }
            console.log('User analytics created:', userAnalytics);
            }
        } catch (error) {
            console.warn("Could not fetch YouTube analytics. This might be due to an invalid API key or channel ID.", error);
            userAnalytics = null;
        }
    } else {
      // If no channel, still fetch violations
      violations = await getViolationsForUser(dbUser.id);
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
      user: JSON.parse(JSON.stringify(dbUser)),
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    if (dbUser) {
        return { analytics: null, activity: [], user: JSON.parse(JSON.stringify(dbUser)) };
    }
    return null;
  }
}
