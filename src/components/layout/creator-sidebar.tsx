
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
  Link2,
  LogOut
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
         <Sidebar className="w-full sm:w-56 lg:w-60 xl:w-64">
       <SidebarHeader className="p-4 border-b border-gray-700/50">
         <div className="flex items-center gap-3">
             <NextLink href="/dashboard/settings" className="flex items-center gap-3 min-w-0 group hover:bg-sidebar-accent p-2 rounded-lg transition-colors duration-200">
                 <div className="relative">
                   <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-primary/20">
                       <AvatarImage src={avatar} data-ai-hint="profile picture" />
                       <AvatarFallback className="text-sm font-semibold">{avatarFallback}</AvatarFallback>
                   </Avatar>
                   {user?.youtubeChannel && (
                     <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                       <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                       </svg>
                     </div>
                   )}
                 </div>
                 <div className="flex flex-col min-w-0 flex-1 justify-center">
                     <span className="font-semibold text-sidebar-foreground truncate text-sm">{creatorName}</span>
                     <span className="text-xs text-muted-foreground truncate">Creator</span>
                 </div>
             </NextLink>
         </div>
       </SidebarHeader>
                           <SidebarContent className="sidebar-scrollbar px-3 mt-6">
          <SidebarMenu className="gap-3">
          {/* Main Menu Items */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isDisabled = item.requiresConnection && !canAccessYouTubeFeatures;

            return (
              <SidebarMenuItem key={item.href}>
                                 <SidebarMenuButton asChild isActive={isActive} disabled={isDisabled} className="text-xs transition-all duration-200 hover:bg-sidebar-accent hover:scale-105">
                                      <NextLink href={isDisabled ? '#' : item.href} className="flex items-center gap-3 py-3 px-4 rounded-lg">
                                          <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate text-sm font-medium">{item.label}</span>
                     {isDisabled && <Lock className="h-3 w-3 ml-auto text-muted-foreground flex-shrink-0" />}
                     {item.href === '/dashboard/feedback' && hasUnread && (
                       <Badge variant="destructive" className="ml-auto h-1.5 w-1.5 rounded-full p-0 flex-shrink-0" />
                     )}
                   </NextLink>
                 </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
                           <SidebarFooter className="border-t border-gray-700 p-2 mt-4">
          <SidebarMenuButton asChild className="text-xs transition-colors duration-200 hover:bg-sidebar-accent">
            <NextLink href="/dashboard/settings" className="flex items-center gap-2 py-2 px-2 rounded-md">
                           <Settings className="h-4 w-4 flex-shrink-0" />
               <span className="truncate text-sm">Settings</span>
            </NextLink>
          </SidebarMenuButton>
          <SidebarMenuButton asChild className="text-xs transition-colors duration-200 hover:bg-red-500/10 hover:text-red-400 mt-2">
            <button onClick={handleLogout} className="flex items-center gap-2 py-2 px-2 rounded-md w-full text-left">
                           <LogOut className="h-4 w-4 flex-shrink-0" />
               <span className="truncate text-sm">Logout</span>
            </button>
          </SidebarMenuButton>
        </SidebarFooter>
    </Sidebar>
  );
}
