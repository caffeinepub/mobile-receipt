import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import AppLayout from './components/layout/AppLayout';
import StartPage from './pages/StartPage';
import DashboardPage from './pages/DashboardPage';
import CreateBillPage from './pages/CreateBillPage';
import BillPreviewPage from './pages/BillPreviewPage';
import SavedBillsPage from './pages/SavedBillsPage';
import ItemsCategoriesPage from './pages/ItemsCategoriesPage';
import SettingsPage from './pages/SettingsPage';
import ExportBackupPage from './pages/ExportBackupPage';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { InternetIdentityProvider } from '@/hooks/useInternetIdentity';
import { useAutoSync } from '@/sync/useAutoSync';

function AppWithSync() {
  useAutoSync();
  return null;
}

const rootRoute = createRootRoute({
  component: AppLayout,
});

const startRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: StartPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const createBillRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-bill',
  component: CreateBillPage,
});

const billPreviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bill-preview/$billId',
  component: BillPreviewPage,
});

const savedBillsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/saved-bills',
  component: SavedBillsPage,
});

const itemsCategoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/items-categories',
  component: ItemsCategoriesPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const exportBackupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/export-backup',
  component: ExportBackupPage,
});

const routeTree = rootRoute.addChildren([
  startRoute,
  dashboardRoute,
  createBillRoute,
  billPreviewRoute,
  savedBillsRoute,
  itemsCategoriesRoute,
  settingsRoute,
  exportBackupRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <InternetIdentityProvider>
        <AppWithSync />
        <RouterProvider router={router} />
        <Toaster />
      </InternetIdentityProvider>
    </ThemeProvider>
  );
}
