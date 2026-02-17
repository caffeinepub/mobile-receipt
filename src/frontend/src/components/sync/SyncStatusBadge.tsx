import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Cloud } from 'lucide-react';
import type { SyncStatus } from '@/sync/useSync';

interface SyncStatusBadgeProps {
  status: SyncStatus;
  className?: string;
}

export function SyncStatusBadge({ status, className }: SyncStatusBadgeProps) {
  if (status === 'idle') {
    return (
      <Badge variant="outline" className={className}>
        <Cloud className="h-3 w-3 mr-1" />
        Ready to sync
      </Badge>
    );
  }

  if (status === 'syncing') {
    return (
      <Badge variant="outline" className={className}>
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Syncing...
      </Badge>
    );
  }

  if (status === 'success') {
    return (
      <Badge variant="outline" className={className}>
        <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
        Synced
      </Badge>
    );
  }

  if (status === 'error') {
    return (
      <Badge variant="destructive" className={className}>
        <XCircle className="h-3 w-3 mr-1" />
        Sync failed
      </Badge>
    );
  }

  return null;
}
