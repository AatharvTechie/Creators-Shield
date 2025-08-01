
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserAnalytics } from '@/lib/types';
import { hasFeatureAccess, getFeatureLimit, isUnlimited, canAccessDashboardFeature, checkUsageLimit, getUpgradeSuggestion, UsageStats } from '@/lib/plan-features';

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
    getFeatureLimit: (feature: string) => number;
    isUnlimited: (feature: string) => boolean;
    checkUsageLimits: () => any;
    getUpgradeSuggestion: () => string | null;
  };
  refresh: () => void;
  loading: boolean;
}

const DashboardContext = createContext<DashboardData | undefined>(undefined);

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [platformStatus, setPlatformStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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

        // Create session for device tracking when dashboard loads
        try {
          const userAgent = navigator.userAgent;
          const device = getDeviceInfo(userAgent);
          
          await fetch('/api/auth/create-session', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userAgent,
              device
            })
          });
          console.log('✅ Session created for device tracking');
        } catch (sessionError) {
          console.log('⚠️ Session creation failed:', sessionError);
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
              console.log('⚠️ Platform status fetch failed:', platformError);
            }
          } else {
            console.log('⚠️ Dashboard data fetch failed, trying fallback method');
            throw new Error('Dashboard data fetch failed');
          }
        } catch (dashboardError) {
          console.log('🔄 Using fallback method for data fetching');
          
          // Fallback to old method if dashboard data fails
        const response = await fetch(`/api/get-user?email=${encodeURIComponent(userEmail)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Get user API failed:', response.status, errorText);
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
          console.log('✅ User data fetched:', data);
          
        if (data._id) {
          setUser(data);
        
            // Try to fetch usage statistics
            try {
          const usageResponse = await fetch('/api/dashboard/usage-stats', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (usageResponse.ok) {
            const usageData = await usageResponse.json();
                console.log('✅ Usage stats fetched:', usageData);
            setUsageStats(usageData.stats || {
                  youtubeChannels: data.youtubeChannelId ? 1 : 0,
                  videosMonitored: 0,
                  violationDetections: 0,
                  dmcaRequests: 0,
                  platformsConnected: data.platformsConnected?.length || 0
                });
              } else {
                console.log('⚠️ Usage stats fetch failed, using defaults');
                setUsageStats({
                  youtubeChannels: data.youtubeChannelId ? 1 : 0,
                  videosMonitored: 0,
                  violationDetections: 0,
                  dmcaRequests: 0,
                  platformsConnected: data.platformsConnected?.length || 0
                });
              }
            } catch (usageError) {
              console.log('⚠️ Usage stats error, using defaults:', usageError);
              setUsageStats({
              youtubeChannels: data.youtubeChannelId ? 1 : 0,
              videosMonitored: 0,
              violationDetections: 0,
              dmcaRequests: 0,
              platformsConnected: data.platformsConnected?.length || 0
            });
          }
        } else {
          setError('Failed to load user data');
          }
        }
      } catch (err) {
        console.error('❌ Dashboard context error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Helper function to get device information
  const getDeviceInfo = (userAgent: string) => {
    if (userAgent.includes('Mobile')) {
      if (userAgent.includes('Android')) return 'Android Mobile';
      if (userAgent.includes('iPhone')) return 'iPhone';
      if (userAgent.includes('iPad')) return 'iPad';
      return 'Mobile Device';
    }
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux PC';
    return 'Desktop';
  };

  const planFeatures = {
    canAccessFeature: (feature: string) => {
      // All features are available for all plans
      return true;
    },
    getFeatureLimit: (feature: string) => {
      // All features have unlimited limits
      return -1;
    },
    isUnlimited: (feature: string) => {
      // All features are unlimited
      return true;
    },
    checkUsageLimits: () => {
      // All usage limits are unlimited
      return {
        canAddYouTubeChannel: true,
        canAddVideo: true,
        canDetectViolation: true,
        canSubmitDmca: true,
        canAddPlatform: true
      };
    },
    getUpgradeSuggestion: () => {
      // No upgrade suggestions needed since all features are available
      return null;
    }
  };

  const refresh = () => {
    // Trigger a refresh by refetching user data
    setLoading(true);
    setError(null);
    // This will trigger the useEffect to refetch data
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
    loading: loading
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
