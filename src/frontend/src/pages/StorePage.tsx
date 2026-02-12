import { useGetBalance } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingBag, Info } from 'lucide-react';

export default function StorePage() {
  const { data: balance, isLoading } = useGetBalance();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rig Store</h1>
        <p className="text-muted-foreground">Browse and purchase rig packages</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Your current balance: <span className="font-bold">{isLoading ? 'Loading...' : balance?.toString() || '0'}</span>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Available Rigs
          </CardTitle>
          <CardDescription>Purchase rig packages to start earning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Coming Soon</p>
            <p className="text-sm">
              Rig packages will be available here once the admin creates them.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
