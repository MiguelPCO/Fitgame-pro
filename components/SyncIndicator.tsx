import React, { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, RefreshCw, Check } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { getQueue, processQueue } from '../services/offlineQueue';

type SyncState = 'synced' | 'syncing' | 'offline-pending' | 'offline';

const SyncIndicator: React.FC = () => {
  const { isOnline, onReconnect } = useOnlineStatus();
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [pendingCount, setPendingCount] = useState(0);

  const checkQueue = useCallback(() => {
    const queue = getQueue();
    setPendingCount(queue.length);
    return queue.length;
  }, []);

  const doSync = useCallback(async () => {
    const count = checkQueue();
    if (count === 0) {
      setSyncState('synced');
      return;
    }

    setSyncState('syncing');
    await processQueue();
    const remaining = checkQueue();
    setSyncState(remaining > 0 ? 'offline-pending' : 'synced');
  }, [checkQueue]);

  // Check queue periodically
  useEffect(() => {
    checkQueue();
    const interval = setInterval(checkQueue, 5000);
    return () => clearInterval(interval);
  }, [checkQueue]);

  // Update state based on online/offline + queue
  useEffect(() => {
    if (!isOnline) {
      setSyncState(pendingCount > 0 ? 'offline-pending' : 'offline');
    } else if (pendingCount > 0) {
      doSync();
    } else {
      setSyncState('synced');
    }
  }, [isOnline, pendingCount, doSync]);

  // On reconnect, process queue
  onReconnect(() => {
    doSync();
  });

  // Also process queue on mount if there are pending items
  useEffect(() => {
    if (isOnline) doSync();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const configs: Record<SyncState, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    'synced': {
      color: 'text-green-400',
      bg: 'bg-green-500',
      icon: <Check className="w-3 h-3" />,
      label: 'Sincronizado',
    },
    'syncing': {
      color: 'text-yellow-400',
      bg: 'bg-yellow-500',
      icon: <RefreshCw className="w-3 h-3 animate-spin" />,
      label: 'Sincronizando...',
    },
    'offline-pending': {
      color: 'text-orange-400',
      bg: 'bg-orange-500',
      icon: <WifiOff className="w-3 h-3" />,
      label: `Sin conexion (${pendingCount})`,
    },
    'offline': {
      color: 'text-red-400',
      bg: 'bg-red-500',
      icon: <WifiOff className="w-3 h-3" />,
      label: 'Sin conexion',
    },
  };

  const config = configs[syncState];

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-background-card rounded-full border border-gray-700/50 shadow-sm">
      <span className={`w-2 h-2 rounded-full ${config.bg} ${syncState === 'synced' ? 'shadow-[0_0_5px_#22c55e]' : ''}`}></span>
      <span className={`text-xs font-bold ${config.color} flex items-center gap-1`}>
        {config.icon}
        <span className="hidden md:inline">{config.label}</span>
      </span>
    </div>
  );
};

export default SyncIndicator;
