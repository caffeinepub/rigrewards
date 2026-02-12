import WalletBalanceCard from '../features/wallet/components/WalletBalanceCard';
import DepositRequestForm from '../features/wallet/components/DepositRequestForm';
import DepositRequestsTable from '../features/wallet/components/DepositRequestsTable';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Receipt } from 'lucide-react';

export default function WalletPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wallet</h1>
          <p className="text-muted-foreground">Manage your balance and deposit requests</p>
        </div>
        <Link to="/transactions">
          <Button variant="outline" className="gap-2">
            <Receipt className="h-4 w-4" />
            View Transactions
          </Button>
        </Link>
      </div>

      <WalletBalanceCard />

      <div className="grid gap-6 md:grid-cols-1">
        <DepositRequestForm />
      </div>

      <DepositRequestsTable />
    </div>
  );
}
