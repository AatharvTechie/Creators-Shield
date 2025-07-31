'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Youtube, 
  Instagram, 
  Music, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  Settings
} from 'lucide-react';
import { formatNumber } from '@/lib/auth-utils';

interface PlatformData {
  platform: string;
  status: 'connected' | 'pending_disable' | 'disabled';
  connectedAt?: string;
  data?: any;
}

interface PlatformStatus {
  activePlatform: string | null;
  platforms: PlatformData[];
}

export default function IntegrationsPage() {
  const [platformStatus, setPlatformStatus] = useState<PlatformStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [disableReason, setDisableReason] = useState('');
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);

  useEffect(() => {
    fetchPlatformStatus();
    
    // Handle OAuth callback results
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    
    if (success === 'instagram_connected') {
      alert('Instagram connected successfully!');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      let errorMessage = 'Failed to connect Instagram';
      switch (error) {
        case 'user_denied':
          errorMessage = 'Instagram connection was cancelled';
          break;
        case 'invalid_state':
          errorMessage = 'Security validation failed';
          break;
        case 'no_code':
          errorMessage = 'Authorization code not received';
          break;
        case 'token_exchange_failed':
          errorMessage = 'Failed to get access token';
          break;
        case 'user_info_failed':
          errorMessage = 'Failed to get user information';
          break;
        case 'no_user':
          errorMessage = 'User session not found';
          break;
        case 'callback_failed':
          errorMessage = 'Connection process failed';
          break;
        case 'config_missing':
          errorMessage = 'Instagram configuration is missing. Please contact support.';
          break;
      }
      alert(errorMessage);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchPlatformStatus = async () => {
    try {
      const token = localStorage.getItem('creator_jwt');
      if (!token) return;

      const response = await fetch('/api/platform/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPlatformStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching platform status:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectPlatform = async () => {
    setConnecting(true);
    try {
      if (selectedPlatform === 'instagram') {
        // For Instagram, use mock data with random account ID
        const randomAccountId = 'test_instagram_' + Math.random().toString(36).substring(7);
        
        const token = localStorage.getItem('creator_jwt');
        if (!token) return;

        const response = await fetch('/api/platform/connect', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            platform: selectedPlatform,
            accountId: randomAccountId
          })
        });

        if (response.ok) {
          await fetchPlatformStatus();
          setShowConnectDialog(false);
          setSelectedPlatform('');
          alert('Instagram connected successfully with mock data!');
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to connect Instagram');
        }
      } else {
        // For YouTube, use manual account ID
        if (!accountId.trim()) return;

        const token = localStorage.getItem('creator_jwt');
        if (!token) return;

        const response = await fetch('/api/platform/connect', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            platform: selectedPlatform,
            accountId: accountId.trim()
          })
        });

        if (response.ok) {
          await fetchPlatformStatus();
          setShowConnectDialog(false);
          setAccountId('');
          setSelectedPlatform('');
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to connect platform');
        }
      }
    } catch (error) {
      console.error('Error connecting platform:', error);
      alert('Failed to connect platform');
    } finally {
      setConnecting(false);
    }
  };

  const requestDisable = async () => {
    if (!disableReason.trim()) return;

    try {
      const token = localStorage.getItem('creator_jwt');
      if (!token) return;

      const response = await fetch('/api/platform/disable-request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          platform: selectedPlatform,
          reason: disableReason.trim()
        })
      });

      if (response.ok) {
        await fetchPlatformStatus();
        setShowDisableDialog(false);
        setDisableReason('');
        setSelectedPlatform('');
        alert('Disable request submitted successfully. Waiting for admin approval.');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit disable request');
      }
    } catch (error) {
      console.error('Error requesting disable:', error);
      alert('Failed to submit disable request');
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return <Youtube className="w-8 h-8 text-red-500" />;
      case 'instagram':
        return <Instagram className="w-8 h-8 text-pink-500" />;
      case 'tiktok':
        return <Music className="w-8 h-8 text-black" />;
      default:
        return <Settings className="w-8 h-8 text-gray-500" />;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return 'YouTube';
      case 'instagram':
        return 'Instagram';
      case 'tiktok':
        return 'TikTok';
      default:
        return platform;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
      case 'pending_disable':
        return <Badge variant="secondary" className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending Disable</Badge>;
      case 'disabled':
        return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />Disabled</Badge>;
      default:
        return <Badge variant="outline">Not Connected</Badge>;
    }
  };

  const getPlatformData = (platform: string, data: any) => {
    if (!data) return null;

    switch (platform) {
      case 'youtube':
        return {
          primary: data.subscribers ? formatNumber(data.subscribers) : 'N/A',
          secondary: data.views ? formatNumber(data.views) : 'N/A',
          primaryLabel: 'Subscribers',
          secondaryLabel: 'Views'
        };
      case 'instagram':
        return {
          primary: data.followers ? formatNumber(data.followers) : 'N/A',
          secondary: data.posts ? formatNumber(data.posts) : 'N/A',
          primaryLabel: 'Followers',
          secondaryLabel: 'Posts'
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Platform Integrations</h1>
          <p className="text-gray-400">Connect your social media platforms to start monitoring your content for copyright violations</p>
        </div>
      </div>

      {/* Platform Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* YouTube */}
        <Card className="bg-white/5 border-gray-600/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getPlatformIcon('youtube')}
                <div>
                  <CardTitle className="text-white">YouTube</CardTitle>
                  <CardDescription className="text-gray-400">
                    Connect your YouTube channel
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge(platformStatus?.platforms.find(p => p.platform === 'youtube')?.status || 'disabled')}
            </div>
          </CardHeader>
          <CardContent>
            {platformStatus?.platforms.find(p => p.platform === 'youtube')?.status === 'connected' ? (
              <div className="space-y-4">
                {(() => {
                  const data = getPlatformData('youtube', platformStatus.platforms.find(p => p.platform === 'youtube')?.data);
                  return data ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-white">{data.primary}</div>
                        <div className="text-sm text-gray-400">{data.primaryLabel}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{data.secondary}</div>
                        <div className="text-sm text-gray-400">{data.secondaryLabel}</div>
                      </div>
                    </div>
                  ) : null;
                })()}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedPlatform('youtube');
                      setShowDisableDialog(true);
                    }}
                  >
                    Request Disable
                  </Button>
                  <Button variant="outline" size="sm">
                    View Analytics
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-gray-400 mb-4">
                  Connect your YouTube channel to track analytics
                </div>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    setSelectedPlatform('youtube');
                    setShowConnectDialog(true);
                  }}
                >
                  <Youtube className="w-4 h-4 mr-2" />
                  Connect YouTube
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instagram */}
        <Card className="bg-white/5 border-gray-600/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getPlatformIcon('instagram')}
                <div>
                  <CardTitle className="text-white">Instagram</CardTitle>
                  <CardDescription className="text-gray-400">
                    Connect your Instagram account (Mock data for testing)
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge(platformStatus?.platforms.find(p => p.platform === 'instagram')?.status || 'disabled')}
            </div>
          </CardHeader>
          <CardContent>
            {platformStatus?.platforms.find(p => p.platform === 'instagram')?.status === 'connected' ? (
              <div className="space-y-4">
                {(() => {
                  const data = getPlatformData('instagram', platformStatus.platforms.find(p => p.platform === 'instagram')?.data);
                  return data ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-white">{data.primary}</div>
                        <div className="text-sm text-gray-400">{data.primaryLabel}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{data.secondary}</div>
                        <div className="text-sm text-gray-400">{data.secondaryLabel}</div>
                      </div>
                    </div>
                  ) : null;
                })()}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedPlatform('instagram');
                      setShowDisableDialog(true);
                    }}
                  >
                    Request Disable
                  </Button>
                  <Button variant="outline" size="sm">
                    View Analytics
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-gray-400 mb-4">
                  Connect your Instagram account to track analytics
                </div>
                <Button 
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  onClick={() => {
                    setSelectedPlatform('instagram');
                    setShowConnectDialog(true);
                  }}
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Connect Instagram
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* TikTok */}
        <Card className="bg-white/5 border-gray-600/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getPlatformIcon('tiktok')}
                <div>
                  <CardTitle className="text-white">TikTok</CardTitle>
                  <CardDescription className="text-gray-400">
                    Connect your TikTok account
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-gray-400 mb-4">
                TikTok integration coming soon
              </div>
              <Button variant="outline" disabled>
                <Music className="w-4 h-4 mr-2" />
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connect Platform Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Connect {getPlatformName(selectedPlatform)}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter your {getPlatformName(selectedPlatform)} account details to connect
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedPlatform === 'instagram' ? (
              <div className="text-center py-4">
                <div className="text-gray-400 mb-4">
                  Click "Connect Instagram" to connect with mock data for testing purposes.
                </div>
                <div className="text-sm text-gray-500">
                  This will generate random Instagram statistics for testing the dashboard.
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="accountId" className="text-white">
                  {selectedPlatform === 'youtube' ? 'Channel ID' : 'Account ID'}
                </Label>
                <Input
                  id="accountId"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder={selectedPlatform === 'youtube' ? 'Enter YouTube Channel ID' : 'Enter Account ID'}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={connectPlatform}
              disabled={connecting || (selectedPlatform !== 'instagram' && !accountId.trim())}
              className={selectedPlatform === 'youtube' ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-pink-500 to-purple-500'}
            >
              {connecting ? 'Connecting...' : `Connect ${getPlatformName(selectedPlatform)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Platform Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Request Platform Disable
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Disabling {getPlatformName(selectedPlatform)} requires admin approval. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason" className="text-white">Reason for Disable</Label>
              <Textarea
                id="reason"
                value={disableReason}
                onChange={(e) => setDisableReason(e.target.value)}
                placeholder="Please explain why you want to disable this platform..."
                className="bg-gray-800 border-gray-600 text-white"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={requestDisable}
              disabled={!disableReason.trim()}
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 