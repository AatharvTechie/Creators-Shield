'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { StarRating } from '@/components/ui/star-rating';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getFeedbackForUser, addFeedback, markFeedbackAsRead } from '@/lib/feedback-store';
import { ClientFormattedDate } from '@/components/ui/client-formatted-date';
import { useDashboardData } from '../dashboard-context';

const feedbackFormSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  rating: z.number().min(1, { message: 'Please provide a rating.' }).max(5),
  tags: z.string().optional(), // will refine below
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }),
  message: z.string().optional(), // always optional
  type: z.enum(['general', 'disconnect-request']),
}).superRefine((data, ctx) => {
  if (data.type === 'general' && (!data.tags || data.tags.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Tags are required for general feedback.',
      path: ['tags'],
    });
  }
});

function getUserEmail(session: any): string | null {
  let email = session?.user?.email;
  
  // Try localStorage user_email first (most reliable)
  if (!email && typeof window !== "undefined") {
    email = localStorage.getItem("user_email");
    console.log('🔍 getUserEmail - From localStorage user_email:', email);
  }
  
  // Try JWT token decode
  if (!email && typeof window !== "undefined") {
    const token = localStorage.getItem("creator_jwt");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        email = decoded.email;
        console.log('🔍 getUserEmail - From JWT token:', email);
      } catch (e) {
        console.error('JWT decode error:', e);
      }
    }
  }
  
  // Try dashboard data
  if (!email && typeof window !== "undefined") {
    try {
      const dashboardData = localStorage.getItem("dashboard_data");
      if (dashboardData) {
        const data = JSON.parse(dashboardData);
        email = data?.user?.email;
        console.log('🔍 getUserEmail - From dashboard data:', email);
      }
    } catch (e) {
      console.error('Dashboard data parse error:', e);
    }
  }
  
  console.log('🔍 getUserEmail - Final email:', email);
  return email;
}

// Define the feedback item type
interface FeedbackItem {
  _id?: string;
  feedbackId?: string;
  title: string;
  rating: number;
  tags: string;
  description: string;
  message?: string;
  type: string;
  status: string;
  createdAt?: string;
  timestamp?: string;
  creatorRead?: boolean;
  reply?: {
    message: string;
    repliedAt: string;
  } | null;
}

export default function FeedbackPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const dashboardData = useDashboardData();
  const [isLoading, setIsLoading] = React.useState(false);
  const [history, setHistory] = React.useState<FeedbackItem[]>([]);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [disconnectRequest, setDisconnectRequest] = React.useState(false);
  const [hasNewReplies, setHasNewReplies] = React.useState(false);
  const [expandedReplies, setExpandedReplies] = React.useState<Set<string>>(new Set());

  const form = useForm<z.infer<typeof feedbackFormSchema>>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      title: '',
      rating: 1,
      tags: '',
      description: '',
      message: '',
      type: 'general',
    },
  });

  const feedbackType = form.watch('type');

  // Set userEmail only on client
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = getUserEmail(session);
      if (email) {
        setUserEmail(email);
      } else {
        // Try to get email from dashboard context
        if (dashboardData?.user?.email) {
          setUserEmail(dashboardData.user.email);
        }
      }
    }
  }, [session, dashboardData]);

  React.useEffect(() => {
    if (disconnectRequest) {
      form.setValue('title', 'Request to disconnect/change my YouTube channel');
      form.setValue('description', 'I have connected the wrong YouTube channel and need admin approval to disconnect or change it. Please review my request.');
      form.setValue('tags', 'disconnect, youtube, admin');
      form.setValue('rating', 5);
    } else {
      form.reset({
        title: '',
        rating: 1,
        tags: '',
        description: '',
        message: '',
        type: 'general',
      });
    }
  }, [disconnectRequest, form]);

  const loadHistory = React.useCallback(async () => {
    if (!userEmail) return;
    try {
      console.log('Creator feedback - Loading history for email:', userEmail);
    const userFeedback = await getFeedbackForUser(userEmail);
      console.log('Creator feedback - Loaded feedback data:', userFeedback);
      
      // Check for new replies
      const hasNewRepliesInData = userFeedback.some((item: FeedbackItem) => 
        item.status === 'replied' && !item.creatorRead
      );
      
      if (hasNewRepliesInData && !hasNewReplies) {
        setHasNewReplies(true);
        toast({
          title: 'New Reply Received!',
          description: 'You have received a new reply from admin.',
        });
      }
      
    setHistory(userFeedback);
    } catch (error) {
      console.error('Error loading feedback history:', error);
    }
  }, [userEmail, hasNewReplies, toast]);

  React.useEffect(() => {
    if (userEmail) loadHistory();
  }, [userEmail, loadHistory]);

  // Add real-time refresh mechanism
  React.useEffect(() => {
    if (!userEmail) return;

    // Refresh immediately when component mounts
    loadHistory();

    // Set up interval for periodic refresh
    const interval = setInterval(() => {
      loadHistory();
    }, 10000); // Refresh every 10 seconds

    // Refresh when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadHistory();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userEmail, loadHistory]);

  async function onSubmit(values: z.infer<typeof feedbackFormSchema>) {
    setIsLoading(true);
    if (!userEmail) {
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: 'User not logged in. Please refresh the page and try again.' 
      });
      setIsLoading(false);
      return;
    }

    console.log('Submitting feedback with email:', userEmail);

    const feedbackData = {
      creatorEmail: userEmail,
      creatorName: session?.user?.name || 'Sample Creator',
      title: values.title,
      rating: values.rating,
      tags: values.tags,
      description: values.description,
      message: values.message || '',
      type: values.type,
      status: 'pending',
    };

    try {
      const result = await addFeedback(feedbackData);
      if (result.success) {
        toast({ title: 'Feedback Submitted!', description: 'Thank you for helping us improve CreatorShield.' });
        form.reset({
          title: '',
          rating: 1,
          tags: '',
          description: '',
          message: '',
          type: 'general',
        });
        setDisconnectRequest(false);
        await loadHistory();
      } else {
        toast({ variant: 'destructive', title: 'Submission Failed', description: result.message });
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Submission Failed', description: err?.message || 'Unknown error' });
    }
    setIsLoading(false);
  }

  const handleMarkAsRead = async (feedbackId: string) => {
    if (!userEmail) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not logged in.' });
      return;
    }
    try {
      const creatorId = dashboardData?.user?.uid;
      console.log('Creator feedback - Marking as read:', { feedbackId, creatorId });
      
      await markFeedbackAsRead(feedbackId, creatorId);
      await loadHistory();
      
      // Reset new replies indicator if this was the last unread reply
      const remainingUnread = history.filter((item: FeedbackItem) => 
        item.status === 'replied' && !item.creatorRead && item._id !== feedbackId
      );
      if (remainingUnread.length === 0) {
        setHasNewReplies(false);
      }
      
      toast({ title: 'Marked as Read', description: 'Feedback marked as read successfully.' });
    } catch (error) {
      console.error('Error marking feedback as read:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to mark feedback as read.' });
    }
  };

  const toggleReplyExpansion = (feedbackId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(feedbackId)) {
        newSet.delete(feedbackId);
      } else {
        newSet.add(feedbackId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Send Feedback</CardTitle>
          <CardDescription>Have a suggestion or encountered an issue? Let us know.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col md:flex-row gap-2">
            <Button 
              variant={disconnectRequest ? 'default' : 'outline'} 
              onClick={() => {
              setDisconnectRequest(true);
              form.setValue('type', 'disconnect-request');
              }}
            >
              Request to disconnect/change my YouTube channel
            </Button>
            <Button 
              variant={!disconnectRequest ? 'default' : 'outline'} 
              onClick={() => {
              setDisconnectRequest(false);
              form.setValue('type', 'general');
              }}
            >
              General Feedback
            </Button>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Form {...form}>
              {/* Hidden Field for Feedback Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => <input type="hidden" {...field} value={feedbackType} />}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Rating <span style={{color: 'red'}}>*</span></FormLabel>
                    <FormControl>
                      <StarRating rating={field.value} setRating={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title <span style={{color: 'red'}}>*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Feature request for..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tags
                      {form.getValues('type') === 'general'
                        ? <span style={{color: 'red'}}> *</span>
                        : <span style={{color: '#888', fontWeight: 400}}> (optional)</span>}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., analytics, bug, feature" {...field} />
                    </FormControl>
                    <FormDescription>Comma-separated tags to categorize your feedback.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description <span style={{color: 'red'}}>*</span></FormLabel>
                    <FormControl>
                      <Textarea placeholder="Please describe your feedback in detail..." className="resize-y" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Message to Admin <span style={{color: '#888', fontWeight: 400}}> (optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="Private message for admin..." className="resize-y" {...field} />
                    </FormControl>
                    <FormDescription>This message will only be visible to administrators.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Feedback
              </Button>
            </Form>
          </form>
        </CardContent>
      </Card>

      {/* Feedback History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CardTitle>My Feedback History</CardTitle>
              </div>
              <CardDescription>View your past submissions and responses from our team.</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loadHistory()}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div>
              <div className="grid grid-cols-3 gap-2 px-2 pb-1 text-xs font-normal text-muted-foreground">
                <span className="text-left">Type</span>
                <span className="text-center">Status</span>
                <span className="text-right">Submitted Date</span>
              </div>
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div key={`${item._id || item.feedbackId || index}`} className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <span className="font-semibold capitalize text-left text-gray-800">{item.type.replace('-', ' ')}</span>
                      <div className="flex justify-center items-center gap-2">
                        {(item.status === 'admin_read' || item.creatorRead) && (
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium border border-emerald-200">Read</span>
                        )}
                        {item.status === 'replied' && (
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium border border-purple-200">Replied</span>
                        )}
                        {item.status === 'pending' && (
                          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium border border-amber-200">Pending</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 text-right"><ClientFormattedDate dateString={item.createdAt || item.timestamp || ''} /></span>
                    </div>
                    
                    {/* Feedback Content */}
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <h4 className="font-medium text-gray-800 mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                    </div>

                    {/* Reply Section */}
                    {item.status === 'replied' && item.reply && item.reply.message && (
                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleReplyExpansion(item._id || item.feedbackId || '')}
                          className="w-full justify-between bg-blue-to-r from-purple-50 to-indigo-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-indigo-100 hover:border-purple-300 transition-all duration-200"
                        >
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            <span className="font-medium">View Admin Reply</span>
                            {!item.creatorRead && (
                              <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" title="New reply" />
                            )}
                          </div>
                          {expandedReplies.has(item._id || item.feedbackId || '') ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        
                        {expandedReplies.has(item._id || item.feedbackId || '') && (
                          <div className="mt-3 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span className="font-semibold text-purple-800">Admin Reply</span>
                              <span className="text-xs text-purple-600">•</span>
                              <span className="text-xs text-purple-600"><ClientFormattedDate dateString={item.reply.repliedAt} /></span>
                            </div>
                            <p className="text-sm text-purple-900 whitespace-pre-wrap leading-relaxed mb-3">{item.reply.message}</p>
                            {!item.creatorRead && (
                              <Button 
                                size="sm" 
                                onClick={() => handleMarkAsRead(item._id || item.feedbackId || '')}
                                className="bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
                              >
                                Mark as Read
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>You have not submitted any feedback yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}