import { useState } from 'react';
import { useCreateDepositRequest } from '../../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';

export default function DepositRequestForm() {
  const [amount, setAmount] = useState('');
  const createDeposit = useCreateDepositRequest();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (amountNum > 0) {
      createDeposit.mutate(BigInt(Math.floor(amountNum)), {
        onSuccess: () => {
          setAmount('');
        },
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Request Deposit
        </CardTitle>
        <CardDescription>
          Transfer funds to the admin via bank payment, then create a deposit request here for approval.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="1"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter the amount you transferred to the admin's bank account.
            </p>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!amount || parseFloat(amount) <= 0 || createDeposit.isPending}
          >
            {createDeposit.isPending ? 'Creating...' : 'Create Deposit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
