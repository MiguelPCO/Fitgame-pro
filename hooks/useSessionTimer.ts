import { useState, useEffect } from 'react';
import { formatTime } from '../lib/utils';

interface SessionTimerResult {
  duration: number;
  formatted: string;
}

/**
 * Hook to track session duration based on a start timestamp.
 * Updates every second while active.
 */
export function useSessionTimer(startTime: number | undefined): SessionTimerResult {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setDuration(0);
      return;
    }

    const calculateDuration = () => {
      const now = Date.now();
      return Math.floor((now - startTime) / 1000);
    };

    // Set initial duration
    setDuration(calculateDuration());

    // Update every second
    const interval = setInterval(() => {
      setDuration(calculateDuration());
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return {
    duration,
    formatted: formatTime(duration),
  };
}

export default useSessionTimer;
