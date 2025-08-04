
'use client';

import * as React from 'react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useDashboardData } from '@/app/dashboard/dashboard-context';
import { useAdminProfile } from '@/app/admin/profile-context';
import { MobileNav } from '@/components/ui/mobile-nav';

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
    <header className="p-2 sm:p-3 md:p-4 border-b flex items-center gap-2 sm:gap-3 md:gap-4 sticky top-0 bg-background/95 backdrop-blur-sm z-10 transition-all duration-300">
      {/* Mobile Navigation - Only show on mobile */}
      <div className="lg:hidden">
        <MobileNav />
      </div>
      
      {/* Desktop Sidebar Trigger - Only show on desktop */}
      <div className="hidden lg:block">
        <SidebarTrigger className="touch-target" />
      </div>
      
      {/* Responsive Header Content */}
      {sidebarCollapsed ? (
        <div className="flex items-center gap-2 sm:gap-3 transition-all duration-300">
          <Avatar className={`h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 transition-all duration-300 ${showGlow ? 'profile-glow' : ''}`}> 
            <AvatarImage src={avatar} alt={displayName} loading="eager" />
            <AvatarFallback className="text-xs sm:text-sm md:text-base">{avatarFallback}</AvatarFallback>
          </Avatar>
          <span className="text-xs sm:text-sm md:text-base font-medium truncate max-w-[120px] sm:max-w-[150px] md:max-w-[200px]">
            {displayName}
          </span>
        </div>
      ) : (
        <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-medium transition-all duration-300 truncate max-w-[200px] sm:max-w-[300px] md:max-w-none">
          {title || (admin ? 'Admin Dashboard' : 'Creator Dashboard')}
        </h1>
      )}
      
      {/* Spacer */}
      <div className="flex-1" />
      
      {/* Responsive Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sign Out Button - Responsive */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="hidden sm:flex items-center gap-2 text-xs sm:text-sm touch-target"
        >
          <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden md:inline">Sign Out</span>
        </Button>
        
        {/* Mobile Sign Out Icon */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="sm:hidden touch-target"
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
