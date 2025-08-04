
'use client';

import { useDashboardData } from '../dashboard-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdvancedLoader, DataLoader } from '@/components/ui/advanced-loader';

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
      
      // Check if data is already loaded
      if (youtubeData && !loading) {
        console.log('✅ YouTube data already loaded, skipping fetch');
        return;
      }
      
      setLoading(true);
      try {
        const channelId = user.youtubeChannel?.id || user.youtubeChannelId;
        if (!channelId) return;

                 const token = localStorage.getItem('creator_jwt');
         const response = await fetch(`/api/dashboard/data?email=${encodeURIComponent(user.email)}`, {
           headers: {
             'Authorization': `Bearer ${token}`,
             'Content-Type': 'application/json'
           }
         });
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
       
       console.log('YouTube data fetch completed. Data:', youtubeData);
    };

    fetchYouTubeData();
  }, [hasYouTubeChannel, user?.email, user?.youtubeChannel?.id, user?.youtubeChannelId, youtubeData, loading]);
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <DataLoader 
          size="lg"
          text="Loading your dashboard..."
          subtext="Preparing your workspace and data"
          showProgress={true}
          progress={75}
        />
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
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 lg:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-white">Dashboard Overview</h1>
          <p className="text-xs text-gray-400">Welcome back, {user.name || user.email}</p>
        </div>
        <div className="flex items-center gap-2">
                     <Badge variant={userPlan === 'yearly' ? 'default' : userPlan === 'monthly' ? 'secondary' : 'outline'} className="text-xs px-2 py-1">
             {userPlan === 'free' && <Crown className="w-2 h-2 mr-1" />}
             {userPlan === 'monthly' && <BarChart3 className="w-2 h-2 mr-1" />}
             {userPlan === 'yearly' && <Zap className="w-2 h-2 mr-1" />}
             <span className="hidden sm:inline text-xs">{userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan</span>
             <span className="sm:hidden text-xs">{userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}</span>
           </Badge>
           <Link href="/plans">
             <Button variant="outline" size="sm" className="text-xs px-2 py-1">
               <span className="hidden sm:inline">Upgrade</span>
               <span className="sm:hidden">Up</span>
               <ArrowUpRight className="w-2 h-2 ml-1" />
             </Button>
           </Link>
        </div>
      </div>

      {/* Upgrade Warning */}
      {upgradeSuggestion && (
        <Card className="border-yellow-500/30 bg-yellow-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-300 text-sm">
              <AlertTriangle className="w-4 h-4" />
              Usage Limit Reached
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-300 mb-3">{upgradeSuggestion}</p>
            <Link href="/plans">
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-xs">
                Upgrade Plan
              </Button>
            </Link>
          </CardContent>
      </Card>
      )}

      {/* Platform Stats - Show real data when connected (3 cards) */}
      {activePlatform ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Primary Metric */}
          <Card className="bg-white/5 border-gray-600/30 hover:bg-white/10 transition-colors duration-200 p-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-xs font-medium text-gray-300">
                {activePlatform === 'youtube' ? 'Total Subscribers' : activePlatform === 'instagram' ? 'Total Followers' : 'Total Subscribers'}
              </CardTitle>
              <Users className="h-3 w-3 text-green-400" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg font-semibold text-white">
                {loading ? (
                  <div className="animate-pulse bg-gray-600 h-5 w-14 rounded"></div>
                ) : activePlatform === 'youtube' && youtubeData ? 
                  (youtubeData.subscribers === 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">API Quota Exceeded</span>
                      <Badge variant="outline" className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        Limited
                      </Badge>
                    </div>
                  ) : formatNumber(youtubeData.subscribers)) : 
                  activePlatform === 'instagram' && platformStatus?.platforms?.find(p => p.platform === 'instagram')?.data?.followers ?
                  formatNumber(platformStatus.platforms.find(p => p.platform === 'instagram').data.followers) :
                  'N/A'
                }
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {activePlatform === 'youtube' ? 'Channel subscribers' : activePlatform === 'instagram' ? 'Instagram followers' : 'Platform metric'}
              </p>
            </CardContent>
          </Card>

                     {/* Secondary Metric */}
           <Card className="bg-white/5 border-gray-600/30 hover:bg-white/10 transition-colors duration-200 p-5">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-xs font-medium text-gray-300">
                {activePlatform === 'youtube' ? 'Total Views' : activePlatform === 'instagram' ? 'Total Posts' : 'Total Views'}
              </CardTitle>
              <Eye className="h-3 w-3 text-blue-400" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg font-semibold text-white">
                {loading ? (
                  <div className="animate-pulse bg-gray-600 h-5 w-14 rounded"></div>
                ) : activePlatform === 'youtube' && youtubeData ? 
                  formatNumber(youtubeData.views) : 
                  activePlatform === 'instagram' && platformStatus?.platforms?.find((p: any) => p.platform === 'instagram')?.data?.posts ?
                  formatNumber(platformStatus.platforms.find((p: any) => p.platform === 'instagram')?.data?.posts) :
                  'N/A'
                }
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {activePlatform === 'youtube' ? 'Lifetime views' : activePlatform === 'instagram' ? 'Total posts' : 'Platform metric'}
              </p>
            </CardContent>
          </Card>

                     {/* Third Metric */}
           <Card className="bg-white/5 border-gray-600/30 hover:bg-white/10 transition-colors duration-200 p-5">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-xs font-medium text-gray-300">
                {activePlatform === 'youtube' ? 'Most Viewed Video' : activePlatform === 'instagram' ? 'Most Liked Post' : 'Most Viewed Video'}
              </CardTitle>
              <Video className="h-3 w-3 text-yellow-400" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs font-medium text-white truncate">
                {loading ? (
                  <div className="animate-pulse bg-gray-600 h-3 w-20 rounded"></div>
                ) : activePlatform === 'youtube' && youtubeData ? 
                  youtubeData.mostViewedVideo.title : 
                  activePlatform === 'instagram' ? 'Instagram Post' :
                  'N/A'
                }
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {loading ? (
                  <div className="animate-pulse bg-gray-600 h-2.5 w-10 rounded"></div>
                ) : activePlatform === 'youtube' && youtubeData ? 
                  `${formatNumber(youtubeData.mostViewedVideo.views)} views` : 
                  activePlatform === 'instagram' && platformStatus?.platforms?.find((p: any) => p.platform === 'instagram')?.data?.totalLikes ?
                  `${formatNumber(platformStatus.platforms.find((p: any) => p.platform === 'instagram')?.data?.totalLikes)} likes` :
                  'No data'
                }
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Show connection prompt when no platform connected */
        <Card className="border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/15 transition-colors duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-300 text-sm">
              <Video className="w-4 h-4" />
              Connect Your Platform
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-300 mb-3">
              Connect your social media platform to see real-time analytics and platform statistics.
            </p>
            <Link href="/dashboard/integrations">
              <Button className="bg-blue-600 hover:bg-blue-700 text-xs">
                Connect Platform
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

             {/* Creator Statistics (4 cards) */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
                 {/* Connected Channels */}
         <Card className="bg-white/5 border-gray-600/30 hover:bg-white/10 transition-colors duration-200 p-5">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-medium text-gray-300">Connected Channels</CardTitle>
            <Users className="h-3 w-3 text-blue-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg font-semibold text-white">{usageStats.youtubeChannels}</div>
            <p className="text-xs text-gray-400 mt-0.5">YouTube channels connected</p>
          </CardContent>
        </Card>

                 {/* Videos Monitored */}
         <Card className="bg-white/5 border-gray-600/30 hover:bg-white/10 transition-colors duration-200 p-5">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-medium text-gray-300">Videos Monitored</CardTitle>
            <BarChart3 className="h-3 w-3 text-green-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg font-semibold text-white">{usageStats.videosMonitored}</div>
            <p className="text-xs text-gray-400 mt-0.5">Videos being monitored</p>
          </CardContent>
        </Card>

                 {/* Violations Detected */}
         <Card className="bg-white/5 border-gray-600/30 hover:bg-white/10 transition-colors duration-200 p-5">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-xs font-medium text-gray-300">Violations Detected</CardTitle>
            <AlertTriangle className="h-3 w-3 text-red-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg font-semibold text-white">{usageStats.violationDetections}</div>
            <p className="text-xs text-gray-400 mt-0.5">Copyright violations found</p>
          </CardContent>
        </Card>

                                   {/* DMCA Reports */}
          <Card className="bg-white/5 border-gray-600/30 hover:bg-white/10 transition-colors duration-200 p-5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
             <CardTitle className="text-xs font-medium text-gray-300">DMCA Reports</CardTitle>
             <FileText className="h-3 w-3 text-purple-400" />
           </CardHeader>
           <CardContent className="pt-0">
             <div className="text-lg font-semibold text-white">{usageStats.dmcaRequests}</div>
             <p className="text-xs text-gray-400 mt-0.5">Reports generated</p>
           </CardContent>
         </Card>
      </div>
                </div>
  );
}
