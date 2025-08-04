'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlanCard } from '@/components/settings/plan-card';
import { AdvancedLoader, DataLoader } from '@/components/ui/advanced-loader';
import { Crown, Lock, Download, Trash2, RefreshCcw, AlertTriangle, Shield, Loader2 } from 'lucide-react';
import { useDeviceDetection } from '@/hooks/use-device-detection';
import { startSessionMonitoring, stopSessionMonitoring } from '@/lib/session-monitor';

type MostViewedVideo = { id: string; title: string; thumbnail: string; url: string; viewCount: string };

interface User {
  _id: string;
  name: string;
  email: string;
  plan: string;
  planExpiry: string;
  youtubeChannelId?: string;
  youtubeChannel?: {
  id: string; 
    title: string;
    thumbnail: string;
  };
  disconnectApproved?: boolean;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    copyrightMatches: true,
    weeklyReports: true,
    promotionalEmails: false,
  });
  const [exportLoading, setExportLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
    verificationCode: ''
  });
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  
  // 2FA states
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [show2FAVerify, setShow2FAVerify] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorQR, setTwoFactorQR] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [showLoginHistoryDialog, setShowLoginHistoryDialog] = useState(false);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [loginHistoryLoading, setLoginHistoryLoading] = useState(false);
  
  // Auto-refresh states
  const [isRefreshingDevices, setIsRefreshingDevices] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(true);

  // Track if we've already loaded devices initially
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  // Track previous device count to detect new devices
  const [previousDeviceCount, setPreviousDeviceCount] = useState(0);

  // Use the device detection hook
  const {
    isChecking: deviceChecking,
    newDeviceInfo,
    showNewDeviceDialog,
    checkForNewDevice,
    confirmNewDevice,
    dismissNewDeviceDialog,
    testNewDevice
  } = useDeviceDetection();

  // Add debounce mechanism
  const [lastLoadTime, setLastLoadTime] = useState<number>(0);
  
  const loadDevices = async (forceRefresh = false) => {
    // Only apply debounce if not force refresh
    const now = Date.now();
    if (!forceRefresh && (devicesLoading || (now - lastLoadTime < 2000))) { // 2 second debounce
      console.log('🔄 Devices loading or too recent, skipping...');
      return;
    }

    try {
      setDevicesLoading(true);
      setLastLoadTime(now);
      
      // Add a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('⏰ Device loading timeout, forcing completion');
        setDevicesLoading(false);
        setDevices([]);
      }, 10000); // 10 second timeout
      
      const token = localStorage.getItem("creator_jwt");
      const userEmail = localStorage.getItem('user_email');
      
      if (!token || !userEmail) {
        console.log('❌ No token or user email found');
        setDevices([]);
        clearTimeout(timeoutId);
        return;
      }

      // Load devices directly without cleanup first
      const response = await fetch(`/api/settings/devices?email=${encodeURIComponent(userEmail)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const newDevices = data.devices || [];
        
        console.log(`📱 Loaded ${newDevices.length} devices`);
        
        // Check if this is the initial load
        if (!hasInitialLoad) {
          setHasInitialLoad(true);
          setPreviousDeviceCount(newDevices.length);
          setDevices(newDevices);
          setLastRefreshTime(new Date());
          console.log('🔄 Initial device load completed');
          clearTimeout(timeoutId);
          return;
        }
        
        // Check if there are new devices (devices not in previous state)
        const currentDeviceCount = newDevices.length;
        
        console.log(`🔍 Device count check: Previous: ${previousDeviceCount}, Current: ${currentDeviceCount}`);
        
        // Find new devices by comparing with previous state
        const newDevicesFound = newDevices.filter((device: any) => 
          !devices.some((prevDevice: any) => prevDevice.id === device.id)
        );
        
        console.log(`🔍 New devices found: ${newDevicesFound.length}`);
        
        // Update previous device count for next comparison
        setPreviousDeviceCount(currentDeviceCount);
        setDevices(newDevices);
        setLastRefreshTime(new Date());
        
        // If we have new devices, trigger dialog (only if not auto-refresh)
        if (newDevicesFound.length > 0 && !forceRefresh) {
          console.log('🎉 New device detected in settings! Triggering dialog...');
          
          // Find the newest device (most recent lastActive)
          const newestDevice = newDevicesFound
            .sort((a: any, b: any) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())[0];
          
          if (newestDevice) {
            console.log('📱 Newest device found:', newestDevice);
            
            // Create device info for dialog
            const deviceInfo = {
              device: newestDevice.device,
              browser: newestDevice.browser,
              os: newestDevice.os,
              location: newestDevice.location,
              ipAddress: newestDevice.ipAddress,
              loginTime: new Date(newestDevice.lastActive).toLocaleString()
            };
            
            // Store in localStorage for VoiceAlertProvider
            localStorage.setItem('newDeviceFromSettings', JSON.stringify(deviceInfo));
            
            console.log('🎉 New device info stored, dialog should appear immediately');
            
            // Force trigger the dialog by dispatching a custom event (mark as genuine new device)
            window.dispatchEvent(new CustomEvent('newDeviceDetected', { 
              detail: { ...deviceInfo, isGenuineNewDevice: true } 
            }));
            
            // Also trigger voice alert immediately
            try {
              const voiceNotification = await import('@/lib/voice-notification');
              await voiceNotification.voiceNotification.speakNewDeviceAlert({
                deviceName: deviceInfo.device,
                browser: deviceInfo.browser,
                os: deviceInfo.os,
                location: deviceInfo.location,
                time: deviceInfo.loginTime,
                ipAddress: deviceInfo.ipAddress
              });
            } catch (error) {
              console.error('Voice alert failed:', error);
            }
            
            // Devices state already updated above
          }
        }
      } else {
        console.error('❌ Failed to load devices:', response.status, response.statusText);
        setDevices([]);
      }
      
      clearTimeout(timeoutId);
    } catch (error) {
      console.error('❌ Error loading devices:', error);
      setDevices([]);
    } finally {
      console.log('🔄 Setting devicesLoading to false');
      setDevicesLoading(false);
    }
  };

  const loadLoginHistory = async () => {
    try {
      setLoginHistoryLoading(true);
      const token = localStorage.getItem("creator_jwt");
      const userEmail = localStorage.getItem('user_email');
      
      if (!token || !userEmail) {
        console.log('❌ No token or user email found for login history');
        setLoginHistory([]);
        return;
      }

      const response = await fetch(`/api/settings/login-history?email=${encodeURIComponent(userEmail)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const history = data.history || [];
        console.log(`📱 Loaded ${history.length} login history entries`);
        setLoginHistory(history);
      } else {
        console.error('❌ Failed to load login history:', response.status, response.statusText);
        setLoginHistory([]);
      }
    } catch (error) {
      console.error('❌ Error loading login history:', error);
      setLoginHistory([]);
    } finally {
      setLoginHistoryLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    async function fetchUser() {
      try {
        const token = localStorage.getItem("creator_jwt");
        if (!token) {
          if (isMounted) setLoading(false);
          return;
        }

        const userEmail = localStorage.getItem('user_email');
        if (!userEmail) {
          if (isMounted) setLoading(false);
          return;
        }

        const res = await fetch(`/api/get-user?email=${encodeURIComponent(userEmail)}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();

        if (data._id && isMounted) {
          setUser(data);
        }
        
        // Load devices after user data is loaded
        if (isMounted) {
          await loadDevices();
        }
    } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchUser();
    
    // Start session monitoring only once
    const userEmail = localStorage.getItem('user_email');
    const token = localStorage.getItem('creator_jwt');
    
    if (userEmail && token && isMounted) {
      // Get current session ID from devices
      const startMonitoring = async () => {
        try {
          const response = await fetch(`/api/settings/devices?email=${encodeURIComponent(userEmail)}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const currentDevice = data.devices?.find((device: any) => device.isCurrentSession);
            
            if (currentDevice && isMounted) {
              startSessionMonitoring({
                checkInterval: 30000, // Check every 30 seconds
                userEmail,
                currentSessionId: currentDevice.id
              }, (deviceInfo) => {
                console.log('🔒 Device logged out remotely:', deviceInfo);
                // Redirect to login page
                localStorage.removeItem('creator_jwt');
                localStorage.removeItem('user_email');
                window.location.href = '/auth/login';
              });
            }
          }
        } catch (error) {
          console.error('Error starting session monitoring:', error);
        }
      };
      
      startMonitoring();
    }

    // Cleanup session monitoring on unmount
    return () => {
      isMounted = false;
      stopSessionMonitoring();
      
      // Clear processed devices from sessionStorage
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith('processed_devices_')) {
          sessionStorage.removeItem(key);
        }
      });
    };
  }, []); // Remove user dependency to prevent infinite loops

  // Add real-time device monitoring
  useEffect(() => {
    if (!user?.email) return;
    
    // Check for new devices every 30 seconds
    const deviceCheckInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem("creator_jwt");
        if (!token) return;
        
        const response = await fetch(`/api/settings/devices?email=${encodeURIComponent(user.email)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const currentDevices = data.devices || [];
          
          // Compare with current devices state
          const newDevicesFound = currentDevices.filter((device: any) => 
            !devices.some((prevDevice: any) => prevDevice.id === device.id)
          );
          
          if (newDevicesFound.length > 0) {
            console.log('🎉 Real-time new device detected!');
            
            // Find the newest device
            const newestDevice = newDevicesFound
              .sort((a: any, b: any) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())[0];
            
            if (newestDevice) {
              const deviceInfo = {
                device: newestDevice.device,
                browser: newestDevice.browser,
                os: newestDevice.os,
                location: newestDevice.location,
                ipAddress: newestDevice.ipAddress,
                loginTime: new Date(newestDevice.lastActive).toLocaleString()
              };
              
                          // Store in localStorage for VoiceAlertProvider
            localStorage.setItem('newDeviceFromSettings', JSON.stringify(deviceInfo));
            
            console.log('🎉 Real-time new device detected, triggering dialog...');
            
            // Trigger dialog
            window.dispatchEvent(new CustomEvent('newDeviceDetected', { detail: deviceInfo }));
            
            // Also trigger voice alert immediately
            try {
              const voiceNotification = await import('@/lib/voice-notification');
              await voiceNotification.voiceNotification.speakNewDeviceAlert({
                deviceName: deviceInfo.device,
                browser: deviceInfo.browser,
                os: deviceInfo.os,
                location: deviceInfo.location,
                time: deviceInfo.loginTime,
                ipAddress: deviceInfo.ipAddress
              });
            } catch (error) {
              console.error('Voice alert failed:', error);
            }
            
            // Update devices state
            setDevices(currentDevices);
            }
          }
        }
      } catch (error) {
        console.error('Real-time device check failed:', error);
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(deviceCheckInterval);
  }, [user?.email, devices]);

  // Listen for change password dialog trigger
  useEffect(() => {
    const handleChangePasswordDialog = () => {
      setShowPasswordDialog(true);
    };

    window.addEventListener('openChangePasswordDialog', handleChangePasswordDialog);
    
    return () => {
      window.removeEventListener('openChangePasswordDialog', handleChangePasswordDialog);
    };
  }, []);

// Add a useEffect to trigger dialog when devices change
useEffect(() => {
  // Only run this if we have devices, not loading, and haven't already processed them
  if (devices.length > 0 && !devicesLoading) {
    // Check if we've already processed these devices
    const deviceIds = devices.map((d: any) => d.id).join(',');
    const processedKey = `processed_devices_${deviceIds}`;
    
    if (sessionStorage.getItem(processedKey)) {
      return; // Already processed these devices
    }
    
    console.log('🔍 Devices loaded, checking for new devices...');
    
    // Check if this is the first load or if we have new devices
    const hasNewDevices = devices.some((device: any) => {
      // Check if device was added in the last 30 seconds
      const deviceTime = new Date(device.lastActive).getTime();
      const currentTime = Date.now();
      const timeDiff = currentTime - deviceTime;
      
      return timeDiff < 30000; // 30 seconds
    });
    
    if (hasNewDevices) {
      console.log('🎉 Recent device detected, triggering dialog...');
      
      // Find the most recent device
      const newestDevice = devices
        .sort((a: any, b: any) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())[0];
      
      if (newestDevice) {
        console.log('📱 Newest device found:', newestDevice);
        
        // Create device info for dialog
        const deviceInfo = {
          device: newestDevice.device,
          browser: newestDevice.browser,
          os: newestDevice.os,
          location: newestDevice.location,
          ipAddress: newestDevice.ipAddress,
          loginTime: new Date(newestDevice.lastActive).toLocaleString()
        };
        
        // Store in localStorage for VoiceAlertProvider
        localStorage.setItem('newDeviceFromSettings', JSON.stringify(deviceInfo));
        
        // Force trigger the dialog by dispatching a custom event
        window.dispatchEvent(new CustomEvent('newDeviceDetected', { detail: deviceInfo }));
        
        console.log('🎉 New device info stored and event dispatched, dialog should appear immediately');
      }
    }
    
    // Mark these devices as processed
    sessionStorage.setItem(processedKey, 'true');
  }
}, [devices]); // Remove devicesLoading dependency to prevent conflicts



  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
        ...prev,
      [key]: !prev[key]
    }));
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const token = localStorage.getItem("creator_jwt");
      const userEmail = localStorage.getItem('user_email');
      
      if (!token || !userEmail) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/dashboard/data', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const userData = await response.json();
      
      // Create human-readable data export
      const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      };

      const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
      };

      const readableData = `
CREATORS SHIELD - DATA EXPORT REPORT
====================================

Generated on: ${formatDate(new Date().toISOString())}

USER INFORMATION
----------------
Name: ${userData.user?.name || 'Not provided'}
Email: ${userData.user?.email || 'Not provided'}
Current Plan: ${userData.user?.plan ? userData.user.plan.charAt(0).toUpperCase() + userData.user.plan.slice(1) : 'Free'}
Plan Expiry: ${userData.user?.planExpiry ? formatDate(userData.user.planExpiry) : 'No expiry'}
Account Created: ${userData.user?.createdAt ? formatDate(userData.user.createdAt) : 'Unknown'}

YOUTUBE CHANNEL
---------------
${userData.user?.youtubeChannel ? `
Channel Name: ${userData.user.youtubeChannel.title}
Channel ID: ${userData.user.youtubeChannel.id}
Channel Thumbnail: ${userData.user.youtubeChannel.thumbnail}
` : 'No YouTube channel connected'}

ANALYTICS OVERVIEW
------------------
${userData.analytics ? `
Total Subscribers: ${formatNumber(userData.analytics.subscribers || 0)}
Total Views: ${formatNumber(userData.analytics.views || 0)}

Most Viewed Video:
${userData.analytics.mostViewedVideo ? `
  Title: ${userData.analytics.mostViewedVideo.title}
  Views: ${formatNumber(userData.analytics.mostViewedVideo.views || 0)}
` : 'No data available'}

Daily Analytics (Last 15 days):
${userData.analytics.dailyData ? userData.analytics.dailyData.map((day: any, index: number) => `
${index + 1}. ${formatDate(day.date)}:
   Views: ${formatNumber(day.views)}
   Subscribers: ${formatNumber(day.subscribers)}
`).join('') : 'No daily data available'}
` : 'No analytics data available'}

USAGE STATISTICS
----------------
${userData.usageStats && Object.keys(userData.usageStats).length > 0 ? 
  Object.entries(userData.usageStats).map(([key, value]) => `${key}: ${value}`).join('\n') : 
  'No usage statistics available'}

PLATFORM CONNECTIONS
--------------------
${userData.platformConnections && Object.keys(userData.platformConnections).length > 0 ? 
  Object.entries(userData.platformConnections).map(([platform, status]) => `${platform}: ${status}`).join('\n') : 
  'No platform connections available'}

EXPORT SUMMARY
--------------
• This report contains all your account data from Creators Shield
• Your data is exported in a human-readable format
• Keep this file secure as it contains sensitive information
• For technical support, contact our team

Generated by: Creators Shield Platform
Report Version: 1.0
      `.trim();

      // Create and download file
      const blob = new Blob([readableData], { 
        type: 'text/plain;charset=utf-8' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `creators-shield-report-${userEmail}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('Data exported successfully in readable format!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleResetConnections = async () => {
    if (!confirm('Are you sure you want to logout from all devices? You will need to log in again on this device.')) {
      return;
    }

    try {
      const token = localStorage.getItem("creator_jwt");
      const userEmail = localStorage.getItem('user_email');
      
      if (!token || !userEmail) {
        alert('Authentication required');
        return;
      }

      // First, get all devices
      const devicesResponse = await fetch(`/api/settings/devices?email=${encodeURIComponent(userEmail)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (devicesResponse.ok) {
        const devicesData = await devicesResponse.json();
        const allDevices = devicesData.devices || [];
        
        // Logout from all devices except current
        let logoutCount = 0;
        for (const device of allDevices) {
          if (!device.isCurrentSession) {
            try {
              const logoutResponse = await fetch('/api/auth/logout-device', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  userEmail: userEmail,
                  sessionId: device.id,
                  targetDeviceInfo: device
                })
              });

              if (logoutResponse.ok) {
                logoutCount++;
                console.log(`🔒 Logged out device: ${device.device}`);
              }
            } catch (error) {
              console.error(`Failed to logout device ${device.device}:`, error);
            }
          }
        }

        // Reload devices after logout
        await loadDevices();
        
        alert(`Successfully logged out from ${logoutCount} devices. Only this device remains active.`);
      } else {
        alert('Failed to fetch devices');
      }
    } catch (error) {
      console.error('Error resetting connections:', error);
      alert('Failed to reset connections');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("creator_jwt");
      const userEmail = localStorage.getItem('user_email');
      
      if (!token || !userEmail) {
        throw new Error('Authentication required');
      }

      // Call API to permanently delete account from database
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: userEmail,
          permanentDelete: true,
          deleteAllData: true
        })
      });

      if (response.ok) {
        // Clear all storage and redirect to home
        localStorage.clear();
        sessionStorage.clear();
        
        // Show success message before redirect
        alert('Your account has been permanently deleted. All data has been removed from our servers.');
        window.location.href = '/';
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Check for new device login on component mount (only once)
  useEffect(() => {
    const checkNewDevice = async () => {
      try {
        const token = localStorage.getItem("creator_jwt");
        const userEmail = localStorage.getItem('user_email');
        
        if (!token || !userEmail) return;

        // Use the device detection hook
        await checkForNewDevice(userEmail);
      } catch (error) {
        console.error('Error checking new device:', error);
      }
    };

    // Only check once when component mounts and user data is loaded
    if (!loading && user) {
      checkNewDevice();
    }
  }, [loading, user]); // Run when user data is loaded

  // Add auto-refresh every 30 seconds
  useEffect(() => {
    if (!user?.email) return;
    
    // Initial load
    loadDevices(true);
    
    // Set up auto-refresh every 30 seconds (only check for new devices)
    const autoRefreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing devices (checking for new devices only)...');
      loadDevices(true); // This will only trigger dialog for new devices, not reload existing ones
    }, 30000); // 30 seconds
    
    return () => {
      clearInterval(autoRefreshInterval);
    };
  }, [user?.email]);

  // Manual refresh function
  const handleManualRefresh = async () => {
    console.log('🔄 Manual force refresh triggered');
    setIsRefreshingDevices(true);
    await loadDevices(true);
    setIsRefreshingDevices(false);
  };

  // 2FA Functions
  const handle2FASetup = async () => {
    setTwoFactorLoading(true);
    try {
      const token = localStorage.getItem("creator_jwt");
      const userEmail = localStorage.getItem('user_email');
      
      if (!token || !userEmail) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/settings/2fa/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: userEmail })
      });

      if (response.ok) {
        const data = await response.json();
        setTwoFactorSecret(data.secret);
        setTwoFactorQR(data.qr);
        setShow2FASetup(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to setup 2FA');
      }
    } catch (error) {
      console.error('2FA setup failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to setup 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handle2FAVerify = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      alert('Please enter a valid 6-digit code');
      return;
    }

    setTwoFactorLoading(true);
    try {
      const token = localStorage.getItem("creator_jwt");
      const userEmail = localStorage.getItem('user_email');
      
      if (!token || !userEmail) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/settings/2fa/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: userEmail,
          code: twoFactorCode
        })
      });

      if (response.ok) {
        alert('Two-factor authentication enabled successfully!');
        setShow2FASetup(false);
        setShow2FAVerify(false);
        setTwoFactorCode('');
        setTwoFactorSecret('');
        setTwoFactorQR('');
        
        // Refresh user data to update 2FA status
        window.location.reload();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid verification code');
      }
    } catch (error) {
      console.error('2FA verification failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to verify 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handle2FADisable = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      alert('Please enter a valid 6-digit code');
      return;
    }

    setTwoFactorLoading(true);
    try {
      const token = localStorage.getItem("creator_jwt");
      const userEmail = localStorage.getItem('user_email');
      
      if (!token || !userEmail) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/settings/2fa/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: userEmail,
          code: twoFactorCode
        })
      });

      if (response.ok) {
        alert('Two-factor authentication disabled successfully!');
        setShow2FAVerify(false);
        setTwoFactorCode('');
        
        // Refresh user data to update 2FA status
        window.location.reload();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid verification code');
      }
    } catch (error) {
      console.error('2FA disable failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to disable 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.email || !/^\S+@\S+\.\S+$/.test(passwordForm.email)) {
      alert('Please enter a valid email address');
      return;
    }

    setPasswordChangeLoading(true);
    try {
      const token = localStorage.getItem("creator_jwt");
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Send verification code to email
      const codeResponse = await fetch('/api/auth/send-password-reset-code', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: passwordForm.email
        })
      });

      if (codeResponse.ok) {
        setShowVerificationDialog(true);
        setShowPasswordDialog(false);
      } else {
        const errorData = await codeResponse.json();
        throw new Error(errorData.message || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to send verification code');
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const handleVerifyAndChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    setPasswordChangeLoading(true);
    try {
      const token = localStorage.getItem("creator_jwt");
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Verify code and change password
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: passwordForm.email,
          newPassword: passwordForm.newPassword,
          verificationCode: passwordForm.verificationCode
        })
      });

      if (response.ok) {
        alert('Password changed successfully! You will need to log in again.');
        setShowVerificationDialog(false);
        setPasswordForm({
          email: '',
          newPassword: '',
          confirmPassword: '',
          verificationCode: ''
        });
        // Redirect to login page
        localStorage.removeItem('creator_jwt');
        localStorage.removeItem('user_email');
        window.location.href = '/auth/login';
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const handleNewDeviceConfirm = async () => {
    await confirmNewDevice();
  };



  const isPremiumUser = user?.plan && user.plan !== 'free';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <DataLoader 
          size="lg"
          text="Loading settings..."
          subtext="Preparing your account preferences"
          showProgress={true}
          progress={60}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
              <div>
          <h1 className="text-3xl font-bold">Creator Dashboard</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
                </div>
              </div>

      <div className="grid gap-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your basic account details and profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <p className="text-sm text-muted-foreground mt-1">{user?.name || 'Not provided'}</p>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
              </div>
            </div>
            
            {user?.youtubeChannel && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Connected YouTube Channel</h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">YT</span>
                  </div>
                  <div>
                    <p className="font-medium">{user.youtubeChannel.title}</p>
                    <p className="text-sm text-muted-foreground">Channel ID: {user.youtubeChannel.id}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure how you receive notifications about your content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Email Notifications</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="copyright-matches">New Copyright Matches</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new copyright matches are found.
                  </p>
          </div>
                    <Switch
                  id="copyright-matches"
                  checked={notifications.copyrightMatches}
                  onCheckedChange={() => handleNotificationChange('copyrightMatches')}
                />
          </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-reports">Weekly Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly summary of your content protection.
                  </p>
                    </div>
                    <Switch
                  id="weekly-reports"
                  checked={notifications.weeklyReports}
                  onCheckedChange={() => handleNotificationChange('weeklyReports')}
                />
                </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="promotional-emails">Promotional Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about new features and offers.
                  </p>
                    </div>
                    <Switch
                  id="promotional-emails"
                  checked={notifications.promotionalEmails}
                  onCheckedChange={() => handleNotificationChange('promotionalEmails')}
                    />
                  </div>
                </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Manage your account security and password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Change Password</Label>
                <p className="text-sm text-muted-foreground">
                  Update your account password for better security
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPasswordDialog(true)}
                className="flex items-center gap-2"
              >
                Change Password
              </Button>
                </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  {user?.twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security to your account'}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={user?.twoFactorEnabled ? () => setShow2FAVerify(true) : handle2FASetup}
                disabled={twoFactorLoading}
                className="flex items-center gap-2"
              >
                {twoFactorLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    {user?.twoFactorEnabled ? 'Disabling...' : 'Setting up...'}
                  </>
                ) : (
                  user?.twoFactorEnabled ? 'Disable 2FA' : 'Setup 2FA'
                )}
              </Button>
                    </div>
              
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                <Label>Login History</Label>
                      <p className="text-sm text-muted-foreground">
                  View your recent login activity
                      </p>
                  </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowLoginHistoryDialog(true);
                  loadLoginHistory();
                }}
              >
                View History
              </Button>
                </div>
          </CardContent>
        </Card>

        {/* Platform Connections */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Connections</CardTitle>
            <CardDescription>
              Manage your connected social media platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">YT</span>
                      </div>
                <div>
                  <p className="font-medium">YouTube</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.youtubeChannel ? 'Connected' : 'Not connected'}
                  </p>
                </div>
                      </div>
              <Button variant="outline" size="sm">
                {user?.youtubeChannel ? 'Manage' : 'Connect'}
              </Button>
                    </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">IG</span>
                </div>
                <div>
                  <p className="font-medium">Instagram</p>
                  <p className="text-sm text-muted-foreground">Not connected</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Connect
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
            <CardDescription>
              Control your data and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                <Label>Data Export</Label>
                          <p className="text-sm text-muted-foreground">
                  Download all your data in a comprehensive format
                    </p>
                  </div>
                        <Button
                          variant="outline"
                          size="sm"
                onClick={handleExportData}
                disabled={exportLoading}
                className="flex items-center gap-2"
                        >
                {exportLoading ? (
                            <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Exporting...
                            </>
                          ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export Data
                  </>
                          )}
                        </Button>
          </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reset All Connections</Label>
                <p className="text-sm text-muted-foreground">
                  Logout from all devices and reset all platform connections
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
              <Button
                            variant="outline"
                            size="sm"
                    className="text-orange-600 hover:text-orange-700 flex items-center gap-2"
                    disabled={resetLoading}
                  >
                    {resetLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Resetting...
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="h-4 w-4" />
                        Reset Connections
                      </>
                    )}
              </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Reset All Connections
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will immediately logout you from all devices and reset all platform connections (YouTube, Instagram, etc.). 
                      You will need to log in again on each device and reconnect your platforms.
                      <br /><br />
                      <strong>This action cannot be undone.</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleResetConnections}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Reset All Connections
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Delete Account</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
              <Button
                    variant="destructive" 
                            size="sm"
                    disabled={deleteLoading}
                    className="flex items-center gap-2"
                  >
                    {deleteLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </>
                    )}
              </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Delete Account
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently delete your account and all associated data including:
                      <br /><br />
                      • All your analytics and reports<br />
                      • Platform connections (YouTube, Instagram)<br />
                      • Copyright infringement data<br />
                      • Account settings and preferences<br />
                      • All uploaded content and scans<br /><br />
                      <strong>This action cannot be undone and all data will be permanently lost.</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Account Permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Active Devices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Active Devices
                  {user?.plan === 'free' && (
                    <Badge variant="secondary" className="text-xs">
                      Premium
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  💡 Auto-refreshes every 30 seconds. New devices will appear automatically.
                  {user?.plan === 'free' && (
                    <span className="block text-sm text-orange-500 mt-1">
                      ⚠️ Upgrade to Premium to access device management features
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleManualRefresh}
                  disabled={devicesLoading || isRefreshingDevices || user?.plan === 'free'}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isRefreshingDevices ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Force Refresh
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="h-4 w-4" />
                      Force Refresh
                    </>
                  )}
                </Button>
                
                {/* Temporary test button */}
                <Button
                  onClick={() => {
                    const testDeviceInfo = {
                      device: 'Test iPhone',
                      browser: 'Safari 17.0',
                      os: 'iOS 17.0',
                      location: 'Mumbai, Maharashtra, India',
                      ipAddress: '192.168.1.1',
                      loginTime: new Date().toLocaleString()
                    };
                    localStorage.setItem('newDeviceFromSettings', JSON.stringify(testDeviceInfo));
                    window.dispatchEvent(new CustomEvent('newDeviceDetected', { 
                      detail: { ...testDeviceInfo, isGenuineNewDevice: true } 
                    }));
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-yellow-500 text-white hover:bg-yellow-600"
                >
                  Test Dialog
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="text-xs text-muted-foreground mb-3">
              💡 Auto-refreshes every minute. New devices will appear automatically.
            </div>
            
            <div className="space-y-3">
              {devicesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Loading active devices...</p>
                </div>
              ) : devices.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-muted-foreground text-xl">📱</span>
                  </div>
                  <p className="text-sm text-muted-foreground">No active devices found</p>
                  <p className="text-xs text-muted-foreground mt-1">Your devices will appear here when you log in</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      console.log('🔄 Retrying device load...');
                      loadDevices();
                    }}
                    className="mt-4"
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                devices.map((device, index) => (
                  <div 
                    key={device.id || index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      device.isCurrentSession 
                        ? 'bg-green-500/10 dark:bg-green-500/20 border-green-500/30 dark:border-green-500/50' 
                        : 'bg-muted/20 dark:bg-muted/30 border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        device.isCurrentSession ? 'bg-green-500' : 'bg-blue-500'
                      }`}>
                        <span className="text-white text-xs font-bold">
                          {device.isCurrentSession ? '✓' : '📱'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                          <span>{device.device || 'Unknown Device'}</span>
                          {device.isCurrentSession && (
                            <Badge variant="secondary" className="text-xs">Current</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {device.browser} • {device.os} • {device.location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {device.lastActive ? new Date(device.lastActive).toLocaleString() : 'Unknown time'}
                        </p>
                      </div>
                    </div>
                    {!device.isCurrentSession && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem("creator_jwt");
                            const userEmail = localStorage.getItem('user_email');
                            
                            if (!token || !userEmail) return;

                            // Logout the device using the devices API
                            const response = await fetch('/api/settings/devices', {
                              method: 'DELETE',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                email: userEmail,
                                sessionId: device.id
                              })
                            });

                            if (response.ok) {
                              console.log('🔒 Device logged out successfully:', device.device);
                              // Reload devices after logout
                              await loadDevices();
                            } else {
                              console.error('Failed to logout device:', response.status);
                            }
                          } catch (error) {
                            console.error('Error logging out device:', error);
                          }
                        }}
                      >
                        Logout
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                You can logout from individual devices or use "Reset All Connections" to logout from all devices at once.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Subscription & Billing */}
        <PlanCard 
          userPlan={user?.plan || 'free'} 
          planExpiry={user?.planExpiry} 
          userEmail={user?.email} 
        />
      </div>

      {/* Password Change Dialog */}
      <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              We'll send a verification code to your email address to reset your password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <input
                id="email"
                type="email"
                value={passwordForm.email}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                placeholder="Enter your email address"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePasswordChange}
              disabled={passwordChangeLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {passwordChangeLoading ? 'Sending Code...' : 'Send Verification Code'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verification Code Dialog */}
      <AlertDialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Verify Email Code</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the verification code sent to your email address and choose a new password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="verification-code">Verification Code</Label>
              <input
                id="verification-code"
                type="text"
                value={passwordForm.verificationCode}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, verificationCode: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleVerifyAndChangePassword}
              disabled={passwordChangeLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {passwordChangeLoading ? 'Changing Password...' : 'Change Password'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Device Detection Dialog */}
      <AlertDialog open={showNewDeviceDialog} onOpenChange={dismissNewDeviceDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              New Device Detected
            </AlertDialogTitle>
            <AlertDialogDescription>
              We detected a login from a new device. Please verify this is you.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            {newDeviceInfo && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">💻</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{newDeviceInfo.deviceName || 'Unknown Device'}</p>
                      <p className="text-xs text-muted-foreground">
                        {newDeviceInfo.browser} • {newDeviceInfo.os} • {newDeviceInfo.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(newDeviceInfo.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  If this wasn't you, please change your password immediately to secure your account.
                </p>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>This Wasn't Me</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleNewDeviceConfirm}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Yes, This Was Me
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 2FA Setup Dialog */}
      <AlertDialog open={show2FASetup} onOpenChange={setShow2FASetup}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Setup Two-Factor Authentication</AlertDialogTitle>
            <AlertDialogDescription>
              Scan the QR code with your authenticator app to setup 2FA.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            {twoFactorQR && (
              <div className="flex flex-col items-center space-y-3">
                <img src={twoFactorQR} alt="QR Code" className="w-48 h-48" />
                <p className="text-sm text-muted-foreground text-center">
                  Scan this QR code with Google Authenticator, Authy, or any TOTP app
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="2fa-code">Enter 6-digit code from your app</Label>
              <input
                id="2fa-code"
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={6}
              />
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShow2FASetup(false);
              setTwoFactorCode('');
              setTwoFactorSecret('');
              setTwoFactorQR('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handle2FAVerify} disabled={twoFactorLoading}>
              {twoFactorLoading ? 'Verifying...' : 'Verify & Enable'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 2FA Disable Dialog */}
      <AlertDialog open={show2FAVerify} onOpenChange={setShow2FAVerify}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Two-Factor Authentication</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your 6-digit code to disable 2FA.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="2fa-disable-code">Enter 6-digit code from your app</Label>
              <input
                id="2fa-disable-code"
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={6}
              />
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShow2FAVerify(false);
              setTwoFactorCode('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handle2FADisable} disabled={twoFactorLoading}>
              {twoFactorLoading ? 'Disabling...' : 'Disable 2FA'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Login History Dialog */}
      <AlertDialog open={showLoginHistoryDialog} onOpenChange={setShowLoginHistoryDialog}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Login History</AlertDialogTitle>
            <AlertDialogDescription>
              View your recent login activity and sessions
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground mb-3">
              💡 Shows your last 50 login sessions with device details and locations.
            </div>
            
            <div className="space-y-3">
              {loginHistoryLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Loading login history...</p>
                </div>
              ) : loginHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-muted-foreground text-xl">📊</span>
                  </div>
                  <p className="text-sm text-muted-foreground">No login history found</p>
                  <p className="text-xs text-muted-foreground mt-1">Your login history will appear here</p>
                </div>
              ) : (
                loginHistory.map((session, index) => (
                  <div 
                    key={session.sessionId || index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      session.isCurrentSession 
                        ? 'bg-green-500/10 dark:bg-green-500/20 border-green-500/30 dark:border-green-500/50' 
                        : 'bg-muted/20 dark:bg-muted/30 border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        session.isCurrentSession ? 'bg-green-500' : 'bg-blue-500'
                      }`}>
                        <span className="text-white text-xs font-bold">
                          {session.isCurrentSession ? '✓' : '📱'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                          <span>{session.device || 'Unknown Device'}</span>
                          {session.isCurrentSession && (
                            <Badge variant="secondary" className="text-xs">Current</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {session.browser} • {session.os} • {session.location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.lastActive ? new Date(session.lastActive).toLocaleString() : 'Unknown time'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          IP: {session.ipAddress || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLoginHistoryDialog(false)}>
              Close
            </AlertDialogCancel>
            <Button 
              variant="outline" 
              onClick={loadLoginHistory}
              disabled={loginHistoryLoading}
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${loginHistoryLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
