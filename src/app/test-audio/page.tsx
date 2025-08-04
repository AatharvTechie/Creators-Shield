'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Volume2, Mail, AlertTriangle, Play, Stop, Speaker, X } from 'lucide-react';
import { useAudioNotification } from '@/hooks/use-audio-notification';

export default function TestAudioPage() {
  const [creatorName, setCreatorName] = useState('Test User');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState('');
  
  const { 
    isSupported, 
    isEnabled, 
    playEmailNotification, 
    playSystemAlertNotification,
    toggleAudioNotifications 
  } = useAudioNotification({ enabled: false }); // Start disabled by default

  const handleTestEmail = async () => {
    setIsLoading(true);
    setTestResult('');
    
    try {
      const response = await fetch('/api/test-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: 'email', creatorName })
      });
      
      const data = await response.json();
      setTestResult(`✅ ${data.message}`);
      
      // Also trigger client-side notification
      playEmailNotification(creatorName);
      
    } catch (error) {
      setTestResult('❌ Error testing email notification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSystem = async () => {
    setIsLoading(true);
    setTestResult('');
    
    try {
      const response = await fetch('/api/test-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: 'system', creatorName })
      });
      
      const data = await response.json();
      setTestResult(`✅ ${data.message}`);
      
      // Also trigger client-side notification
      playSystemAlertNotification(creatorName, 'This is a test system alert from CreatorShield');
      
    } catch (error) {
      setTestResult('❌ Error testing system notification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectTest = () => {
    playEmailNotification(creatorName);
    setTestResult('✅ Direct client-side notification triggered');
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-500">❌ Audio Not Supported</CardTitle>
            <CardDescription>
              Your browser doesn't support Web Speech API. Please try Chrome, Firefox, or Safari.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <Card className="bg-white/10 backdrop-blur-lg border-gray-600/30">
          <CardHeader>
                         <CardTitle className="text-white flex items-center gap-2">
               <Speaker className="w-6 h-6 text-blue-400" />
               Audio Notification Test
             </CardTitle>
            <CardDescription className="text-gray-300">
              Test the audio notification system in real-time
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-white">
                  Audio {isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <Button 
                variant={isEnabled ? "destructive" : "default"}
                size="sm"
                onClick={toggleAudioNotifications}
                className="text-xs"
              >
                {isEnabled ? 'Disable Audio' : 'Enable Audio'}
              </Button>
            </div>
            
            {/* Enable Audio Notice */}
            {!isEnabled && (
              <div className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-yellow-400">Audio Disabled</span>
                </div>
                <p className="text-xs text-gray-300 mt-1">
                  Click "Enable Audio" above to test notifications with your name: "{creatorName}"
                </p>
              </div>
            )}

            {/* Creator Name Input */}
            <div className="space-y-2">
              <Label htmlFor="creatorName" className="text-white">Creator Name</Label>
              <Input
                id="creatorName"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="Enter your name for testing"
                className="bg-white/10 border-gray-600 text-white"
              />
            </div>

            {/* Test Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={handleTestEmail}
                disabled={isLoading || !isEnabled}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="w-4 h-4 mr-2" />
                Test Email Notification
              </Button>
              
              <Button
                onClick={handleTestSystem}
                disabled={isLoading || !isEnabled}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Test System Alert
              </Button>
              
              <Button
                onClick={handleDirectTest}
                disabled={!isEnabled}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Direct Test
              </Button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-white">Testing notification...</span>
              </div>
            )}

            {/* Test Result */}
            {testResult && (
              <div className="p-4 bg-white/10 rounded-lg border border-gray-600">
                <p className="text-white">{testResult}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/30">
              <h3 className="text-white font-semibold mb-2">🎯 How to Test:</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• <strong>Step 1:</strong> Click "Enable Audio" button above</li>
                <li>• <strong>Step 2:</strong> Enter your name in the input field</li>
                <li>• <strong>Step 3:</strong> Click any test button to hear audio</li>
                <li>• <strong>Step 4:</strong> You should hear: "{creatorName}, you have received a new notification from Creator Shield"</li>
                <li>• Make sure your browser tab is active and volume is up</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 