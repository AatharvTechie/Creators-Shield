
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Users, FileText } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function AdminStrikeDetailsPage() {
  const params = useParams();
  const strikeId = params?.strikeId as string;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Strike Details</h1>
          <p className="text-muted-foreground">
            View and manage strike information
          </p>
        </div>
        <Button variant="outline">
          Back to Strikes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Strike Information
            </CardTitle>
            <CardDescription>
              Details about this strike
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Strike ID:</span>
              <span className="text-sm text-muted-foreground">{strikeId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant="destructive">Active</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Type:</span>
              <span className="text-sm text-muted-foreground">Copyright Violation</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Issued:</span>
              <span className="text-sm text-muted-foreground">2024-01-15</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              User Information
            </CardTitle>
            <CardDescription>
              Details about the affected user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">User ID:</span>
              <span className="text-sm text-muted-foreground">user_123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm text-muted-foreground">user@example.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Plan:</span>
              <span className="text-sm text-muted-foreground">Premium</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Strikes:</span>
              <span className="text-sm text-muted-foreground">2/3</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
                      <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              Timeline
            </CardTitle>
          <CardDescription>
            History of events related to this strike
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Strike Issued</p>
                <p className="text-xs text-muted-foreground">2024-01-15 14:30:00</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">User Notified</p>
                <p className="text-xs text-muted-foreground">2024-01-15 14:31:00</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Appeal Submitted</p>
                <p className="text-xs text-muted-foreground">2024-01-16 09:15:00</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Extend Strike
        </Button>
        <Button variant="destructive">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Escalate
        </Button>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Contact User
        </Button>
      </div>
    </div>
  );
}
