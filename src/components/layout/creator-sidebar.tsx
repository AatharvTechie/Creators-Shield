
'use client';

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useDashboardData } from "@/app/dashboard/dashboard-context";
import { useYouTube } from "@/context/youtube-context";
import {
  Home, 
  Activity, 
  BarChart, 
  FileVideo, 
  ScanSearch, 
  ShieldAlert, 
  FileText, 
  Settings, 
  MessageSquare,
  Crown,
  Lock,
  Link2
} from "lucide-react";

const NextLink = Link;

export function CreatorSidebar() {
  const pathname = usePathname();
  const { isYouTubeConnected } = useYouTube();
  const dashboardData = useDashboardData();
  const [hasUnread, setHasUnread] = React.useState(false);
  const router = useRouter();

  const user = dashboardData?.user;
  const creatorName = user?.youtubeChannel?.title || user?.displayName || user?.name || 'Creator';
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

  // Sidebar menu items in the specified pattern
  const menuItems = [
    { 
      href: '/dashboard/overview', 
      label: 'Overview', 
      icon: Home, 
      requiresConnection: false
    },
    { 
      href: '/dashboard/activity', 
      label: 'Activity Feed', 
      icon: Activity,
      requiresConnection: false
    },
    { 
      href: '/dashboard/analytics', 
      label: 'Analytics', 
      icon: BarChart, 
      requiresConnection: true
    },
    { 
      href: '/dashboard/content', 
      label: 'My Content', 
      icon: FileVideo, 
      requiresConnection: false
    },
    { 
      href: '/dashboard/monitoring', 
      label: 'Web Monitoring', 
      icon: ScanSearch, 
      requiresConnection: true
    },
    { 
      href: '/dashboard/violations', 
      label: 'Violations', 
      icon: ShieldAlert, 
      requiresConnection: true
    },
    { 
      href: '/dashboard/reports', 
      label: 'Submit Report', 
      icon: FileText, 
      requiresConnection: false
    },
    { 
      href: '/dashboard/feedback', 
      label: 'Feedback & Support', 
      icon: MessageSquare, 
      requiresConnection: false
    },
    { 
      href: '/dashboard/integrations', 
      label: 'Integrations', 
      icon: Link2, 
      requiresConnection: false
    }
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
  
  const userPlan = user?.plan || 'free';
  
  // Check if user can access features that require YouTube connection
  const canAccessYouTubeFeatures = isYouTubeConnected;
  
  return (
    <Sidebar className="w-full sm:w-64 lg:w-72">
      <SidebarHeader className="p-2 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
            <NextLink href="/dashboard/settings" className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                    <AvatarImage src={avatar} data-ai-hint="profile picture" />
                    <AvatarFallback className="text-xs sm:text-sm">{avatarFallback}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold text-sidebar-foreground truncate text-sm sm:text-base">{creatorName}</span>
                    <span className="text-xs text-sidebar-foreground/70 hidden sm:block">Creator Dashboard</span>
                    {/* Plan Badge */}
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant={userPlan === 'yearly' ? 'default' : userPlan === 'monthly' ? 'secondary' : 'outline'} className="text-xs">
                        {userPlan === 'free' && <Crown className="w-3 h-3 mr-1" />}
                        {userPlan === 'monthly' && <BarChart className="w-3 h-3 mr-1" />}
                        {userPlan === 'yearly' && <BarChart className="w-3 h-3 mr-1" />}
                        <span className="hidden sm:inline">{userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan</span>
                        <span className="sm:hidden">{userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}</span>
                      </Badge>
                    </div>
                </div>
            </NextLink>
        </div>
      </SidebarHeader>
      <SidebarContent className="sidebar-scrollbar px-2 sm:px-4">
        <SidebarMenu className="gap-2 sm:gap-4">
          {/* Main Menu Items */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isDisabled = item.requiresConnection && !canAccessYouTubeFeatures;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive} disabled={isDisabled} className="text-sm sm:text-base">
                  <NextLink href={isDisabled ? '#' : item.href} className="flex items-center gap-2 sm:gap-3 py-2 sm:py-3">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {isDisabled && <Lock className="h-3 w-3 ml-auto text-muted-foreground flex-shrink-0" />}
                    {item.href === '/dashboard/feedback' && hasUnread && (
                      <Badge variant="destructive" className="ml-auto h-2 w-2 rounded-full p-0 flex-shrink-0" />
                    )}
                  </NextLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-gray-700 p-2 sm:p-4">
        <SidebarMenuButton asChild className="text-sm sm:text-base">
          <NextLink href="/dashboard/settings" className="flex items-center gap-2 sm:gap-3 py-2 sm:py-3">
            <Settings className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Settings</span>
          </NextLink>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
