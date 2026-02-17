import { useState, useCallback } from 'react';
import { useActor } from '@/hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import { performSync, type SyncProgress } from './syncService';
import { invalidateAllLocalData } from './reactQueryInvalidation';
import { useSettings } from '@/settings/useSettings';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface UseSyncResult {
  syncStatus: SyncStatus;
  syncProgress: SyncProgress | null;
  syncError: Error | null;
  syncNow: () => Promise<void>;
  lastSyncAt: number | undefined;
}

export function useSync(): UseSyncResult {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { settings, updateSettings } = useSettings();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [syncError, setSyncError] = useState<Error | null>(null);

  const syncNow = useCallback(async () => {
    if (!actor) {
      setSyncError(new Error('Not authenticated. Please sign in to sync.'));
      setSyncStatus('error');
      return;
    }

    try {
      setSyncStatus('syncing');
      setSyncError(null);
      setSyncProgress({ stage: 'uploading', message: 'Starting sync...', percentage: 0 });

      await performSync(actor, (progress) => {
        setSyncProgress(progress);
      });

      // Update last sync time
      await updateSettings({ lastSyncAt: Date.now() });

      // Invalidate all queries to refresh UI
      invalidateAllLocalData(queryClient);

      setSyncStatus('success');
      setSyncProgress({ stage: 'complete', message: 'Sync complete!', percentage: 100 });

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncProgress(null);
      }, 3000);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncError(error instanceof Error ? error : new Error('Sync failed'));
      setSyncStatus('error');
      setSyncProgress(null);
    }
  }, [actor, queryClient, updateSettings]);

  return {
    syncStatus,
    syncProgress,
    syncError,
    syncNow,
    lastSyncAt: settings.lastSyncAt,
  };
}
