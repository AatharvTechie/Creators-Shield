'use client';

import { useState, useEffect } from 'react';
import { detectNewDevice, speakNotification, stopSpeech } from '@/lib/device-detection';

interface DeviceDetectionResult {
  isNewDevice: boolean;
  deviceInfo: any;
  shouldAlert: boolean;
}

export function useDeviceDetection() {
  const [isChecking, setIsChecking] = useState(false);
  const [newDeviceInfo, setNewDeviceInfo] = useState<any>(null);
  const [showNewDeviceDialog, setShowNewDeviceDialog] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);

  const checkForNewDevice = async (userEmail: string) => {
    if (!userEmail) return;

    // Check if we've already detected this session
    const sessionKey = `device_check_${userEmail}`;
    const hasChecked = sessionStorage.getItem(sessionKey);
    if (hasChecked) {
      console.log('Device check already performed this session');
      return;
    }

    // Prevent checking too frequently (minimum 5 seconds between checks for faster response)
    const now = Date.now();
    if (now - lastCheckTime < 5000) {
      console.log('Device check skipped - too recent');
      return;
    }

    setIsChecking(true);
    setLastCheckTime(now);
    
    try {
      const result = await detectNewDevice(userEmail);
      
      if (result.isNewDevice && result.deviceInfo) {
        // Immediately show dialog and trigger voice alert
        setNewDeviceInfo(result.deviceInfo);
        setShowNewDeviceDialog(true);
        
        // Trigger speech notification immediately after dialog opens
        setTimeout(() => {
          speakNotification("Your CreatorShield account has been logged in from a new device.");
        }, 50); // Very small delay to ensure dialog is rendered first
        
        // You can add toast notification here
        console.log('New login detected on your account.');
        
        return result;
      }
      
      // Mark that we've checked this session
      sessionStorage.setItem(sessionKey, 'true');
      
      return result;
    } catch (error) {
      console.error('Device detection error:', error);
      return {
        isNewDevice: false,
        deviceInfo: null,
        shouldAlert: false
      };
    } finally {
      setIsChecking(false);
    }
  };

  const confirmNewDevice = async () => {
    try {
      // Stop any ongoing speech
      stopSpeech();
      
      const token = localStorage.getItem("creator_jwt");
      const userEmail = localStorage.getItem('user_email');
      
      if (!token || !userEmail || !newDeviceInfo) return;

      // Confirm new device
      const response = await fetch('/api/auth/confirm-new-device', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: userEmail,
          deviceInfo: newDeviceInfo
        })
      });

      if (!response.ok) {
        console.warn('Failed to confirm new device:', response.status);
      }

      setShowNewDeviceDialog(false);
      setNewDeviceInfo(null);
      
      // Clear session check to allow future checks
      if (userEmail) {
        sessionStorage.removeItem(`device_check_${userEmail}`);
      }
    } catch (error) {
      console.error('Error confirming new device:', error);
    }
  };

  const dismissNewDeviceDialog = () => {
    // Stop any ongoing speech
    stopSpeech();
    setShowNewDeviceDialog(false);
    setNewDeviceInfo(null);
    
    // Clear session check to allow future checks
    const userEmail = localStorage.getItem('user_email');
    if (userEmail) {
      sessionStorage.removeItem(`device_check_${userEmail}`);
    }
  };

  // Function to clear session check (for internal use)
  const clearSessionCheck = () => {
    const userEmail = localStorage.getItem('user_email');
    if (userEmail) {
      sessionStorage.removeItem(`device_check_${userEmail}`);
      setLastCheckTime(0);
    }
  };

  return {
    isChecking,
    newDeviceInfo,
    showNewDeviceDialog,
    checkForNewDevice,
    confirmNewDevice,
    dismissNewDeviceDialog,
    clearSessionCheck
  };
} 