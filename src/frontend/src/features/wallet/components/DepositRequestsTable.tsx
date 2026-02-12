import { useGetUserDepositRequests } from '../../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { DepositStatus, type DepositRequest } from '../../../backend';

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

export default function DepositRequestsTable() {
  const { data: requests, isLoading } = useGetUserDepositRequests();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Deposit Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Deposit Requests</CardTitle>
          <CardDescription>View the status of your deposit requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No deposit requests yet. Create one above to get started.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Deposit Requests</CardTitle>
        <CardDescription>View the status of your deposit requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="text-sm">{formatTimestamp(request.timestamp)}</TableCell>
                  <TableCell className="font-medium">{request.amount.toString()}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
