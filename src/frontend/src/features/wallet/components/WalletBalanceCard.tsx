import { useGetBalance } from '../../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

export default function WalletBalanceCard() {
  const { data: balance, isLoading } = useGetBalance();

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Available Balance
        </CardTitle>
        <CardDescription>Your current wallet balance</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-3xl font-bold text-muted-foreground">Loading...</div>
        ) : (
          <div className="text-4xl font-bold">{balance?.toString() || '0'}</div>
        )}
      </CardContent>
    </Card>
  );
}
