import { useState } from 'react';
import { useApproveDepositRequest } from '../../../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import type { DepositRequest } from '../../../backend';

interface DepositApprovalDialogProps {
  request: DepositRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

export default function DepositApprovalDialog({
  request,
  open,
  onOpenChange,
}: DepositApprovalDialogProps) {
  const approveDeposit = useApproveDepositRequest();

  const handleApprove = () => {
    if (request) {
      approveDeposit.mutate(request.id, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    }
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Deposit Request</DialogTitle>
          <DialogDescription>
            Review the deposit details and approve to credit the user's wallet.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">User</p>
              <p className="font-medium text-sm break-all">{request.user.toString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-bold text-lg">{request.amount.toString()}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Requested On</p>
              <p className="font-medium">{formatTimestamp(request.timestamp)}</p>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={approveDeposit.isPending}
            className="w-full sm:w-auto gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            {approveDeposit.isPending ? 'Approving...' : 'Approve Deposit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
