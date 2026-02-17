import { useEffect, useRef } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useSettings } from '@/settings/useSettings';
import { useSync } from './useSync';

export function useAutoSync() {
  const { identity } = useInternetIdentity();
  const { settings } = useSettings();
  const { syncNow, syncStatus } = useSync();
  const hasAutoSyncedRef = useRef(false);

  useEffect(() => {
    // Only auto-sync if enabled, authenticated, not currently syncing, and hasn't auto-synced yet
    if (
      settings.autoSyncEnabled &&
      identity &&
      syncStatus === 'idle' &&
      !hasAutoSyncedRef.current
    ) {
      hasAutoSyncedRef.current = true;
      syncNow().catch(console.error);
    }

    // Reset flag when user logs out
    if (!identity) {
      hasAutoSyncedRef.current = false;
    }
  }, [identity, settings.autoSyncEnabled, syncStatus, syncNow]);
}
