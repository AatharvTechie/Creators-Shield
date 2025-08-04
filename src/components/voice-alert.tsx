'use client';

import { useEffect, useState } from 'react';
import { voiceNotification, VoiceNotificationData } from '@/lib/voice-notification';
import { NewDeviceAlertDialog } from './new-device-alert-dialog';

interface VoiceAlertProps {
  isNewDevice: boolean;
  deviceInfo?: {
    device: string;
    browser: string;
    os: string;
    location: string; 
    ipAddress: string;
  };
}

export function VoiceAlert({ isNewDevice, deviceInfo }: VoiceAlertProps) {
  const [hasSpoken, setHasSpoken] = useState(false);

  useEffect(() => {
    // Only speak if we have all required data, haven't spoken yet, and user hasn't confirmed
    if (isNewDevice && deviceInfo && !hasSpoken && deviceInfo.device && deviceInfo.browser) {
      const speakAlert = async () => {
        try {
          const voiceData: VoiceNotificationData = {
            deviceName: deviceInfo.device,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            location: deviceInfo.location,
            time: new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }),
            ipAddress: deviceInfo.ipAddress
          };

          await voiceNotification.speakNewDeviceAlert(voiceData);
          setHasSpoken(true);
          
          console.log('🔊 Voice alert triggered for new device');
        } catch (error) {
          console.error('Error speaking voice alert:', error);
          // Don't set hasSpoken to true on error, so it can retry
        }
      };

      // Speak immediately without delay
      speakAlert();
    }
  }, [isNewDevice, deviceInfo, hasSpoken]);

  // Don't render anything visible
  return null;
}

export function VoiceAlertProvider({ children }: { children: React.ReactNode }) {
  const [isNewDevice, setIsNewDevice] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Track if we've already processed a device in this session
  const [hasProcessed, setHasProcessed] = useState(false);
  // Track if we've already spoken for this device
  const [hasSpokenForDevice, setHasSpokenForDevice] = useState(false);

  // Check localStorage for confirmation state on mount
  useEffect(() => {
    const confirmed = localStorage.getItem('deviceAlertConfirmed');
    if (confirmed === 'true') {
      setHasConfirmed(true);
      setHasProcessed(true);
      console.log('🔍 Voice Alert: Found confirmed state in localStorage, skipping alerts');
    }
  }, []);

  useEffect(() => {
    // Check if this is a new device login
    const checkNewDevice = () => {
      if (hasProcessed || hasConfirmed || isProcessing) return;
      
      const urlParams = new URLSearchParams(window.location.search);
      const newDevice = urlParams.get('newDevice');
      
      if (newDevice === 'true') {
        setHasProcessed(true);
        setIsProcessing(true);
        setIsNewDevice(true);
        
        // Get device info from localStorage
        const deviceData = localStorage.getItem('newDeviceInfo');
        
        if (deviceData) {
          try {
            const parsed = JSON.parse(deviceData);
            setDeviceInfo(parsed);
            setShowDialog(true);
            console.log('🔍 Voice Alert: New device detected, showing dialog:', parsed);
            
            // Clear URL parameter after processing
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          } catch (error) {
            console.error('Error parsing device info:', error);
          }
        }
      }
    };

    // Also check for new device info in localStorage on mount
    const checkLocalStorage = () => {
      if (hasProcessed || hasConfirmed || isProcessing) return;
      
      const deviceData = localStorage.getItem('newDeviceInfo');
      
      if (deviceData) {
        setHasProcessed(true);
        setIsProcessing(true);
        try {
          const parsed = JSON.parse(deviceData);
          setIsNewDevice(true);
          setDeviceInfo(parsed);
          setShowDialog(true);
          console.log('🔍 Voice Alert: New device from localStorage, showing dialog:', parsed);
          
          // Clear the localStorage after reading
          localStorage.removeItem('newDeviceInfo');
        } catch (error) {
          console.error('Error parsing device info from localStorage:', error);
        }
      }
    };

    // Check for device list changes (from settings page)
    const checkDeviceListChanges = () => {
      if (hasProcessed || hasConfirmed || isProcessing) return;
      
      const deviceData = localStorage.getItem('newDeviceFromSettings');
      
      if (deviceData) {
        setHasProcessed(true);
        setIsProcessing(true);
        try {
          const parsed = JSON.parse(deviceData);
          setIsNewDevice(true);
          setDeviceInfo(parsed);
          setShowDialog(true);
          console.log('🔍 Voice Alert: New device from settings, showing dialog:', parsed);
          
          // Clear the localStorage after reading
          localStorage.removeItem('newDeviceFromSettings');
        } catch (error) {
          console.error('Error parsing device info from settings:', error);
        }
      }
    };

    // Listen for custom new device event
    const handleNewDeviceEvent = (event: CustomEvent) => {
      console.log('🔍 Voice Alert: Custom event received:', event.detail);
      
      // Only process if we haven't already confirmed a device
      if (hasConfirmed || hasProcessed) {
        console.log('🔍 Voice Alert: Already confirmed or processed a device, ignoring new event');
        return;
      }
      
      setIsProcessing(true);
      const deviceInfo = event.detail;
      setIsNewDevice(true);
      setDeviceInfo(deviceInfo);
      setShowDialog(true);
      setHasConfirmed(false); // Reset confirmation state
      console.log('🔍 Voice Alert: New device from custom event, showing dialog:', deviceInfo);
    };

    // Add event listener for custom new device event
    window.addEventListener('newDeviceDetected', handleNewDeviceEvent as EventListener);

    // Immediate check - only run once
    checkNewDevice();
    checkLocalStorage();
    checkDeviceListChanges();
    
    // Set up interval to check for new devices (but only if not already processed)
    const interval = setInterval(() => {
      if (!hasProcessed && !hasConfirmed) {
        checkLocalStorage();
        checkDeviceListChanges();
      }
    }, 3000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('newDeviceDetected', handleNewDeviceEvent as EventListener);
    };
  }, [hasProcessed, hasConfirmed, isProcessing]);

  // Reset confirmation state when a new device is genuinely detected
  useEffect(() => {
    const handleNewDeviceGenuine = (event: CustomEvent) => {
      // Only reset if this is a genuine new device (not auto-refresh)
      if (event.detail && event.detail.isGenuineNewDevice) {
        setHasConfirmed(false);
        setHasProcessed(false);
        localStorage.removeItem('deviceAlertConfirmed');
        console.log('🔍 Voice Alert: Genuine new device detected, resetting confirmation state');
      }
    };

    window.addEventListener('newDeviceDetected', handleNewDeviceGenuine as EventListener);
    
    return () => {
      window.removeEventListener('newDeviceDetected', handleNewDeviceGenuine as EventListener);
    };
  }, []);

  // Add a useEffect to trigger dialog when devices change
  useEffect(() => {
    // Only run this if we have devices, not loading, and haven't already processed them
    if (hasProcessed || hasConfirmed) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const newDevice = urlParams.get('newDevice');
    
    if (newDevice === 'true') {
      console.log('🔍 VoiceAlertProvider: Fallback - URL has newDevice=true but no deviceInfo');
      // Try to get device info from localStorage again
      const deviceData = localStorage.getItem('newDeviceInfo');
      if (deviceData) {
        try {
          const parsed = JSON.parse(deviceData);
          setDeviceInfo(parsed);
          setShowDialog(true);
          console.log('🔍 VoiceAlertProvider: Fallback - Found deviceInfo in localStorage:', parsed);
        } catch (error) {
          console.error('Error parsing device info in fallback:', error);
        }
      }
    }
  }, [hasProcessed, hasConfirmed]);

  // Add debugging for localStorage state
  useEffect(() => {
    const checkLocalStorageDebug = () => {
      const deviceData = localStorage.getItem('newDeviceFromSettings');
      const confirmed = localStorage.getItem('deviceAlertConfirmed');
      console.log('🔍 Voice Alert Debug - newDeviceFromSettings:', deviceData);
      console.log('🔍 Voice Alert Debug - deviceAlertConfirmed:', confirmed);
      console.log('🔍 Voice Alert Debug - hasProcessed:', hasProcessed);
      console.log('🔍 Voice Alert Debug - hasConfirmed:', hasConfirmed);
    };
    
    checkLocalStorageDebug();
  }, [hasProcessed, hasConfirmed]);

  // Manual test function for voice alert
  const testVoiceAlert = async () => {
    try {
      const testData: VoiceNotificationData = {
        deviceName: 'Test iPhone',
        browser: 'Safari 17.0',
        os: 'iOS 17.0',
        location: 'Mumbai, Maharashtra, India',
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        ipAddress: '192.168.1.1'
      };

      await voiceNotification.speakNewDeviceAlert(testData);
      console.log('🔊 Manual voice alert test triggered');
    } catch (error) {
      console.error('Error in manual voice alert test:', error);
    }
  };

  // Manual test function for dialog
  const testDialog = () => {
    const testDeviceInfo = {
      device: 'Test iPhone',
      browser: 'Safari 17.0',
      os: 'iOS 17.0',
      location: 'Mumbai, Maharashtra, India',
      ipAddress: '192.168.1.1',
      loginTime: new Date().toLocaleString()
    };
    
    setDeviceInfo(testDeviceInfo);
    setShowDialog(true);
    setIsNewDevice(true);
    console.log('🔍 Manual dialog test triggered');
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setIsNewDevice(false);
    setDeviceInfo(null);
    setHasConfirmed(true);
    setIsProcessing(false);
    setHasProcessed(true); // Mark as processed to prevent future dialogs
    setHasSpokenForDevice(true); // Mark as spoken to prevent voice alerts
    
    // Persist confirmation state in localStorage
    localStorage.setItem('deviceAlertConfirmed', 'true');
    console.log('🔍 Voice Alert: User confirmed device, alerts disabled for this session');
  };

  return (
    <>
      {children}
      {/* Only render VoiceAlert if user hasn't confirmed */}
      {!hasConfirmed && (
        <VoiceAlert isNewDevice={isNewDevice} deviceInfo={deviceInfo} />
      )}
      
      {/* New Device Alert Dialog */}
      {deviceInfo && (
        <>
          {console.log('🔍 VoiceAlertProvider: Rendering dialog with deviceInfo:', deviceInfo)}
          {console.log('🔍 VoiceAlertProvider: showDialog state:', showDialog)}
          <NewDeviceAlertDialog
            isOpen={showDialog}
            onClose={handleCloseDialog}
            deviceInfo={{
              ...deviceInfo,
              loginTime: new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              })
            }}
          />
        </>
      )}
    </>
  );
} 