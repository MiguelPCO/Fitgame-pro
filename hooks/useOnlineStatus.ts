import { useState, useEffect, useCallback, useRef } from 'react';

interface UseOnlineStatusResult {
  isOnline: boolean;
  onReconnect: (callback: () => void) => void;
}

export function useOnlineStatus(): UseOnlineStatusResult {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const callbackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (callbackRef.current) {
        callbackRef.current();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const onReconnect = useCallback((callback: () => void) => {
    callbackRef.current = callback;
  }, []);

  return { isOnline, onReconnect };
}
