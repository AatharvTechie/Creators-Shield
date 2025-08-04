'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SecureAccountDialog } from '@/components/secure-account-dialog';
import { NewDeviceAlertDialog } from '@/components/new-device-alert-dialog';

export default function TestSecureDialog() {
  const [showSecureDialog, setShowSecureDialog] = useState(false);
  const [showDeviceDialog, setShowDeviceDialog] = useState(false);

  const testDeviceInfo = {
    device: 'Test iPhone',
    browser: 'Safari 19.0',
    os: 'iOS 19.0',
    location: 'Mumbai, Maharashtra, India',
    ipAddress: '192.168.1.100',
    loginTime: new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Secure Account Dialog</h1>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Components</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Secure Account Dialog</h3>
                <p className="text-gray-600 mb-4">
                  Test the password change functionality with email verification
                </p>
                <Button 
                  onClick={() => setShowSecureDialog(true)}
                  variant="destructive"
                >
                  Open Secure Account Dialog
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">New Device Alert Dialog</h3>
                <p className="text-gray-600 mb-4">
                  Test the new device detection dialog with secure account option
                </p>
                <Button 
                  onClick={() => setShowDeviceDialog(true)}
                  variant="outline"
                >
                  Open New Device Dialog
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Features Tested</h2>
            <ul className="space-y-2 text-gray-700">
              <li>✅ Dialog doesn't reopen after "This Was Me" is clicked</li>
              <li>✅ Secure Account button opens password change dialog</li>
              <li>✅ Email verification code functionality</li>
              <li>✅ Password hashing and database update</li>
              <li>✅ Automatic logout after password change</li>
              <li>✅ Voice alerts for new device detection</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Secure Account Dialog */}
      <SecureAccountDialog 
        isOpen={showSecureDialog} 
        onClose={() => setShowSecureDialog(false)} 
      />

      {/* New Device Alert Dialog */}
      <NewDeviceAlertDialog 
        isOpen={showDeviceDialog} 
        onClose={() => setShowDeviceDialog(false)} 
        deviceInfo={testDeviceInfo}
      />
    </div>
  );
} 