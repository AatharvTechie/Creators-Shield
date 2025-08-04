'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Smartphone, Monitor, Globe, MapPin, Clock, Shield } from 'lucide-react';
import { voiceNotification, VoiceNotificationData } from '@/lib/voice-notification';
import { SecureAccountDialog } from './secure-account-dialog';

interface NewDeviceAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deviceInfo: {
    device: string;
    browser: string;
    os: string;
    location: string;
    ipAddress: string;
    loginTime: string;
  };
}

export function NewDeviceAlertDialog({ isOpen, onClose, deviceInfo }: NewDeviceAlertDialogProps) {
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [showSecureDialog, setShowSecureDialog] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);

  // Reset confirmation state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setHasConfirmed(false);
      setHasSpoken(false);
    }
  }, [isOpen]);

  // Speak alert when dialog opens (only once)
  useEffect(() => {
    if (isOpen && deviceInfo && !hasSpoken) {
      const speakAlert = async () => {
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
          setHasSpoken(true); // Mark as spoken to prevent repeated alerts
        } catch (error) {
          console.error('Voice alert failed:', error);
        }
      };
      
      speakAlert();
    }
  }, [isOpen, deviceInfo, hasSpoken]);

  const handleClose = () => {
    setHasConfirmed(true);
    console.log('🔍 Dialog: User clicked "This Was Me" - closing dialog and stopping voice');
    onClose();
  };

  const handleSecureAccount = () => {
    setHasConfirmed(true); // Mark as confirmed when user takes action
    console.log('🔍 Dialog: User clicked "Secure Account" - closing dialog and stopping voice');
    setShowSecureDialog(true);
  };

  const handleSecureDialogClose = () => {
    setShowSecureDialog(false);
    // Close the main dialog after secure dialog is closed
    onClose();
  };

  const getDeviceIcon = () => {
    if (deviceInfo.device.toLowerCase().includes('iphone') || deviceInfo.device.toLowerCase().includes('mobile')) {
      return <Smartphone className="h-6 w-6" />;
    } else if (deviceInfo.device.toLowerCase().includes('tablet') || deviceInfo.device.toLowerCase().includes('ipad')) {
      return <Monitor className="h-6 w-6" />;
    } else {
      return <Monitor className="h-6 w-6" />;
    }
  };

  const getDeviceColor = () => {
    if (deviceInfo.device.toLowerCase().includes('iphone') || deviceInfo.device.toLowerCase().includes('mobile')) {
      return 'bg-blue-500';
    } else if (deviceInfo.device.toLowerCase().includes('tablet') || deviceInfo.device.toLowerCase().includes('ipad')) {
      return 'bg-purple-500';
    } else {
      return 'bg-green-500';
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${getDeviceColor()} text-white`}>
                {getDeviceIcon()}
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">New Device Login Detected</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  We detected a login from a new device to your account
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Security Warning */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-red-300">Security Alert</span>
              </div>
              <p className="text-sm text-red-200">
                If this wasn't you, please change your password immediately and contact support.
              </p>
            </div>

            {/* Device Information */}
            <div className="bg-muted/20 border border-border rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Device Information
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Device:</span>
                  <span className="text-sm font-medium text-foreground">{deviceInfo.device}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Browser:
                  </span>
                  <Badge variant="secondary" className="text-xs">{deviceInfo.browser}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">OS:</span>
                  <Badge variant="outline" className="text-xs">{deviceInfo.os}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Location:
                  </span>
                  <span className="text-sm font-medium text-foreground">{deviceInfo.location}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">IP Address:</span>
                  <span className="text-xs font-mono bg-muted px-2 py-1 rounded">{deviceInfo.ipAddress}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Login Time:
                  </span>
                  <span className="text-sm font-medium text-foreground">{deviceInfo.loginTime}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={handleClose}
                className="flex-1"
              >
                This Was Me
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleSecureAccount}
                className="flex-1"
              >
                Secure Account
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              You can manage all your active devices in Settings → Active Devices
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Secure Account Dialog */}
      <SecureAccountDialog 
        isOpen={showSecureDialog} 
        onClose={handleSecureDialogClose} 
      />
    </>
  );
} 