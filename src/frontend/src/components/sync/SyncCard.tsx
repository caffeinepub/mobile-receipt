import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useSync } from '@/sync/useSync';
import { useSettings } from '@/settings/useSettings';
import { SyncStatusBadge } from './SyncStatusBadge';
import { Cloud, LogIn, LogOut, RefreshCw, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function SyncCard() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const { syncStatus, syncProgress, syncError, syncNow, lastSyncAt } = useSync();
  const { settings, updateSettings } = useSettings();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const isSyncing = syncStatus === 'syncing';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    await clear();
  };

  const handleSync = async () => {
    await syncNow();
  };

  const handleAutoSyncToggle = async (enabled: boolean) => {
    await updateSettings({ autoSyncEnabled: enabled });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Cloud Sync
            </CardTitle>
            <CardDescription>
              Sync your data across devices using Internet Identity
            </CardDescription>
          </div>
          <SyncStatusBadge status={syncStatus} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAuthenticated ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sign in with Internet Identity to sync your data across devices. Your app works fully offline without signing in.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Authentication Status</Label>
            <p className="text-sm text-muted-foreground">
              {isAuthenticated ? 'Signed in' : 'Not signed in'}
            </p>
          </div>
          {isAuthenticated ? (
            <Button variant="outline" onClick={handleLogout} disabled={isSyncing}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          ) : (
            <Button onClick={handleLogin} disabled={isLoggingIn}>
              <LogIn className="h-4 w-4 mr-2" />
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </Button>
          )}
        </div>

        {isAuthenticated && (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-sync">Auto-sync on login</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync when you sign in
                </p>
              </div>
              <Switch
                id="auto-sync"
                checked={settings.autoSyncEnabled || false}
                onCheckedChange={handleAutoSyncToggle}
                disabled={isSyncing}
              />
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>

              {syncProgress && (
                <div className="space-y-2">
                  <Progress value={syncProgress.percentage || 0} />
                  <p className="text-sm text-muted-foreground text-center">
                    {syncProgress.message}
                  </p>
                </div>
              )}

              {syncError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{syncError.message}</AlertDescription>
                </Alert>
              )}

              {lastSyncAt && syncStatus !== 'syncing' && (
                <p className="text-xs text-muted-foreground text-center">
                  Last synced: {new Date(lastSyncAt).toLocaleString()}
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
