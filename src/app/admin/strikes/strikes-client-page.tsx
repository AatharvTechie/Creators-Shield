
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { Check, X, Loader2, Eye } from "lucide-react";
import Link from 'next/link';
import type { Report } from '@/lib/types';
import { approveAndEmailAction, denyAndEmailAction } from './actions';
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


export function StrikesClientPage({ initialStrikes }: { initialStrikes: Report[] }) {
  const { toast } = useToast();
  const [strikes, setStrikes] = useState<Report[]>(initialStrikes);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const [approvingStrike, setApprovingStrike] = useState<Report | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  
  const [denyingStrike, setDenyingStrike] = useState<Report | null>(null);
  const [denialReason, setDenialReason] = useState('');

  const handleDenyAndEmail = async () => {
    if (!denyingStrike) return;
    setLoadingAction(`deny-${denyingStrike.id}`);

    const result = await denyAndEmailAction({ strikeId: denyingStrike.id, reason: denialReason });

    if (result.success) {
      toast({ title: "Action Successful", description: result.message });
      setStrikes(prev => prev.map(s => s.id === denyingStrike.id ? { ...s, status: 'rejected' } : s));
      setDenyingStrike(null);
      setDenialReason('');
    } else {
      toast({ variant: "destructive", title: "Action Failed", description: result.message });
    }
    setLoadingAction(null);
  }

  const handleApproveAndEmail = async () => {
    if (!approvingStrike) return;
    setLoadingAction(`approve-${approvingStrike.id}`);

    const result = await approveAndEmailAction({ strikeId: approvingStrike.id, templateId: selectedTemplate });

    if (result.success) {
        toast({ title: "Action Successful", description: result.message });
        setStrikes(prev => prev.map(s => s.id === approvingStrike.id ? { ...s, status: 'approved' } : s));
        setApprovingStrike(null);
    } else {
        toast({ variant: "destructive", title: "Action Failed", description: result.message });
    }
    setLoadingAction(null);
  };
  
  const getApprovalPreviewHtml = () => {
    if (!approvingStrike) return '';
    
    // Use unified template for preview
    const emailData = {
      firstName: approvingStrike.creatorName.split(' ')[0] || approvingStrike.creatorName,
      actionType: 'Copyright Strike Request',
      status: 'Approved',
      timestamp: new Date().toLocaleString(),
      referenceId: `STRIKE-${Date.now()}`,
      customMessage: `Your copyright strike request for the content at ${approvingStrike.suspectUrl} has been reviewed and approved by our team. We will now proceed with the formal takedown process with the concerned platform.`,
      dashboardLink: 'https://creatorshield.com/dashboard',
      reportLink: 'https://creatorshield.com/reports'
    };
    
    const emailContent = unifiedEmailTemplates.generateTemplate(emailData);
    return emailContent.html;
  };
  
  const getDenialPreviewHtml = () => {
    if (!denyingStrike) return '';
    
    // Use unified template for denial preview
    const emailData = {
      firstName: denyingStrike.creatorName.split(' ')[0] || denyingStrike.creatorName,
      actionType: 'Copyright Strike Request',
      status: 'Rejected',
      timestamp: new Date().toLocaleString(),
      referenceId: `STRIKE-${Date.now()}`,
      customMessage: `After careful review, we have decided not to proceed with your takedown request for ${denyingStrike.suspectUrl}. Reason: ${denialReason || 'No specific reason provided.'} If you have new information or believe this decision was made in error, you can resubmit your request with additional details.`,
      dashboardLink: 'https://creatorshield.com/dashboard',
      reportLink: 'https://creatorshield.com/reports'
    };
    
    const emailContent = unifiedEmailTemplates.generateTemplate(emailData);
    return emailContent.html;
  };


  const renderTable = (data: Report[], showActions: boolean) => {
    if (data.length === 0) {
      return (
        <div className="text-center py-10 text-muted-foreground">
          <p>There are no requests in this category.</p>
        </div>
      );
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Creator</TableHead>
            <TableHead>Infringing URL</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((strike) => (
            <TableRow key={strike.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={strike.creatorAvatar} data-ai-hint="profile picture" />
                    <AvatarFallback>{strike.creatorName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{strike.creatorName}</span>
                </div>
              </TableCell>
               <TableCell>
                <a href={strike.suspectUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block max-w-xs">
                    {strike.suspectUrl}
                </a>
              </TableCell>
              <TableCell><ClientFormattedDate dateString={strike.submitted} /></TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {showActions && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setApprovingStrike(strike)}
                        disabled={!!loadingAction}
                      >
                        {loadingAction === `approve-${strike.id}` ? <Loader2 className="animate-spin" /> : <Check />}
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDenyingStrike(strike)}
                        disabled={!!loadingAction}
                      >
                         {loadingAction === `deny-${strike.id}` ? <Loader2 className="animate-spin" /> : <X />}
                        Deny
                      </Button>
                    </>
                  )}
                  <Button asChild variant="ghost" size="icon">
                    <Link href={`/admin/strikes/${strike.id}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Details</span>
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  const pendingStrikes = strikes.filter(s => s.status === 'in_review' || s.status === 'action_taken');
  const approvedStrikes = strikes.filter(s => s.status === 'approved');
  const rejectedStrikes = strikes.filter(s => s.status === 'rejected');


  return (
    <>
      <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
              Pending
              <Badge variant="secondary" className="ml-2">{pendingStrikes.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">
              Approved
              <Badge variant="default" className="ml-2">{approvedStrikes.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
              Rejected
              <Badge variant="destructive" className="ml-2">{rejectedStrikes.length}</Badge>
          </TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-4">
          {renderTable(pendingStrikes, true)}
          </TabsContent>
          <TabsContent value="approved" className="mt-4">
          {renderTable(approvedStrikes, false)}
          </TabsContent>
          <TabsContent value="rejected" className="mt-4">
          {renderTable(rejectedStrikes, false)}
          </TabsContent>
      </Tabs>
      
      {/* Approval Dialog */}
      <Dialog open={!!approvingStrike} onOpenChange={(open) => { if(!open) setApprovingStrike(null) }}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Approve Strike Request & Notify Creator</DialogTitle>
              <DialogDescription>
                Choose an email template to send to {approvingStrike?.creatorName}. The request will be approved upon sending.
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
              <Button variant="ghost" onClick={() => setApprovingStrike(null)}>Cancel</Button>
              <Button onClick={handleApproveAndEmail} disabled={!!loadingAction}>
                {loadingAction && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Approve and Send Email
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Denial Dialog */}
       <Dialog open={!!denyingStrike} onOpenChange={(open) => { if(!open) setDenyingStrike(null) }}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Deny Strike Request & Notify Creator</DialogTitle>
              <DialogDescription>
                Provide a reason for denying the request and notify {denyingStrike?.creatorName}.
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
              <Button variant="ghost" onClick={() => setDenyingStrike(null)}>Cancel</Button>
              <Button onClick={handleDenyAndEmail} disabled={!!loadingAction || !denialReason} variant="destructive">
                {loadingAction && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Deny and Send Email
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

    