import { useState, useEffect, useCallback } from 'react';
import { playNotification } from '../services/audio';
import { formatTime } from '../lib/utils';

export interface RestTimerState {
  remaining: number;
  duration: number;
  isActive: boolean;
  endTime?: number;
}

export interface UseRestTimerResult extends RestTimerState {
  formatted: string;
  start: (duration: number) => void;
  stop: () => void;
  addTime: (seconds: number) => void;
}

/**
 * Hook to manage a rest timer with background-safe timing.
 * Uses absolute end time to handle browser throttling when backgrounded.
 */
export function useRestTimer(): UseRestTimerResult {
  const [state, setState] = useState<RestTimerState>({
    remaining: 0,
    duration: 0,
    isActive: false,
  });

  // Timer effect - uses endTime for accuracy even when backgrounded
  useEffect(() => {
    if (!state.isActive || !state.endTime) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.ceil((state.endTime! - now) / 1000);

      if (diff <= 0) {
        playNotification();
        setState((prev) => ({
          ...prev,
          remaining: 0,
          isActive: false,
        }));
      } else {
        setState((prev) => ({ ...prev, remaining: diff }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isActive, state.endTime]);

  const start = useCallback((duration: number) => {
    const endTime = Date.now() + duration * 1000;
    setState({
      remaining: duration,
      duration,
      isActive: true,
      endTime,
    });
  }, []);

  const stop = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: false,
      remaining: 0,
      endTime: undefined,
    }));
  }, []);

  const addTime = useCallback((seconds: number) => {
    setState((prev) => {
      const currentEnd = prev.endTime || Date.now() + prev.remaining * 1000;
      return {
        ...prev,
        remaining: prev.remaining + seconds,
        isActive: true,
        endTime: currentEnd + seconds * 1000,
      };
    });
  }, []);

  return {
    ...state,
    formatted: formatTime(state.remaining),
    start,
    stop,
    addTime,
  };
}

export default useRestTimer;
