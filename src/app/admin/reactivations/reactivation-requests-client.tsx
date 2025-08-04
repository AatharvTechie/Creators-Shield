
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { approveReactivationRequest, rejectReactivationRequest } from './actions';
import { CheckCircle, XCircle, Loader2, User, Calendar } from 'lucide-react';


interface ReactivationRequest {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  reason?: string;
}

interface ReactivationRequestsClientProps {
  requests: ReactivationRequest[];
}

export function ReactivationRequestsClient({ requests }: ReactivationRequestsClientProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleApprove = async (requestId: string) => {
    setLoading(requestId);
    try {
      const result = await approveReactivationRequest(requestId);
      
      if (result.success) {
        toast({ title: "Request Approved", description: result.message });
        
        // Voice notification removed - future implementation
      } else {
        toast({ variant: 'destructive', title: "Approval Failed", description: result.message });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: "Failed to approve request" });
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (requestId: string, reason?: string) => {
    setLoading(requestId);
    try {
      const result = await rejectReactivationRequest(requestId, reason);
      
      if (result.success) {
        toast({ title: "Request Rejected", description: result.message });
        
        // Voice notification removed - future implementation
      } else {
        toast({ variant: 'destructive', title: "Rejection Failed", description: result.message });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: "Failed to reject request" });
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No reactivation requests found</p>
          </div>
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
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {request.creatorName}
                </CardTitle>
                <CardDescription>{request.creatorEmail}</CardDescription>
              </div>
              {getStatusBadge(request.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Requested on: {new Date(request.requestDate).toLocaleDateString()}
              </div>
              
              {request.reason && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">Reason:</p>
                  <p className="text-sm text-muted-foreground">{request.reason}</p>
                </div>
              )}

              {request.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(request.id)}
                    disabled={loading === request.id}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {loading === request.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(request.id)}
                    disabled={loading === request.id}
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {loading === request.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
