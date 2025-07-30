'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Users, Clock, CheckCircle } from "lucide-react";

export default function StatusCheckPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState<any>(null);
  const [lastCheck, setLastCheck] = useState<string>('');

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/check-status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setStatusData(data);
      setLastCheck(new Date().toLocaleString());
      
      if (data.success) {
        toast({ 
          title: "Status Check Complete", 
          description: `Found ${data.suspendedUsers} suspended and ${data.deactivatedUsers} deactivated users.` 
        });
      } else {
        toast({ 
          variant: 'destructive', 
          title: "Status Check Failed", 
          description: data.error || 'Unknown error occurred.' 
        });
      }
    } catch (error) {
      console.error('Status check error:', error);
      toast({ 
        variant: 'destructive', 
        title: "Error", 
        description: "Failed to check statuses." 
      });
    } finally {
      setLoading(false);
    }
  };

  const processStatuses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/check-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setLastCheck(new Date().toLocaleString());
      
      if (data.success) {
        toast({ 
          title: "Processing Complete", 
          description: `Processed ${data.totalProcessed} users. ${data.reactivatedUsers.length} reactivated, ${data.activatedUsers.length} activated.` 
        });
      } else {
        toast({ 
          variant: 'destructive', 
          title: "Processing Failed", 
          description: data.error || 'Unknown error occurred.' 
        });
      }
    } catch (error) {
      console.error('Status processing error:', error);
      toast({ 
        variant: 'destructive', 
        title: "Error", 
        description: "Failed to process statuses." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Status Check & Management</h1>
          <p className="text-muted-foreground">
            Monitor and process user suspension and deactivation statuses
          </p>
        </div>
        <Button 
          onClick={checkStatus} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Check Status
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Current Status Counts
            </CardTitle>
            <CardDescription>
              Number of users in different status states
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">Suspended Users</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">
                    {statusData.suspendedUsers}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-red-500" />
                    <span className="font-medium">Deactivated Users</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {statusData.deactivatedUsers}
                  </span>
                </div>
                {lastCheck && (
                  <p className="text-sm text-muted-foreground">
                    Last checked: {lastCheck}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Click "Check Status" to see current counts
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Process Statuses
            </CardTitle>
            <CardDescription>
              Automatically process expired suspensions and reactivations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This will automatically:
              </p>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Reactivate users whose suspension has expired</li>
                <li>• Activate users whose reactivation approval time has expired</li>
                <li>• Send email notifications to affected users</li>
              </ul>
              <Button 
                onClick={processStatuses} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Process Statuses
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            Understanding the automatic status management system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-600">Suspension Management</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Users suspended for 24 hours</li>
                <li>• Automatic reactivation when time expires</li>
                <li>• Email notification sent upon reactivation</li>
                <li>• Countdown timer shown during suspension</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-red-600">Deactivation Management</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Users deactivated by admin action</li>
                <li>• 24-hour delay after reactivation approval</li>
                <li>• Automatic activation when delay expires</li>
                <li>• Email notification sent upon activation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 