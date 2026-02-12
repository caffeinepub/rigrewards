import { useState } from 'react';
import { useIsCallerAdmin, useGetAllDepositRequests } from '../../hooks/useQueries';
import AccessDeniedScreen from '../../components/AccessDeniedScreen';
import DepositApprovalDialog from '../../features/admin/components/DepositApprovalDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Clock, CheckCircle, XCircle } from 'lucide-react';
import { DepositStatus, type DepositRequest } from '../../backend';

function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function getStatusBadge(status: DepositStatus) {
  if (status === DepositStatus.pending) {
    return (
      <Badge variant="outline" className="gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  }
  if (status === DepositStatus.approved) {
    return (
      <Badge className="gap-1 bg-green-600 hover:bg-green-700">
        <CheckCircle className="h-3 w-3" />
        Approved
      </Badge>
    );
  }
  if (status === DepositStatus.rejected) {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Rejected
      </Badge>
    );
  }
  return null;
}

export default function AdminDepositsPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: requests, isLoading: requestsLoading } = useGetAllDepositRequests();
  const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  const pendingRequests = requests?.filter((r) => r.status === DepositStatus.pending) || [];
  const approvedRequests = requests?.filter((r) => r.status === DepositStatus.approved) || [];
  const rejectedRequests = requests?.filter((r) => r.status === DepositStatus.rejected) || [];

  const handleApprove = (request: DepositRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const RequestsTable = ({ requests }: { requests: DepositRequest[] }) => {
    if (requests.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No requests in this category.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="text-sm">{formatTimestamp(request.timestamp)}</TableCell>
                <TableCell className="font-mono text-xs max-w-[200px] truncate">
                  {request.user.toString()}
                </TableCell>
                <TableCell className="font-bold">{request.amount.toString()}</TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell>
                  {request.status === DepositStatus.pending && (
                    <Button size="sm" onClick={() => handleApprove(request)}>
                      Approve
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage deposit requests and user credits</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deposit Requests</CardTitle>
          <CardDescription>Review and approve user deposit requests</CardDescription>
        </CardHeader>
        <CardContent>
          {requestsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading requests...</div>
          ) : (
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Pending ({pendingRequests.length})
                </TabsTrigger>
                <TabsTrigger value="approved" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Approved ({approvedRequests.length})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="gap-2">
                  <XCircle className="h-4 w-4" />
                  Rejected ({rejectedRequests.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="mt-6">
                <RequestsTable requests={pendingRequests} />
              </TabsContent>
              <TabsContent value="approved" className="mt-6">
                <RequestsTable requests={approvedRequests} />
              </TabsContent>
              <TabsContent value="rejected" className="mt-6">
                <RequestsTable requests={rejectedRequests} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <DepositApprovalDialog
        request={selectedRequest}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
