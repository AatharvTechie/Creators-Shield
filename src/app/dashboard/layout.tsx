
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
import { useSessionValidation } from '@/hooks/use-session-validation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { VoiceAlertProvider } from '@/components/voice-alert';
import { NewDeviceAlertDialog } from '@/components/new-device-alert-dialog';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPlanPopup, setShowPlanPopup] = useState(false);
  
  // Initialize session activity tracking
  useSessionActivity();
  
  // Initialize device detection
  const { checkForNewDevice, newDeviceInfo, showNewDeviceDialog, confirmNewDevice, dismissNewDeviceDialog } = useDeviceDetection();
  
  // Initialize session validation
  useSessionValidation();

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

  // Add periodic device detection check
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) return;
    
    // Check for new devices every 30 seconds
    const deviceCheckInterval = setInterval(() => {
      console.log('🔄 Periodic device detection check...');
      checkForNewDevice(userEmail);
    }, 30000); // 30 seconds
    
    return () => {
      clearInterval(deviceCheckInterval);
    };
  }, [isAuthenticated]);

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
          {showNewDeviceDialog && newDeviceInfo && (
            <NewDeviceAlertDialog
              isOpen={showNewDeviceDialog}
              onClose={dismissNewDeviceDialog}
              deviceInfo={{
                device: newDeviceInfo.deviceName || 'Unknown Device',
                browser: newDeviceInfo.browser || 'Unknown Browser',
                os: newDeviceInfo.os || 'Unknown OS',
                location: newDeviceInfo.location || 'Unknown Location',
                ipAddress: newDeviceInfo.ipAddress || 'Unknown IP',
                loginTime: new Date(newDeviceInfo.timestamp).toLocaleString()
              }}
            />
          )}
        </DashboardDataProvider>
      </SidebarProvider>
    </VoiceAlertProvider>
  );
}
