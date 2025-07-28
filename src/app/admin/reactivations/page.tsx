
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getReactivationRequests } from '@/lib/users-store';
import { ClientFormattedDate } from "@/components/ui/client-formatted-date";
import { ReactivationRequestsClient } from "./reactivation-requests-client";

export default async function ReactivationsPage() {
  const reactivationRequests = await getReactivationRequests();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reactivation Requests</h1>
        <p className="text-muted-foreground">
          Review and manage reactivation requests from deactivated creators.
        </p>
      </div>

      <ReactivationRequestsClient initialRequests={reactivationRequests} />
    </div>
  );
}
