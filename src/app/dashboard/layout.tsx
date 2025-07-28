
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { CreatorSidebar } from '@/components/layout/creator-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { DashboardDataProvider } from './dashboard-context';
import { SuspensionOverlay } from '@/components/ui/suspension-overlay';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user has JWT token
        const token = localStorage.getItem('creator_jwt');
        if (!token) {
          router.push('/auth/login');
          return;
        }
        // Verify token by making a request to a protected API
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          localStorage.removeItem('creator_jwt');
          router.push('/auth/login');
          return;
        }
        setIsAuthenticated(true);
      } catch (error) {
        router.push('/auth/login');
      }
    };
    checkAuth();
  }, [router]);

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <SidebarProvider>
      <DashboardDataProvider>
        <CreatorSidebar />
        <SidebarInset>
            <DashboardHeader title="Creator Dashboard" />
            <main className="p-4 md:p-6 flex-1 flex flex-col">
                {children}
            </main>
        </SidebarInset>
        <SuspensionOverlay />
      </DashboardDataProvider>
    </SidebarProvider>
  );
}
