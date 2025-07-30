
'use client';

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
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
  Users, 
  Zap,
  Crown,
  Lock
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

  // All menu items available for all plans
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
      href: '/dashboard/settings', 
      label: 'Settings', 
      icon: Settings, 
      requiresConnection: false
    },
    { 
      href: '/dashboard/team', 
      label: 'Team Management', 
      icon: Users, 
      requiresConnection: false
    },
    { 
      href: '/dashboard/integrations', 
      label: 'Integrations', 
      icon: Zap, 
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
  
  // All menu items are available for all plans
  const userPlan = user?.plan || 'free';
  const filteredMenuItems = menuItems; // No filtering needed

  // Check if user can access features that require YouTube connection
  const canAccessYouTubeFeatures = isYouTubeConnected; // All plans get all features
  
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
                    {/* Plan Badge */}
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant={userPlan === 'yearly' ? 'default' : userPlan === 'monthly' ? 'secondary' : 'outline'} className="text-xs">
                        {userPlan === 'free' && <Crown className="w-3 h-3 mr-1" />}
                        {userPlan === 'monthly' && <BarChart className="w-3 h-3 mr-1" />}
                        {userPlan === 'yearly' && <Zap className="w-3 h-3 mr-1" />}
                        {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan
                      </Badge>
                    </div>
                </div>
            </NextLink>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="gap-4">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isDisabled = item.requiresConnection && !canAccessYouTubeFeatures;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive} disabled={isDisabled}>
                  <NextLink href={isDisabled ? '#' : item.href} className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {isDisabled && <Lock className="h-3 w-3 ml-auto text-muted-foreground" />}
                    {item.href === '/dashboard/feedback' && hasUnread && (
                      <Badge variant="destructive" className="ml-auto h-2 w-2 rounded-full p-0" />
                    )}
                  </NextLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      
      {/* Removed plan section - will be shown as popup */}
    </Sidebar>
  );
}
