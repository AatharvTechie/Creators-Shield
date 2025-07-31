
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, LogIn } from "lucide-react";
import type { DashboardData } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ClientFormattedDate } from "@/components/ui/client-formatted-date";
import { useAuth } from '@/context/auth-context';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from '@/lib/firebase';
import { InteractiveLoader, AutoConnectLoader } from '@/components/ui/loader';
import { useDashboardData } from './dashboard-context';

export default function DashboardClientPage({ initialData }: { initialData: DashboardData | null }) {
    const { user, loading: authLoading } = useAuth();
    const { activity, autoConnecting, loading: dashboardLoading } = useDashboardData();
    const isLoading = authLoading && !initialData;

    // Show auto-connect loader when connecting channels
    if (autoConnecting) {
        return <AutoConnectLoader message="Connecting your YouTube channel..." />;
    }

    // Show full screen loader when dashboard is loading
    if (dashboardLoading) {
        return <InteractiveLoader show={true} />;
    }

    if (isLoading) {
        return <InteractiveLoader show={true} />;
    }
  
    if (!user) {
        return (
           <Card className="text-center w-full max-w-lg mx-auto">
              <CardHeader>
                  <CardTitle>Welcome to CreatorShield</CardTitle>
                  <CardDescription>To get started, please sign in.</CardDescription>
              </CardHeader>
              <CardContent>
                  <Button onClick={async () => {
                      const provider = new GoogleAuthProvider();
                      await signInWithPopup(auth, provider);
                  }}>
                      <LogIn className="mr-2 h-5 w-5" />
                      Sign In with Google
                  </Button>
              </CardContent>
          </Card>
        )
    }

    return (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>A log of recent automated scans and actions for your connected account.</CardDescription>
            </CardHeader>
            <CardContent>
               {activity && activity.length > 0 ? (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {activity.map((activity, index) => (
                        <TableRow key={index}>
                        <TableCell className="font-medium">{activity.type}</TableCell>
                        <TableCell>{activity.details}</TableCell>
                        <TableCell>
                            <Badge variant={activity.variant as any}>{activity.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right"><ClientFormattedDate dateString={activity.date} /></TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
               ) : (
                <div className="text-center py-10 text-muted-foreground">
                    <p>No recent activity to display.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    );
}
