'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShieldBan, Trash2, Youtube, Instagram, Globe, ShieldCheck, Loader2 } from "lucide-react";
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import { suspendCreator, liftSuspension, deactivateCreator } from './actions';
import type { User } from '@/lib/types';
import { ClientFormattedDate } from '@/components/ui/client-formatted-date';
import { SuspensionDialog } from '@/components/ui/suspension-dialog';


const platformIcons = {
    youtube: <Youtube className="h-6 w-6 text-red-500" />,
    instagram: <Instagram className="h-6 w-6 text-pink-500" />,
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

  const handleEmailSend = async (emailData: { subject: string; html: string }) => {
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: user?.email,
          subject: emailData.subject,
          html: emailData.html,
          from: process.env.SENDER_EMAIL || process.env.BREVO_SMTP_USERNAME
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, message: 'Failed to send email' };
    }
  };


  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Creator Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The requested creator could not be found.</p>
          <Button asChild variant="link" className="px-0">
            <Link href="/admin/users">Return to Creator Management</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar} data-ai-hint="profile picture" />
            <AvatarFallback>{user.displayName?.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.displayName}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/users">Back to Creator List</Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Creator Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Creator ID</span>
              <span className="font-mono text-sm">{user.id}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Join Date</span>
              <span>
                {user.joinDate ? (
                  <ClientFormattedDate dateString={user.joinDate} />
                ) : (
                  <span className="text-muted-foreground">Not available</span>
                )}
              </span>
            </div>
            {user.youtubeChannelId && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">YouTube Channel ID</span>
                  <span className="font-mono text-sm">{user.youtubeChannelId}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">YouTube Channel</span>
                  <Link 
                    href={`https://youtube.com/channel/${user.youtubeChannelId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-mono text-sm"
                  >
                    View Channel
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connected Platforms</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            {user.platformsConnected && user.platformsConnected.length > 0 ? user.platformsConnected.map(platform => (
              <div key={platform} className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                {platformIcons[platform as keyof typeof platformIcons]}
                <span className="capitalize">{platform}</span>
              </div>
            )) : <p className="text-muted-foreground">No platforms connected.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
          <CardDescription>Perform administrative actions on this creator account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-yellow-200/50 rounded-lg bg-yellow-50/10 dark:bg-yellow-500/10">
            <div>
              <h3 className="font-semibold">Suspend Creator</h3>
              <p className="text-sm text-muted-foreground">
                {user.status === 'suspended' 
                  ? 'Creator is currently suspended and cannot login for 24 hours from suspension time.'
                  : 'Temporarily disable account for 24 hours. Creator will see a warning dialog with countdown timer when trying to login.'
                }
              </p>
            </div>
            {user.status === 'suspended' ? (
                <Button variant="outline" onClick={() => handleAction('lift')} disabled={isLoading === 'lift'}>
                    {isLoading === 'lift' ? <Loader2 className="mr-2 animate-spin" /> : <ShieldCheck className="mr-2" />}
                    Lift Suspension
                </Button>
            ) : (
                <Button variant="outline" onClick={() => handleSuspensionDialog('suspend')} disabled={isLoading === 'suspend' || user.status === 'deactivated'}>
                    <ShieldBan className="mr-2" />
                    Suspend with Email
                </Button>
            )}
          </div>
          <div className="flex items-center justify-between p-4 border-destructive/50 rounded-lg bg-destructive/10">
            <div>
              <h3 className="font-semibold text-destructive">Deactivate Creator</h3>
              <p className="text-sm text-muted-foreground">This will log the creator out. They must request reactivation to log in again.</p>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => handleSuspensionDialog('deactivate')}
              disabled={isLoading === 'deactivate' || user.status === 'deactivated'}
            >
                    {user.status === 'deactivated' ? 'Deactivated' : (
                        <>
                        <Trash2 className="mr-2" />
                        Deactivate with Email
                        </>
                    )}
                </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suspension Dialog */}
      {user && (
        <SuspensionDialog
          user={user}
          action={suspensionAction}
          onAction={handleAction}
          onEmailSend={handleEmailSend}
          isOpen={suspensionDialogOpen}
          onOpenChange={setSuspensionDialogOpen}
        />
      )}
    </div>
  );
}
