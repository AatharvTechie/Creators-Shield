
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScanSearch, FileText, Settings, FileVideo, ShieldAlert, Home, LogOut, BarChart, Activity, MessageSquareHeart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import React from 'react';
import { hasUnreadCreatorFeedback } from '@/lib/feedback-store';
import { useYouTube } from '@/context/youtube-context';
import { useDashboardData } from '@/app/dashboard/dashboard-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useSession } from "next-auth/react";

export function CreatorSidebar() {
  const pathname = usePathname();
  const { isYouTubeConnected } = useYouTube();
  const dashboardData = useDashboardData();
  const [hasUnread, setHasUnread] = React.useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const user = dashboardData?.user;
  const creatorName = user?.youtubeChannel?.title || user?.displayName || user?.name || 'Creator';
  // Prefer YouTube channel thumbnail, then avatar, then default
  const avatar = user?.youtubeChannel?.thumbnail || user?.avatar || "https://placehold.co/128x128.png";
  const avatarFallback = creatorName ? creatorName.charAt(0) : 'C';

  // New logout logic
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('creator_jwt');
        localStorage.removeItem('admin_jwt');
      }
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('creator_jwt');
        localStorage.removeItem('admin_jwt');
      }
      router.push('/auth/login');
    }
  };

  const menuItems = [
    { href: '/dashboard/overview', label: 'Overview', icon: Home, requiresConnection: false },
    { href: '/dashboard/activity', label: 'Activity Feed', icon: Activity, requiresConnection: false },
    { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart, requiresConnection: true },
    { href: '/dashboard/content', label: 'My Content', icon: FileVideo, requiresConnection: false },
    { href: '/dashboard/monitoring', label: 'Web Monitoring', icon: ScanSearch, requiresConnection: true },
    { href: '/dashboard/violations', label: 'Violations', icon: ShieldAlert, requiresConnection: true },
    { href: '/dashboard/reports', label: 'Submit Report', icon: FileText, requiresConnection: false },
    { href: '/dashboard/feedback', label: 'Send Feedback', icon: MessageSquareHeart, requiresConnection: false },
  ];

  React.useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    async function checkUnread() {
      if (user?.uid) {
        try {
          const res = await fetch(`/api/feedback/unread?role=creator&creatorId=${user.uid}`);
          const data = await res.json();
          setHasUnread(!!data.hasUnread);
        } catch {
          setHasUnread(false);
    }
      }
    }
    checkUnread();
    interval = setInterval(checkUnread, 10000); // poll every 10s
    return () => interval && clearInterval(interval);
  }, [user?.uid]);
  
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
            <NextLink href="/dashboard/settings" className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={avatar} data-ai-hint="profile picture" />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-semibold text-sidebar-foreground truncate">{creatorName}</span>
                    <span className="text-xs text-sidebar-foreground/70">Creator Dashboard</span>
                </div>
            </NextLink>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="gap-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (pathname === '/dashboard' && item.href === '/dashboard/overview');
            const isDisabled = item.requiresConnection && !isYouTubeConnected;

            return (
              <SidebarMenuItem 
                key={item.href}
                notification={item.href === '/dashboard/feedback' ? hasUnread : false}
              >
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.requiresConnection && !isYouTubeConnected ? `${item.label} (Requires YouTube Connection)` : item.label}
                  disabled={isDisabled}
                >
                  <NextLink href={item.href} prefetch={false} className={isDisabled ? "pointer-events-none pl-4 flex items-center gap-3" : "pl-4 flex items-center gap-3"}>
                    <item.icon />
                    {item.href === '/dashboard/feedback' && hasUnread && (
                      <span className="absolute -top-1 left-5 w-2 h-2 rounded-full bg-green-500 animate-pulse z-10" />
                    )}
                    <span>{item.label}</span>
                  </NextLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="gap-4">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/dashboard/settings'}
              tooltip="Settings"
            >
              <NextLink href="/dashboard/settings" prefetch={false} className="flex items-center gap-3">
                <Settings />
                <span>Settings</span>
              </NextLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="flex items-center gap-3 px-2 py-2 rounded-md text-destructive hover:text-red-400 transition text-sm font-medium focus:outline-none focus:ring-2 focus:ring-destructive/50"
              title="Sign out"
              style={{ minWidth: 0, background: 'none' }}
            >
              <LogOut className="w-5 h-5" />
              <span>Sign out</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
