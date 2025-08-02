
'use client';

import * as React from 'react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useDashboardData } from '@/app/dashboard/dashboard-context';
import { useAdminProfile } from '@/app/admin/profile-context';

export function DashboardHeader({ title, admin = false }: { title?: string, admin?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const dashboardData = useDashboardData();
  const user = dashboardData?.user;
  let displayName = '';
  let avatar = '';
  let avatarFallback = '';
  if (admin) {
    const { profile } = useAdminProfile();
    displayName = profile.displayName;
    avatar = profile.avatar;
    avatarFallback = displayName ? displayName.charAt(0) : 'A';
  } else {
    displayName = user?.youtubeChannel?.title || user?.displayName || user?.name || 'Creator';
    avatar = user?.youtubeChannel?.thumbnail || user?.avatar || '';
    avatarFallback = displayName ? displayName.charAt(0) : 'C';
  }

  let sidebarCollapsed = false;
  try {
    const sidebar = useSidebar();
    sidebarCollapsed = sidebar.state === 'collapsed';
  } catch {}

  // Profile Glow Logic
  const [showGlow, setShowGlow] = React.useState(false);
  React.useEffect(() => {
    if (avatar && !localStorage.getItem('profileGlowShown')) {
      setShowGlow(true);
      setTimeout(() => {
        setShowGlow(false);
        localStorage.setItem('profileGlowShown', 'true');
      }, 1200); // match animation duration
    }
  }, [avatar]);

  const handleSignOut = async () => {
    try {
      // Call logout API to clear cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('creator_jwt');
        localStorage.removeItem('admin_jwt');
      }
      
      // Redirect to login
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if API call fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('creator_jwt');
        localStorage.removeItem('admin_jwt');
      }
      router.push('/auth/login');
    }
  };

  return (
    <header className="p-2 border-b flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur-sm z-10 transition-all duration-300">
      <SidebarTrigger />
      {sidebarCollapsed ? (
        <div className="flex items-center gap-2 transition-all duration-300">
          <Avatar className={`h-6 w-6 transition-all duration-300 ${showGlow ? 'profile-glow' : ''}`}> 
            <AvatarImage src={avatar} alt={displayName} loading="eager" />
            <AvatarFallback className="text-xs">{avatarFallback}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{displayName}</span>
        </div>
      ) : (
        <h1 className="text-base font-medium transition-all duration-300">{title || (admin ? 'Admin Dashboard' : 'Creator Dashboard')}</h1>
      )}
      <div className="flex-1" />
    </header>
  );
}
