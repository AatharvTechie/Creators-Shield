
'use client';

import { useDashboardData } from '../dashboard-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  Users, 
  Zap,
  Crown,
  Lock,
  ArrowUpRight,
  FileText,
  Eye,
  Video,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatNumber } from '@/lib/auth-utils';

interface YouTubeData {
  subscribers: number;
  views: number;
  mostViewedVideo: {
    title: string;
    views: number;
  };
}

export default function OverviewPage() {
  const { user, usageStats, planFeatures, platformStatus } = useDashboardData();
  const [youtubeData, setYoutubeData] = useState<YouTubeData | null>(null);
  const [loading, setLoading] = useState(false);
  
  const hasYouTubeChannel = user?.youtubeChannel && user.youtubeChannel.id;
  const activePlatform = platformStatus?.activePlatform;

  // Fetch YouTube data when channel is available
  useEffect(() => {
    const fetchYouTubeData = async () => {
      if (!hasYouTubeChannel || !user?.email) return;
      
      setLoading(true);
      try {
        const channelId = user.youtubeChannel?.id || user.youtubeChannelId;
        if (!channelId) return;

        const response = await fetch(`/api/dashboard/data?email=${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.analytics) {
            setYoutubeData({
              subscribers: data.analytics.subscribers,
              views: data.analytics.views,
              mostViewedVideo: {
                title: data.analytics.mostViewedVideo?.title || 'N/A',
                views: typeof data.analytics.mostViewedVideo?.views === 'number' 
                  ? data.analytics.mostViewedVideo.views 
                  : 0
              }
            });
          }
        }
      } catch (error) {
        console.error('Error fetching YouTube data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchYouTubeData();
  }, [hasYouTubeChannel, user?.email, user?.youtubeChannel?.id, user?.youtubeChannelId]);
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
            </div>
        </div>
    );
}

  const userPlan = user.plan || 'free';
  const limits = planFeatures.checkUsageLimits();
  const upgradeSuggestion = planFeatures.getUpgradeSuggestion();

  // Calculate usage percentages
  const youtubeChannelUsage = planFeatures.isUnlimited('maxYouTubeChannels') ? 0 : 
    (usageStats.youtubeChannels / planFeatures.getFeatureLimit('maxYouTubeChannels')) * 100;
  
  const videoUsage = planFeatures.isUnlimited('maxVideosToMonitor') ? 0 : 
    (usageStats.videosMonitored / planFeatures.getFeatureLimit('maxVideosToMonitor')) * 100;
  
  const violationUsage = planFeatures.isUnlimited('maxViolationDetections') ? 0 : 
    (usageStats.violationDetections / planFeatures.getFeatureLimit('maxViolationDetections')) * 100;
  
  const dmcaUsage = planFeatures.isUnlimited('maxDmcaRequests') ? 0 : 
    (usageStats.dmcaRequests / planFeatures.getFeatureLimit('maxDmcaRequests')) * 100;

    return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-gray-400">Welcome back, {user.name || user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={userPlan === 'yearly' ? 'default' : userPlan === 'monthly' ? 'secondary' : 'outline'}>
            {userPlan === 'free' && <Crown className="w-3 h-3 mr-1" />}
            {userPlan === 'monthly' && <BarChart3 className="w-3 h-3 mr-1" />}
            {userPlan === 'yearly' && <Zap className="w-3 h-3 mr-1" />}
            {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan
          </Badge>
          <Link href="/plans">
            <Button variant="outline" size="sm">
              Upgrade
              <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Upgrade Warning */}
      {upgradeSuggestion && (
        <Card className="border-yellow-500/30 bg-yellow-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-300">
              <AlertTriangle className="w-5 h-5" />
              Usage Limit Reached
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">{upgradeSuggestion}</p>
            <Link href="/plans">
              <Button className="bg-yellow-600 hover:bg-yellow-700">
                Upgrade Plan
              </Button>
            </Link>
          </CardContent>
      </Card>
      )}

      {/* Platform Stats - Show real data when connected (3 cards) */}
      {activePlatform ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary Metric */}
          <Card className="bg-white/5 border-gray-600/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                {activePlatform === 'youtube' ? 'Total Subscribers' : activePlatform === 'instagram' ? 'Total Followers' : 'Total Subscribers'}
              </CardTitle>
              <Users className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? (
                  <div className="animate-pulse bg-gray-600 h-8 w-20 rounded"></div>
                ) : activePlatform === 'youtube' && youtubeData ? 
                  formatNumber(youtubeData.subscribers) : 
                  activePlatform === 'instagram' && platformStatus?.platforms?.find(p => p.platform === 'instagram')?.data?.followers ?
                  formatNumber(platformStatus.platforms.find(p => p.platform === 'instagram').data.followers) :
                  'N/A'
                }
              </div>
              <p className="text-xs text-gray-400">
                {activePlatform === 'youtube' ? 'Channel subscribers' : activePlatform === 'instagram' ? 'Instagram followers' : 'Platform metric'}
              </p>
            </CardContent>
          </Card>

          {/* Secondary Metric */}
          <Card className="bg-white/5 border-gray-600/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                {activePlatform === 'youtube' ? 'Total Views' : activePlatform === 'instagram' ? 'Total Posts' : 'Total Views'}
              </CardTitle>
              <Eye className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? (
                  <div className="animate-pulse bg-gray-600 h-8 w-20 rounded"></div>
                ) : activePlatform === 'youtube' && youtubeData ? 
                  formatNumber(youtubeData.views) : 
                  activePlatform === 'instagram' && platformStatus?.platforms?.find(p => p.platform === 'instagram')?.data?.posts ?
                  formatNumber(platformStatus.platforms.find(p => p.platform === 'instagram').data.posts) :
                  'N/A'
                }
              </div>
              <p className="text-xs text-gray-400">
                {activePlatform === 'youtube' ? 'Lifetime views' : activePlatform === 'instagram' ? 'Total posts' : 'Platform metric'}
              </p>
            </CardContent>
          </Card>

          {/* Third Metric */}
          <Card className="bg-white/5 border-gray-600/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                {activePlatform === 'youtube' ? 'Most Viewed Video' : activePlatform === 'instagram' ? 'Most Liked Post' : 'Most Viewed Video'}
              </CardTitle>
              <Video className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-white truncate">
                {loading ? (
                  <div className="animate-pulse bg-gray-600 h-6 w-32 rounded"></div>
                ) : activePlatform === 'youtube' && youtubeData ? 
                  youtubeData.mostViewedVideo.title : 
                  activePlatform === 'instagram' ? 'Instagram Post' :
                  'N/A'
                }
              </div>
              <p className="text-xs text-gray-400">
                {loading ? (
                  <div className="animate-pulse bg-gray-600 h-3 w-16 rounded mt-1"></div>
                ) : activePlatform === 'youtube' && youtubeData ? 
                  `${formatNumber(youtubeData.mostViewedVideo.views)} views` : 
                  activePlatform === 'instagram' && platformStatus?.platforms?.find(p => p.platform === 'instagram')?.data?.totalLikes ?
                  `${formatNumber(platformStatus.platforms.find(p => p.platform === 'instagram').data.totalLikes)} likes` :
                  'No data'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Show connection prompt when no platform connected */
        <Card className="border-blue-500/30 bg-blue-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-300">
              <Video className="w-5 h-5" />
              Connect Your Platform
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              Connect your social media platform to see real-time analytics and platform statistics.
            </p>
            <Link href="/dashboard/integrations">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Connect Platform
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Creator Statistics (4 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Connected Channels */}
        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Connected Channels</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{usageStats.youtubeChannels}</div>
            <p className="text-xs text-gray-400">YouTube channels connected</p>
          </CardContent>
        </Card>

        {/* Videos Monitored */}
        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Videos Monitored</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{usageStats.videosMonitored}</div>
            <p className="text-xs text-gray-400">Videos being monitored</p>
          </CardContent>
        </Card>

        {/* Violations Detected */}
        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Violations Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{usageStats.violationDetections}</div>
            <p className="text-xs text-gray-400">Copyright violations found</p>
          </CardContent>
        </Card>

        {/* DMCA Reports */}
        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">DMCA Reports</CardTitle>
            <FileText className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{usageStats.dmcaRequests}</div>
            <p className="text-xs text-gray-400">Reports generated</p>
          </CardContent>
        </Card>
      </div>
                </div>
  );
}
