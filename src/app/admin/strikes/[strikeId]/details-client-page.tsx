
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, X, Loader2, User, Calendar, Link as LinkIcon, FileText, Send } from "lucide-react";
import Link from 'next/link';
import type { Report } from '@/lib/types';
import { denyAndEmailAction, approveAndEmailAction } from '../actions';
import { ClientFormattedDate } from '@/components/ui/client-formatted-date';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { unifiedEmailTemplates } from '@/lib/unified-email-templates';


export default function StrikeDetailsClientPage({ initialStrike }: { initialStrike: Report | undefined }) {
  const { toast } = useToast();
  const [strike, setStrike] = useState<Report | undefined>(initialStrike);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  const [isApproving, setIsApproving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  
  const [isDenying, setIsDenying] = useState(false);
  const [denialReason, setDenialReason] = useState('');

  useEffect(() => {
    setStrike(initialStrike);
  }, [initialStrike]);


  const handleApprove = async () => {
    if (!strike) return;
    setLoadingAction('approve');
    
    const result = await approveAndEmailAction({ strikeId: strike.id, templateId: selectedTemplate });

    if (result.success) {
      toast({
        title: "Action Successful",
        description: result.message,
      });
      // Optimistically update status
      setStrike(prev => prev ? { ...prev, status: 'approved' } : undefined);
      setIsApproving(false); // Close dialog
    } else {
      toast({
          variant: 'destructive',
          title: "Action Failed",
          description: result.message
      });
    }
    
    setLoadingAction(null);
  };
  
  const handleDeny = async () => {
    if (!strike) return;
    setLoadingAction('deny');
    
    const result = await denyAndEmailAction({ strikeId: strike.id, reason: denialReason });

    if (result.success) {
      toast({
        title: "Action Successful",
        description: result.message,
      });
      // Optimistically update status
      setStrike(prev => prev ? { ...prev, status: 'rejected' } : undefined);
      setIsDenying(false);
      setDenialReason('');
    } else {
      toast({
          variant: 'destructive',
          title: "Action Failed",
          description: result.message
      });
    }
    
    setLoadingAction(null);
  };

  const getApprovalPreviewHtml = () => {
    if (!strike) return '';
    
    // Use unified template for preview
    const emailData = {
      firstName: strike.creatorName.split(' ')[0] || strike.creatorName,
      actionType: 'Copyright Strike Request',
      status: 'Approved',
      timestamp: new Date().toLocaleString(),
      referenceId: `STRIKE-${Date.now()}`,
      customMessage: `Your copyright strike request for the content at ${strike.suspectUrl} has been reviewed and approved by our team. We will now proceed with the formal takedown process with the concerned platform.`,
      dashboardLink: 'https://creatorshield.com/dashboard',
      reportLink: 'https://creatorshield.com/reports'
    };
    
    const emailContent = unifiedEmailTemplates.generateTemplate(emailData);
    return emailContent.html;
  };
  
  const getDenialPreviewHtml = () => {
    if (!strike) return '';
    
    // Use unified template for denial preview
    const emailData = {
      firstName: strike.creatorName.split(' ')[0] || strike.creatorName,
      actionType: 'Copyright Strike Request',
      status: 'Rejected',
      timestamp: new Date().toLocaleString(),
      referenceId: `STRIKE-${Date.now()}`,
      customMessage: `After careful review, we have decided not to proceed with your takedown request for ${strike.suspectUrl}. Reason: ${denialReason || 'No specific reason provided.'} If you have new information or believe this decision was made in error, you can resubmit your request with additional details.`,
      dashboardLink: 'https://creatorshield.com/dashboard',
      reportLink: 'https://creatorshield.com/reports'
    };
    
    const emailContent = unifiedEmailTemplates.generateTemplate(emailData);
    return emailContent.html;
  }

  const getStatusVariant = (status?: Report['status']) => {
    switch (status) {
      case 'approved':
      case 'action_taken':
        return 'default';
      case 'rejected': return 'destructive';
      case 'in_review':
      default: return 'secondary';
    }
  };

  const getStatusText = (status?: Report['status']) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'action_taken': return 'Action Taken';
      case 'in_review':
      default: return 'In Review';
    }
  };

  if (!strike) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Strike Request Not Found</CardTitle>
          <CardDescription>The requested strike could not be found. It may have been deleted.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/admin/strikes">
              <ArrowLeft className="mr-2" />
              Back to Strike Requests
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Strike Request Details</h1>
          <Button asChild variant="outline">
              <Link href="/admin/strikes">
                <ArrowLeft className="mr-2" />
                Back to List
              </Link>
            </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Report ID: {strike.id.substring(0, 18)}...</CardTitle>
                <CardDescription>Review the details of the report submitted by the creator.</CardDescription>
              </div>
              <Badge variant={getStatusVariant(strike.status)} className="text-base">
                  {getStatusText(strike.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
              <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={strike.creatorAvatar} data-ai-hint="profile picture" />
                    <AvatarFallback>{strike.creatorName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                      <p className="text-sm text-muted-foreground">Creator Name</p>
                      <p className="font-medium">{strike.creatorName}</p>
                  </div>
              </div>
              <div className="flex items-center gap-4">
                  <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div>
                      <p className="text-sm text-muted-foreground">Submission Date</p>
                      <p className="font-medium">
                        <ClientFormattedDate dateString={strike.submitted || strike.createdAt} options={{ year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' }} />
                      </p>
                  </div>
              </div>
              <div className="flex items-center gap-4">
                  <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div>
                      <p className="text-sm text-muted-foreground">Platform</p>
                      <p className="font-medium">{strike.platform}</p>
                  </div>
              </div>
              <div className="flex items-center gap-4">
                  <LinkIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div>
                      <p className="text-sm text-muted-foreground">Original Content</p>
                      <a href={strike.originalContentUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline break-all">
                          {strike.originalContentTitle}
                      </a>
                  </div>
              </div>
              <div className="flex items-center gap-4">
                  <LinkIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div>
                      <p className="text-sm text-muted-foreground">Infringing URL</p>
                      <a href={strike.suspectUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline break-all">
                          {strike.suspectUrl}
                      </a>
                  </div>
              </div>
              <div className="flex items-center gap-4">
                  <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div>
                      <p className="text-sm text-muted-foreground">Reason</p>
                      <p className="font-medium">{strike.reason}</p>
                  </div>
              </div>
          </CardContent>
          {strike.status === 'in_review' && (
              <CardFooter className="border-t pt-6 flex justify-end gap-2">
                  <Button
                      variant="outline"
                      onClick={() => setIsApproving(true)}
                      disabled={!!loadingAction}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setIsDenying(true)}
                      disabled={!!loadingAction}
                    >
                      {loadingAction === 'deny' ? <Loader2 className="animate-spin" /> : <X />}
                      Deny
                    </Button>
              </CardFooter>
          )}
          {strike.status === 'approved' && strike.platform === 'youtube' && (
              <CardFooter className="border-t pt-6 flex justify-end gap-2">
                  <Button asChild>
                      <Link href={`/admin/youtube-consent/${strike.id}`}>
                          <Send className="mr-2 h-4 w-4" />
                          Submit to YouTube
                      </Link>
                  </Button>
              </CardFooter>
          )}
        </Card>
      </div>
      
      {/* Approval Dialog */}
      <Dialog open={isApproving} onOpenChange={setIsApproving}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Approve Strike Request & Notify Creator</DialogTitle>
              <DialogDescription>
                Choose an email template to send to {strike?.creatorName}. The request will be approved upon sending.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="template">Email Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">
                      Standard Approval Notice
                    </SelectItem>
                    <SelectItem value="urgent">
                      Urgent - Priority Action
                      </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Email Preview</Label>
                <div
                  className="h-64 overflow-y-auto rounded-md border bg-muted/50 p-4 text-sm"
                  dangerouslySetInnerHTML={{ __html: getApprovalPreviewHtml() }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsApproving(false)}>Cancel</Button>
              <Button onClick={handleApprove} disabled={loadingAction === 'approve'}>
                {loadingAction === 'approve' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Approve and Send Email
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Denial Dialog */}
       <Dialog open={isDenying} onOpenChange={setIsDenying}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Deny Strike Request & Notify Creator</DialogTitle>
              <DialogDescription>
                Provide a reason for denying the request and notify {strike?.creatorName}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Denial</Label>
                <Textarea
                  id="reason"
                  placeholder="e.g., The provided content does not appear to be a direct copy of your work..."
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Email Preview</Label>
                <div
                  className="h-64 overflow-y-auto rounded-md border bg-muted/50 p-4 text-sm"
                  dangerouslySetInnerHTML={{ __html: getDenialPreviewHtml() }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDenying(false)}>Cancel</Button>
              <Button onClick={handleDeny} disabled={loadingAction === 'deny' || !denialReason} variant="destructive">
                {loadingAction === 'deny' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Deny and Send Email
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

    