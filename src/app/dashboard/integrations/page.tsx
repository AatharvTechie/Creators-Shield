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
  Settings,
  MessageCircle,
  Hand,
  Sparkles,
  Info
} from 'lucide-react';
import { formatNumber } from '@/lib/auth-utils';
import { useRouter } from 'next/navigation';

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
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showComingSoonDialog, setShowComingSoonDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPlatformStatus();
    cleanupInstagramConnections();
    
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

  const cleanupInstagramConnections = async () => {
    try {
      const token = localStorage.getItem('creator_jwt');
      if (!token) return;

      await fetch('/api/platform/cleanup-instagram', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error cleaning up Instagram connections:', error);
    }
  };

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
        // Filter out Instagram from connected platforms since it's coming soon
        if (data.data && data.data.platforms) {
          data.data.platforms = data.data.platforms.filter((platform: any) => platform.platform !== 'instagram');
          // Update active platform if it was Instagram
          if (data.data.activePlatform === 'instagram') {
            data.data.activePlatform = data.data.platforms.find((p: any) => p.status === 'connected')?.platform || null;
          }
        }
        setPlatformStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching platform status:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectPlatform = async () => {
    if (!accountId.trim() && selectedPlatform !== 'instagram') return;

    setConnecting(true);
    try {
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
        alert(`${getPlatformName(selectedPlatform)} connected successfully!`);
      } else {
        const error = await response.json();
        alert(error.error || `Failed to connect ${getPlatformName(selectedPlatform)}`);
      }
    } catch (error) {
      console.error('Error connecting platform:', error);
      alert(`Failed to connect ${getPlatformName(selectedPlatform)}`);
    } finally {
      setConnecting(false);
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
    <div className="space-y-4 sm:space-y-6">


      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Platform Integrations</h1>
          <p className="text-gray-400 text-sm sm:text-base">Connect your social media platforms to start monitoring your content for copyright violations</p>
        </div>
      </div>

      {/* Connected Platforms Section */}
      {platformStatus?.platforms.some(p => p.status === 'connected') ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Connected Platforms</h2>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {platformStatus.platforms.filter(p => p.status === 'connected').map((platform) => (
              <Card key={platform.platform} className="bg-green-500/5 border-green-500/30 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {getPlatformIcon(platform.platform)}
                      <div>
                        <CardTitle className="text-white text-sm sm:text-base">{getPlatformName(platform.platform)}</CardTitle>
                        <CardDescription className="text-green-300 text-xs sm:text-sm">
                          {platform.connectedAt ? `Connected on ${new Date(platform.connectedAt).toLocaleDateString()}` : 'Connected'}
                        </CardDescription>
                        {platform.data && (
                          <div className="text-xs text-green-200 mt-1">
                            {platform.platform === 'youtube' && platform.data.title && (
                              <span>Channel: {platform.data.title}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-600 text-white text-xs">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-400 hover:bg-red-500/10 text-xs"
                      onClick={() => {
                        setSelectedPlatform(platform.platform);
                        setShowDisableDialog(true);
                      }}
                    >
                      Disconnect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="bg-gray-500/5 border-gray-600/30 shadow-lg">
          <CardHeader className="p-4 sm:p-6">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">No Platforms Connected</div>
              <p className="text-gray-500 text-sm">Connect your social media platforms to start monitoring your content for copyright violations</p>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-sm"
                onClick={() => {
                  setSelectedPlatform('youtube');
                  setShowConnectDialog(true);
                }}
              >
                <Youtube className="w-4 h-4 mr-2" />
                Connect YouTube Channel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}



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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={connectPlatform}
              disabled={connecting || !accountId.trim()}
              className="bg-red-600 hover:bg-red-700"
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
              Disconnect {getPlatformName(selectedPlatform)}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Submit a request to disconnect your {getPlatformName(selectedPlatform)} account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-yellow-300 mb-2">Disconnection Process</div>
                  <div className="text-yellow-200 text-sm">
                    To disconnect your {getPlatformName(selectedPlatform)} account, please submit a request through our feedback system. This helps us ensure account security and prevent accidental disconnections.
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-yellow-600 hover:bg-yellow-700"
              onClick={() => {
                setShowDisableDialog(false);
                router.push('/dashboard/feedback?from=integrations&platform=' + selectedPlatform);
              }}
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Coming Soon Dialog */}
      <Dialog open={showComingSoonDialog} onOpenChange={setShowComingSoonDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Coming Soon!
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              We're working hard to bring you amazing new features!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="text-yellow-400 font-medium mb-2">🚀 Future Features</div>
              <div className="text-sm text-gray-400 space-y-2">
                <p>• Instagram integration for content monitoring</p>
                <p>• TikTok platform support</p>
                <p>• Advanced analytics and insights</p>
                <p>• Multi-platform dashboard</p>
                <p>• Enhanced copyright detection</p>
              </div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-400">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Stay Connected!</span>
              </div>
              <p className="text-xs text-blue-300 mt-1">
                We'll notify you as soon as these features are available. Keep an eye on your dashboard for updates!
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setShowComingSoonDialog(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Got it! 👍
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 