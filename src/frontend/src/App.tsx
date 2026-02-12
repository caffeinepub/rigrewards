import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import AppShell from './components/layout/AppShell';
import ProfileSetupDialog from './features/auth/components/ProfileSetupDialog';
import WalletPage from './pages/WalletPage';
import TransactionsPage from './pages/TransactionsPage';
import StorePage from './pages/StorePage';
import AdminDepositsPage from './pages/admin/AdminDepositsPage';
import { Toaster } from '@/components/ui/sonner';

function RootLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <AppShell>
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <h1 className="text-4xl font-bold mb-4">Welcome to RigRewards</h1>
            <p className="text-muted-foreground text-center max-w-md mb-8">
              Please log in to access your wallet, view transactions, and purchase rig packages.
            </p>
          </div>
        </AppShell>
      </div>
    );
  }

  return (
    <>
      <AppShell>
        <Outlet />
      </AppShell>
      {showProfileSetup && <ProfileSetupDialog />}
      <Toaster />
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: WalletPage,
});

const walletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wallet',
  component: WalletPage,
});

const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions',
  component: TransactionsPage,
});

const storeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/store',
  component: StorePage,
});

const adminDepositsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/deposits',
  component: AdminDepositsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  walletRoute,
  transactionsRoute,
  storeRoute,
  adminDepositsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
