'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { suspendCreator, liftSuspension, deactivateCreator } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Shield, 
  UserCheck, 
  UserX, 
  Mail, 
  Calendar, 
  Globe, 
  Smartphone,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';


const platformIcons = {
  youtube: <Globe className="h-6 w-6" />,
  instagram: <Smartphone className="h-6 w-6" />,
  tiktok: <Smartphone className="h-6 w-6" />,
  web: <Globe className="h-6 w-6" />,
  tiktok: <div className="h-6 w-6" /> // Placeholder for TikTok
} as const;

export default function DetailsClientPage({ initialUser }: { initialUser: User | undefined }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | undefined>(initialUser);
  const [isLoading, setIsLoading] = useState<'suspend' | 'lift' | 'deactivate' | null>(null);
  const [suspensionDialogOpen, setSuspensionDialogOpen] = useState(false);
  const [suspensionAction, setSuspensionAction] = useState<'suspend' | 'deactivate'>('suspend');

  // This effect keeps the local state in sync if the server component re-renders with new props
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);
  
  const handleAction = async (action: 'suspend' | 'lift' | 'deactivate') => {
      if (!user) return;
      setIsLoading(action);

      let result;
      let newStatus: User['status'] = user.status;

      switch(action) {
          case 'suspend':
              result = await suspendCreator(user.id);
              newStatus = 'suspended';
              break;
          case 'lift':
              result = await liftSuspension(user.id);
              newStatus = 'active';
              break;
          case 'deactivate':
              result = await deactivateCreator(user.id);
              newStatus = 'deactivated';
              break;
      }
      
      if (result && result.success) {
          toast({ title: "Action Successful", description: result.message });
          
          // Voice notification removed - future implementation
          
          // Optimistically update the UI
          setUser(prev => prev ? { ...prev, status: newStatus } : undefined);
      } else {
          toast({ variant: 'destructive', title: "Action Failed", description: result?.message || 'An unknown error occurred.' });
      }

      setIsLoading(null);
  };

  const handleSuspensionDialog = (action: 'suspend' | 'deactivate') => {
    setSuspensionAction(action);
    setSuspensionDialogOpen(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading user details...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><AlertTriangle className="h-3 w-3 mr-1" />Suspended</Badge>;
      case 'deactivated':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="h-3 w-3 mr-1" />Deactivated</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* User Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                {user.displayName || user.name || 'Unknown User'}
              </CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(user.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Joined:</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Status:</span>
                <span className="capitalize">{user.status}</span>
              </div>
              {user.lastLogin && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Last Login:</span>
                  <span>{new Date(user.lastLogin).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Platforms */}
      {user.connectedPlatforms && user.connectedPlatforms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Connected Platforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.connectedPlatforms.map((platform, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {platformIcons[platform as keyof typeof platformIcons] || <Globe className="h-3 w-3" />}
                  {platform}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Actions
          </CardTitle>
          <CardDescription>
            Manage user account status and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Suspend Button */}
            <Button
              onClick={() => handleAction('suspend')}
              disabled={isLoading !== null || user.status === 'suspended'}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoading === 'suspend' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              Suspend (24h)
            </Button>

            {/* Lift Suspension Button */}
            <Button
              onClick={() => handleAction('lift')}
              disabled={isLoading !== null || user.status !== 'suspended'}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoading === 'lift' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Lift Suspension
            </Button>

            {/* Deactivate Button */}
            <Button
              onClick={() => handleAction('deactivate')}
              disabled={isLoading !== null || user.status === 'deactivated'}
              variant="destructive"
              className="flex items-center gap-2"
            >
              {isLoading === 'deactivate' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserX className="h-4 w-4" />
              )}
              Deactivate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
