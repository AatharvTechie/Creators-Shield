
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/star-rating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import type { Feedback, FeedbackReply } from '@/lib/types';
import { getAllFeedbackFromDb, approveDisconnectForCreator, isDisconnectApproved } from '@/lib/feedback-store';
import { replyToFeedbackAction, approveDisconnectAction, markFeedbackAsReadAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { ClientFormattedDate } from '@/components/ui/client-formatted-date';

export default function AdminFeedbackPage() {
  const [feedbackList, setFeedbackList] = React.useState<Feedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = React.useState<Feedback | null>(null);
  const [isReplying, setIsReplying] = React.useState(false);
  const [replyMessage, setReplyMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const [filterType, setFilterType] = React.useState<'all' | 'general' | 'disconnect-request'>('all');

  const loadFeedback = React.useCallback(async () => {
    try {
      const data = await getAllFeedbackFromDb();
      setFeedbackList(JSON.parse(JSON.stringify(data)));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to load feedback',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const handleReplySubmit = async () => {
    if (!selectedFeedback || !replyMessage.trim()) return;
    setIsReplying(true);

    // Use _id as feedbackId from the API response
    const feedbackId = selectedFeedback._id || selectedFeedback.feedbackId;
    const creatorId = selectedFeedback.creatorId; // Use the actual creatorId from the feedback data

    if (!creatorId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Creator ID not found.',
      });
      setIsReplying(false);
      return;
    }

    if (!feedbackId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Feedback ID not found.',
      });
      setIsReplying(false);
      return;
    }

    console.log('Admin feedback - Sending reply:', { feedbackId, creatorId, message: replyMessage });

    const result = await replyToFeedbackAction(feedbackId, replyMessage, creatorId);

    if (result.success) {
      toast({
        title: 'Reply Sent',
        description: result.message,
      });
      setReplyMessage('');
      setSelectedFeedback(null);
      loadFeedback();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message,
      });
    }
    setIsReplying(false);
  };
  
  const handleApproveDisconnect = async (creatorEmail: string) => {
    if (!selectedFeedback) return;
    
    const creatorId = selectedFeedback.creatorId;
    if (!creatorId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Creator ID not found.',
      });
      return;
    }

    const result = await approveDisconnectAction(creatorId, creatorEmail);
    
    if (result.success) {
      toast({ 
        title: 'Disconnect Approved', 
        description: result.message 
      });
    setSelectedFeedback(null);
    loadFeedback();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message,
      });
    }
  };

  const handleMarkAsRead = async (feedbackId: string) => {
    if (!selectedFeedback) return;
    
      const actualFeedbackId = feedbackId || selectedFeedback._id || selectedFeedback.feedbackId;
    const creatorId = selectedFeedback.creatorId;
    const feedbackTitle = selectedFeedback.title;
      
      if (!creatorId) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Creator ID not found.',
        });
        return;
      }

      if (!actualFeedbackId) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Feedback ID not found.',
        });
        return;
      }
      
      console.log('Admin feedback - Marking as read:', { feedbackId: actualFeedbackId, creatorId });
    
    const result = await markFeedbackAsReadAction(actualFeedbackId, creatorId, feedbackTitle);

    if (result.success) {
        // Update the status in the list instantly
        setFeedbackList(prev => prev.map(item => {
          const itemId = item._id || item.feedbackId;
          const selectedId = selectedFeedback._id || selectedFeedback.feedbackId;
          return itemId === selectedId ? { ...item, status: 'admin_read' } : item;
        }));
        toast({ 
        title: 'Marked as Read', 
        description: result.message 
        });
    } else {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: result.message 
      });
    }
  };

  const getStatus = (item: Feedback) => {
    if (item.status === 'replied') {
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Replied</Badge>;
    }
    if (item.status === 'admin_read') {
        return <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">Read</Badge>;
    }
    return <Badge variant="default" className="bg-amber-50 text-amber-700 border-amber-200">New</Badge>;
  }

  if (isLoading) {
    return (
       <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
       </div>
    )
  }

  // Defensive: ensure feedbackList is always an array
  const safeFeedbackList = Array.isArray(feedbackList) ? feedbackList : [];
  // Filter feedbacks by type
  const filteredFeedbackList = safeFeedbackList.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'general') return item.type === 'general';
    if (filterType === 'disconnect-request') return item.type === 'disconnect-request';
    return true;
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Creator Feedback</CardTitle>
          <CardDescription>
            Review and respond to feedback submitted by creators.
          </CardDescription>
        </CardHeader>
        <CardContent>
         <div className="mb-4 flex gap-2">
           <Button variant={filterType === 'all' ? 'default' : 'outline'} onClick={() => setFilterType('all')}>All</Button>
           <Button variant={filterType === 'general' ? 'default' : 'outline'} onClick={() => setFilterType('general')}>General</Button>
           <Button variant={filterType === 'disconnect-request' ? 'default' : 'outline'} onClick={() => setFilterType('disconnect-request')}>Disconnect/Change Requests</Button>
         </div>
          {feedbackList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creator</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedbackList.map((item, index) => (
                  <TableRow
                    key={item._id || item.feedbackId || index}
                    className="cursor-pointer hover:bg-gray-50 transition-all duration-200"
                    onClick={() => {
                      console.log('Admin feedback - Selected feedback data:', item);
                      setSelectedFeedback(item);
                    }}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 ring-2 ring-purple-100">
                          <AvatarImage src={item.avatar || item.creator?.youtubeChannel?.thumbnail} data-ai-hint="profile picture" />
                          <AvatarFallback className="bg-purple-100 text-purple-700 font-medium"></AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-gray-800">{item.creatorName || item.creator?.name || 'Unknown Creator'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-800 py-4">{item.title}</TableCell>
                    <TableCell className="py-4">
                      {getStatus(item)}
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">{item.type === 'disconnect-request' ? 'Disconnect Request' : 'General'}</span>
                    </TableCell>
                    <TableCell className="text-right text-gray-500 py-4">
                      <ClientFormattedDate dateString={item.createdAt || item.timestamp} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>There is no feedback to display yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedFeedback?.title || 'Feedback Details'}</DialogTitle>
            <DialogDescription>
              Feedback from {selectedFeedback?.creatorName || selectedFeedback?.creator?.name || 'Unknown Creator'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="flex items-center gap-2">
                <span className="font-semibold">Rating:</span>
                <StarRating rating={selectedFeedback?.rating ?? 0} readOnly />
            </div>
             <div className="flex items-center gap-2">
                <span className="font-semibold">Tags:</span>
                <div className="flex flex-wrap gap-1">
                {(() => {
                  const tags = selectedFeedback?.tags;
                  if (!tags) return [];
                  
                  // Handle both string and array formats
                  const tagsArray = Array.isArray(tags) 
                    ? tags 
                    : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []);
                  
                  return tagsArray.map(tag => (
                    <Badge key={tag} variant={tag === 'disconnect' ? 'destructive' : 'secondary'}>
                      {tag}
                    </Badge>
                  ));
                })()}
                </div>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Description:</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedFeedback?.description || 'No description provided'}</p>
            </div>
            {selectedFeedback?.message && (
               <div>
                <h4 className="font-semibold mb-1">Private Message to Admin:</h4>
                <p className="text-sm text-muted-foreground italic bg-muted/50 p-2 rounded-md">{selectedFeedback.message}</p>
              </div>
            )}
            <div className="space-y-2">
                <Label htmlFor="reply" className="text-sm font-medium text-gray-700">Your Reply</Label>
                <Textarea 
                  id="reply" 
                  placeholder="Type your professional response here..." 
                  value={replyMessage} 
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="min-h-[120px] resize-none border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500">Your reply will be sent to the creator and they will be notified.</p>
            </div>
            {selectedFeedback?.type === 'disconnect-request' && (
              <div className="mt-6 flex gap-3">
                <Button 
                  variant="destructive" 
                  onClick={() => handleApproveDisconnect(selectedFeedback.creatorEmail || selectedFeedback.creator?.email || '')}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Approve Disconnect
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleMarkAsRead(selectedFeedback._id || selectedFeedback.feedbackId || '')}
                  className="border-gray-300 text-white-700 transition-all duration-200"
                >
                  Mark as Read
                </Button>
              </div>
            )}
            {selectedFeedback?.type !== 'disconnect-request' && (
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => selectedFeedback && handleMarkAsRead(selectedFeedback._id || selectedFeedback.feedbackId || '')}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Mark as Read
                </Button>
              </div>
            )}
            {selectedFeedback?.response && selectedFeedback.response.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3 text-gray-800">Reply History</h4>
                <div className="space-y-4">
                  {selectedFeedback.response.map((reply: FeedbackReply) => (
                    <div key={reply.replyId} className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <p className="font-medium text-purple-800">{reply.adminName}</p>
                          <span className="text-xs text-purple-600">•</span>
                          <span className="text-xs text-purple-600"><ClientFormattedDate dateString={reply.timestamp} /></span>
                        </div>
                        <p className="text-sm text-purple-900 whitespace-pre-wrap leading-relaxed">{reply.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="border-t pt-4">
            <DialogClose asChild>
                <Button variant="ghost" className="text-gray-600 hover:text-gray-800">
                  Cancel
                </Button>
            </DialogClose>
            <Button 
              onClick={handleReplySubmit} 
              disabled={isReplying || !replyMessage.trim()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {isReplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
