
'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import type { DashboardData } from '@/lib/types';
import { getDashboardData } from './actions';
import { useYouTube } from '@/context/youtube-context';
import jwt from 'jsonwebtoken';

const DashboardContext = createContext<{
  data: DashboardData | null;
  refresh: () => Promise<void>;
  loading: boolean;
} | null>(null);

function getEmailFromJWT() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('creator_jwt');
  if (!token) return null;
  try {
    const decoded = jwt.decode(token);
    if (decoded && typeof decoded === 'object' && 'email' in decoded) {
      return (decoded as { email?: string }).email || null;
    }
    return null;
  } catch {
    return null;
  }
}

export function DashboardDataProvider({ children }: { children: ReactNode; }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false); // Start with false to avoid initial loader
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load separately

  const refresh = async () => {
    setLoading(true);
    try {
    const email = getEmailFromJWT();
    const freshData = await getDashboardData(email ?? undefined);
    setData(freshData);
      
      // Check if analytics data is loaded for users with YouTube channels
      if (freshData?.user?.youtubeChannelId && !freshData?.analytics) {
        console.log('Analytics data missing for user with channel, keeping loader active');
        // Keep loading state true if analytics is missing for users with channels
        return;
      }
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    // Load data on mount without showing loader initially
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const email = getEmailFromJWT();
        if (!email) {
          console.log('No email found in JWT, skipping initial data load');
          setLoading(false);
          setIsInitialLoad(false);
          return;
        }
        
        const initialData = await getDashboardData(email ?? undefined);
        setData(initialData);
        
        // Check if analytics data is loaded for users with YouTube channels
        if (initialData?.user?.youtubeChannelId && !initialData?.analytics) {
          console.log('Initial load: Analytics data missing for user with channel');
          // Keep loading state true if analytics is missing for users with channels
          return;
        }
      } catch (error) {
        console.error('Error loading initial dashboard data:', error);
        // Don't keep loading state true on error, just show empty state
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };
    loadInitialData();
  }, []);

  return (
    <DashboardContext.Provider value={{ data, refresh, loading: loading || isInitialLoad }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardContext);
  return context?.data;
}

export function useDashboardRefresh() {
  const context = useContext(DashboardContext);
  return context?.refresh;
}

export function useDashboardLoading() {
  const context = useContext(DashboardContext);
  return context?.loading;
}
