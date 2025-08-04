
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
import { Shield, Users, Gavel, Settings, UserCheck, BarChart, MessageSquareQuote, PieChart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import { hasUnrepliedAdminFeedback } from '@/lib/feedback-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAdminProfile } from '@/app/admin/profile-context';
import { AdvancedLoader } from '@/components/ui/advanced-loader';

const menuItems = [
  { href: '/admin/overview', label: 'Overview', icon: BarChart },
  { href: '/admin/analytics', label: 'Analytics', icon: PieChart }, // Changed to PieChart for Analytics
  { href: '/admin/users', label: 'Creator Management', icon: Users },
  { href: '/admin/strikes', label: 'Strike Requests', icon: Gavel },
  { href: '/admin/reactivations', label: 'Reactivation Requests', icon: UserCheck },
  { href: '/admin/feedback', label: 'Creator Feedback', icon: MessageSquareQuote },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [hasNewFeedback, setHasNewFeedback] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function checkUnread() {
      try {
        const res = await fetch('/api/feedback/unread?role=admin');
        const data = await res.json();
        setHasNewFeedback(!!data.hasUnread);
      } catch {
        setHasNewFeedback(false);
      } finally {
        setIsLoading(false);
      }
    }
    checkUnread();
    const interval = setInterval(checkUnread, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [pathname]); // Re-check on navigation

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarProfileHeader />
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? (
          <div className="space-y-4 p-4">
            <AdvancedLoader 
              type="data" 
              size="sm" 
              text="Loading admin panel..." 
              subtext="Preparing dashboard"
              className="mx-2"
            />
            {/* Show skeleton menu items while loading */}
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <div key={item.href} className="flex items-center gap-3 py-3 px-4 rounded-lg bg-muted/20 animate-pulse">
                  <div className="h-4 w-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded flex-1" style={{ width: `${Math.random() * 60 + 40}%` }} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <SidebarMenu className="gap-4">
            {menuItems.map((item) => (
              <SidebarMenuItem 
                key={item.href}
                notification={item.href === '/admin/feedback' ? hasNewFeedback : false}
              >
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (pathname === '/admin' && item.href === '/admin/overview')}
                  tooltip={item.label}
                >
                  <Link href={item.href} className="pl-4 flex items-center gap-3">
                    <item.icon />
                    {item.href === '/admin/feedback' && hasNewFeedback && (
                      <span className="absolute -top-1 left-5 w-2 h-2 rounded-full bg-green-500 animate-pulse z-10" />
                    )}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="gap-4">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/admin/settings'}
              tooltip="Settings"
            >
              <Link href="/admin/settings" className="flex items-center gap-3">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function SidebarProfileHeader() {
  const { profile } = useAdminProfile();
  return (
    <div className="flex items-center gap-3 p-2">
      <Link href="/admin" className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile.avatar} data-ai-hint="profile picture" />
          <AvatarFallback>{profile.displayName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-sidebar-foreground truncate">{profile.displayName}</span>
        </div>
      </Link>
    </div>
  );
}
