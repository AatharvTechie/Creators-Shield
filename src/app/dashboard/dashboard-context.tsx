
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserAnalytics } from '@/lib/types';
import { checkFeatureAccess, getFeatureLimit, canAccessDashboardFeature, checkUsageLimit, getUpgradeSuggestion, UsageStats } from '@/lib/plan-features';

interface DashboardData {
  user: User | null;
  analytics: UserAnalytics | null;
  activity: any[];
  isLoading: boolean;
  error: string | null;
  usageStats: UsageStats;
  platformStatus: any;
  planFeatures: {
    canAccessFeature: (feature: string) => boolean;
    getFeatureLimit: (feature: string) => number | 'unlimited';
    isUnlimited: (feature: string) => boolean;
    checkUsageLimits: () => any;
    getUpgradeSuggestion: () => string | null;
  };
  refresh: () => void;
  loading: boolean;
  autoConnecting: boolean;
}

const DashboardContext = createContext<DashboardData | undefined>(undefined);

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [autoConnecting, setAutoConnecting] = useState(false);
  const [platformStatus, setPlatformStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-connect existing channels
  const autoConnectExistingChannel = async (userData: any, token: string) => {
    if (!userData?.youtubeChannelId || !userData?.youtubeChannel) {
      return false;
    }

    try {
      setAutoConnecting(true);
      console.log('🔄 Auto-connecting existing channel:', userData.youtubeChannelId);

      // Check if channel is already connected in platform status
      const platformResponse = await fetch('/api/platform/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (platformResponse.ok) {
        const platformData = await platformResponse.json();
        const existingConnection = platformData.data?.platforms?.find(
          (p: any) => p.platform === 'youtube' && p.status === 'connected'
        );

        if (existingConnection) {
          console.log('✅ Channel already connected in platform status');
          return true;
        }
      }

      // Auto-connect the channel
      const connectResponse = await fetch('/api/platform/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          platform: 'youtube',
          accountId: userData.youtubeChannelId
        })
      });

      if (connectResponse.ok) {
        console.log('✅ Channel auto-connected successfully');
        return true;
      } else {
        console.log('❌ Failed to auto-connect channel');
        return false;
      }
    } catch (error) {
      console.error('Error auto-connecting channel:', error);
      return false;
    } finally {
      setAutoConnecting(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if we're in the browser
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('creator_jwt');
        const userEmail = localStorage.getItem('user_email');
        
        console.log('🔍 Dashboard context - Token:', token ? 'Present' : 'Missing');
        console.log('🔍 Dashboard context - Email:', userEmail);
        
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }
        
        if (!userEmail) {
          setError('User email not found');
          setLoading(false);
          return;
        }
        
        // Try to fetch dashboard data first
        try {
          const dashboardResponse = await fetch(`/api/dashboard/data?email=${encodeURIComponent(userEmail)}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (dashboardResponse.ok) {
            const dashboardData = await dashboardResponse.json();
            console.log('✅ Dashboard data fetched successfully:', dashboardData);
            
            setUser(dashboardData.user);
            setAnalytics(dashboardData.analytics);
            setActivity(dashboardData.activity || []);
            
            // Update usage stats based on user data
            const userData = dashboardData.user;
            setUsageStats({
              youtubeChannels: userData?.youtubeChannelId ? 1 : 0,
              videosMonitored: 0, // You can update this based on actual data
              violationDetections: 0, // You can update this based on actual data
              dmcaRequests: 0, // You can update this based on actual data
              platformsConnected: userData?.platformsConnected?.length || 0
            });

            // Auto-connect existing channel if found
            if (userData?.youtubeChannelId && userData?.youtubeChannel) {
              await autoConnectExistingChannel(userData, token);
            }

            // Fetch platform status
            try {
              const platformResponse = await fetch('/api/platform/status', {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (platformResponse.ok) {
                const platformData = await platformResponse.json();
                setPlatformStatus(platformData.data);
              }
            } catch (platformError) {
              console.error('Error fetching platform status:', platformError);
            }

          } else {
            console.error('Failed to fetch dashboard data:', dashboardResponse.status);
            setError('Failed to load dashboard data');
          }
        } catch (fetchError) {
          console.error('Error fetching dashboard data:', fetchError);
          setError('Failed to load dashboard data');
        }
      } catch (error) {
        console.error('Dashboard context error:', error);
        setError('Failed to initialize dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const planFeatures = {
    canAccessFeature: (feature: string) => canAccessDashboardFeature(user?.plan || 'free', feature),
    getFeatureLimit: (feature: string) => getFeatureLimit(user?.plan || 'free', feature as any),
    isUnlimited: (feature: string) => {
      const limit = getFeatureLimit(user?.plan || 'free', feature as any);
      return limit === 'unlimited';
    },
    checkUsageLimits: () => checkUsageLimit(user?.plan || 'free', usageStats),
    getUpgradeSuggestion: () => getUpgradeSuggestion(user?.plan || 'free', usageStats)
  };

  const refresh = () => {
    setLoading(true);
    setError(null);
    // Re-fetch data
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('creator_jwt');
        const userEmail = localStorage.getItem('user_email');
        
        if (!token || !userEmail) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        const dashboardResponse = await fetch(`/api/dashboard/data?email=${encodeURIComponent(userEmail)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          setUser(dashboardData.user);
          setAnalytics(dashboardData.analytics);
          setActivity(dashboardData.activity || []);
          
          const userData = dashboardData.user;
          setUsageStats({
            youtubeChannels: userData?.youtubeChannelId ? 1 : 0,
            videosMonitored: 0,
            violationDetections: 0,
            dmcaRequests: 0,
            platformsConnected: userData?.platformsConnected?.length || 0
          });

          // Auto-connect existing channel if found
          if (userData?.youtubeChannelId && userData?.youtubeChannel) {
            await autoConnectExistingChannel(userData, token);
          }

          // Fetch platform status
          try {
            const platformResponse = await fetch('/api/platform/status', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (platformResponse.ok) {
              const platformData = await platformResponse.json();
              setPlatformStatus(platformData.data);
            }
          } catch (platformError) {
            console.error('Error fetching platform status:', platformError);
          }
        }
      } catch (error) {
        console.error('Error refreshing dashboard:', error);
        setError('Failed to refresh dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  };

  const value: DashboardData = {
    user,
    analytics,
    activity,
    isLoading: loading,
    error,
    usageStats,
    platformStatus,
    planFeatures,
    refresh,
    loading,
    autoConnecting
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardData must be used within a DashboardDataProvider');
  }
  return context;
}

export function useDashboardRefresh() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardRefresh must be used within a DashboardDataProvider');
  }
  return context.refresh;
}

export function useDashboardLoading() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardLoading must be used within a DashboardDataProvider');
  }
  return context.loading;
}
