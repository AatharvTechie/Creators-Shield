
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { CreatorSidebar } from '@/components/layout/creator-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { DashboardDataProvider } from './dashboard-context';
import { SuspensionOverlay } from '@/components/ui/suspension-overlay';
import { PlanUpgradePopup } from '@/components/ui/plan-upgrade-popup';
import { useSessionActivity } from '@/hooks/use-session-activity';
import { useDeviceDetection } from '@/hooks/use-device-detection';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { VoiceAlertProvider } from '@/components/voice-alert';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPlanPopup, setShowPlanPopup] = useState(false);
  
  // Initialize session activity tracking
  useSessionActivity();
  
  // Initialize device detection
  const { checkForNewDevice, newDeviceInfo, showNewDeviceDialog, confirmNewDevice, dismissNewDeviceDialog } = useDeviceDetection();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user has JWT token
        const token = localStorage.getItem('creator_jwt');
        const userEmail = localStorage.getItem('user_email');
        
        if (!token || !userEmail) {
          router.push('/auth/login');
          return;
        }
        
        // Verify token by making a request to get-user API
        const response = await fetch(`/api/get-user?email=${encodeURIComponent(userEmail)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          // Only redirect if it's a 401 or 403 error
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('creator_jwt');
            localStorage.removeItem('user_email');
            router.push('/auth/login');
            return;
          }
          // For other errors, just log but don't redirect
          console.error('Auth check error:', response.status, response.statusText);
        }
        
        const userData = await response.json();
        if (userData._id) {
          setIsAuthenticated(true);
          
          // Check for new device after successful authentication
          const userEmail = localStorage.getItem('user_email');
          if (userEmail) {
            // Small delay to ensure everything is loaded
            setTimeout(() => {
              checkForNewDevice(userEmail);
            }, 1000);
          }
        } else if (response.ok) {
          // Only redirect if the response was successful but no user data
          localStorage.removeItem('creator_jwt');
          localStorage.removeItem('user_email');
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Don't redirect on network errors, just log
      }
    };
    checkAuth();
  }, [router]);

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <VoiceAlertProvider>
      <SidebarProvider>
        <DashboardDataProvider>
          <CreatorSidebar />
          <SidebarInset>
              <DashboardHeader title="Creator Dashboard" />
              <main className="p-1 sm:p-2 flex-1 flex flex-col min-h-screen">
                  <div className="w-full max-w-7xl mx-auto px-2 sm:px-4">
                      {children}
                  </div>
              </main>
          </SidebarInset>
          
          <SuspensionOverlay />
          <PlanUpgradePopup 
            isOpen={true}
            onClose={() => {
              // Popup will manage its own visibility
              console.log('Plan upgrade popup closed');
            }}
            userPlan="free"
          />
          
          {/* New Device Detection Dialog */}
          <AlertDialog open={showNewDeviceDialog} onOpenChange={dismissNewDeviceDialog}>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>New Device Detected</AlertDialogTitle>
                <AlertDialogDescription>
                  We detected a login from a new device. Please verify this is you.
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              {newDeviceInfo && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                    <div className="text-2xl">💻</div>
                    <div className="flex-1">
                      <p className="font-medium">{newDeviceInfo.deviceName}</p>
                      <p className="text-sm text-muted-foreground">
                        {newDeviceInfo.browser} • {newDeviceInfo.os} • {newDeviceInfo.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(newDeviceInfo.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    If this wasn't you, please change your password immediately to secure your account.
                  </p>
                </div>
              )}
              
              <AlertDialogFooter>
                <AlertDialogCancel onClick={dismissNewDeviceDialog}>
                  This Wasn't Me
                </AlertDialogCancel>
                <AlertDialogAction onClick={confirmNewDevice}>
                  Yes, This Was Me
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DashboardDataProvider>
      </SidebarProvider>
    </VoiceAlertProvider>
  );
}
