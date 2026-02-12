import { useGetUserTransactions } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowDownCircle, ArrowUpCircle, ShoppingBag } from 'lucide-react';
import { TransactionType, type Transaction } from '../backend';

function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function getTransactionIcon(type: TransactionType) {
  if (type === TransactionType.deposit) {
    return <ArrowDownCircle className="h-4 w-4 text-green-600" />;
  }
  if (type === TransactionType.purchase) {
    return <ShoppingBag className="h-4 w-4 text-blue-600" />;
  }
  if (type === TransactionType.internalTransfer) {
    return <ArrowUpCircle className="h-4 w-4 text-orange-600" />;
  }
  return null;
}

function getTransactionLabel(type: TransactionType) {
  if (type === TransactionType.deposit) return 'Deposit';
  if (type === TransactionType.purchase) return 'Purchase';
  if (type === TransactionType.internalTransfer) return 'Transfer';
  return 'Unknown';
}

function getStatusBadge(status: Transaction['status']) {
  if ('pending' in status) {
    return <Badge variant="outline">Pending</Badge>;
  }
  if ('approved' in status || 'completed' in status || 'autoCompleted' in status) {
    return <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>;
  }
  if ('rejected' in status || 'autoCompletedRejected' in status) {
    return <Badge variant="destructive">Rejected</Badge>;
  }
  return null;
}

export default function TransactionsPage() {
  const { data: transactions, isLoading } = useGetUserTransactions();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground">View all your wallet transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>Complete history of deposits, purchases, and transfers</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet. Make a deposit or purchase to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm">{formatTimestamp(transaction.timestamp)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.transactionType)}
                          <span className="font-medium">{getTransactionLabel(transaction.transactionType)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">{transaction.amount.toString()}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
