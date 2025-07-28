
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClientFormattedDate } from "@/components/ui/client-formatted-date";
import { CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { approveReactivationRequest, rejectReactivationRequest } from './actions';

interface ReactivationRequest {
  id: string;
  name: string;
  email: string;
  requestedAt: Date | string;
  reason: string;
  explanation: string;
  creatorId: string;
}

interface ReactivationRequestsClientProps {
  initialRequests: ReactivationRequest[];
}

export function ReactivationRequestsClient({ initialRequests }: ReactivationRequestsClientProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  // Debug logging
  console.log('Current requests state:', requests);
  console.log('ReactivationRequestsClient received:', initialRequests);

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    setLoading(requestId);
    
    try {
      // Find the request to get creatorId
      const request = requests.find(r => r.id === requestId);
      console.log('🔍 Found request:', request);
      
      if (!request || !request.creatorId) {
        console.error('❌ Creator ID not found:', { requestId, request });
        throw new Error('Creator ID not found for this request');
      }
      
      console.log('🔄 Processing action:', { action, requestId, creatorId: request.creatorId });
      
      const result = action === 'approve' 
        ? await approveReactivationRequest(request.creatorId)
        : await rejectReactivationRequest(request.creatorId);
      
      console.log('📊 Action result:', result);
      
      if (result.success) {
        toast({
          title: "Success", 
          description: result.message 
        });
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast({
          title: "Error", 
          description: result.message 
        });
      }
    } catch (error) {
      console.error('❌ Action failed:', error);
      toast({
        title: "Error", 
        description: "An error occurred while processing the request." 
      });
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      return date;
    }
    if (date instanceof Date) {
      return date.toISOString();
    }
    return new Date().toISOString(); // fallback
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Reactivation Requests</CardTitle>
          <CardDescription>
            There are currently no pending reactivation requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            When creators submit reactivation requests, they will appear here for review.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{request.name}</CardTitle>
                <CardDescription>{request.email}</CardDescription>
              </div>
              <Badge variant="secondary">
                <ClientFormattedDate dateString={formatDate(request.requestedAt)} />
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Reason for Reactivation</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {request.reason}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Detailed Explanation</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {request.explanation}
              </p>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => handleAction(request.id, 'approve')}
                disabled={loading === request.id}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading === request.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Approve
              </Button>
              
              <Button
                onClick={() => handleAction(request.id, 'reject')}
                disabled={loading === request.id}
                variant="destructive"
              >
                {loading === request.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
