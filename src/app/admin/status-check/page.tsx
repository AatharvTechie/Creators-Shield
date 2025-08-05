'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function AdminStatusCheckPage() {
  const [isChecking, setIsChecking] = useState(false);

  const handleStatusCheck = async () => {
    setIsChecking(true);
    // Simulate status check
    setTimeout(() => setIsChecking(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Status Check</h1>
          <p className="text-muted-foreground">
            Monitor system health and service status
          </p>
        </div>
        <Button onClick={handleStatusCheck} disabled={isChecking}>
          {isChecking ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Status
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">Operational</div>
            <p className="text-xs text-muted-foreground">
              All systems normal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Services</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">Operational</div>
            <p className="text-xs text-muted-foreground">
              Response time: 45ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Service</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">Degraded</div>
            <p className="text-xs text-muted-foreground">
              High latency detected
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
          <CardDescription>
            Detailed status of all platform services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Authentication Service</p>
                  <p className="text-sm text-muted-foreground">Uptime: 99.9%</p>
                </div>
              </div>
              <span className="text-sm text-green-600">Operational</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Content Scanning</p>
                  <p className="text-sm text-muted-foreground">Processing: 1,234 items</p>
                </div>
              </div>
              <span className="text-sm text-green-600">Operational</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Queue: 45 pending</p>
                </div>
              </div>
              <span className="text-sm text-yellow-600">Degraded</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 