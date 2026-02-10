import React, { useEffect, useState, useCallback } from 'react';
import { Play, Pause, SkipForward, Plus, Minus, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../../lib/utils';
import { playNotification } from '../../services/audio';

interface RestTimerProps {
  duration: number;
  remaining: number;
  isActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onSkip: () => void;
  onAddTime: (seconds: number) => void;
  onComplete?: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function RestTimer({
  duration,
  remaining,
  isActive,
  onStart,
  onPause,
  onSkip,
  onAddTime,
  onComplete,
}: RestTimerProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Calculate progress for circular indicator
  const progress = duration > 0 ? (remaining / duration) * 100 : 0;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Get color based on remaining time
  const getTimerColor = useCallback(() => {
    if (remaining <= 10) return { stroke: '#ef4444', text: 'text-red-500', bg: 'bg-red-500/10' };
    if (remaining <= 30) return { stroke: '#f59e0b', text: 'text-amber-500', bg: 'bg-amber-500/10' };
    return { stroke: '#22c55e', text: 'text-green-500', bg: 'bg-green-500/10' };
  }, [remaining]);

  const colors = getTimerColor();

  // Handle completion
  useEffect(() => {
    if (remaining === 0 && isActive && !hasCompleted) {
      setHasCompleted(true);
      if (soundEnabled) {
        playNotification();
        // Vibrate if supported
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
      }
      onComplete?.();
    }
  }, [remaining, isActive, hasCompleted, soundEnabled, onComplete]);

  // Reset hasCompleted when timer restarts
  useEffect(() => {
    if (remaining > 0) {
      setHasCompleted(false);
    }
  }, [remaining]);

  const isFinished = remaining === 0;

  return (
    <div className="flex flex-col items-center">
      {/* Circular timer */}
      <div className="relative w-48 h-48 mb-6">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-gray-500"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={colors.stroke}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            'text-5xl font-black tabular-nums',
            isFinished ? 'text-green-400 animate-pulse' : 'text-white'
          )}>
            {formatTime(remaining)}
          </span>
          <span className="text-sm text-gray-400 mt-1">
            {isFinished ? 'Rest complete!' : 'Rest time'}
          </span>
        </div>

        {/* Pulse effect when low */}
        {remaining <= 10 && remaining > 0 && (
          <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-red-500" />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        {/* Subtract time */}
        <button
          onClick={() => onAddTime(-15)}
          disabled={remaining < 15}
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            'bg-gray-800 border border-gray-700',
            'text-gray-400 hover:text-white hover:bg-gray-700',
            'transition-all duration-150 active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="Subtract 15 seconds"
        >
          <Minus className="w-5 h-5" />
        </button>

        {/* Play/Pause button */}
        <button
          onClick={isActive ? onPause : onStart}
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center',
            'transition-all duration-200 active:scale-95',
            isActive
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-primary text-white hover:bg-primary/90'
          )}
          aria-label={isActive ? 'Pause' : 'Start'}
        >
          {isActive ? (
            <Pause className="w-7 h-7" />
          ) : (
            <Play className="w-7 h-7 ml-1" />
          )}
        </button>

        {/* Add time */}
        <button
          onClick={() => onAddTime(15)}
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            'bg-gray-800 border border-gray-700',
            'text-gray-400 hover:text-white hover:bg-gray-700',
            'transition-all duration-150 active:scale-95'
          )}
          aria-label="Add 15 seconds"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Quick time buttons */}
      <div className="flex gap-2 mb-6">
        {[60, 90, 120, 180].map((time) => (
          <button
            key={time}
            onClick={() => {
              onAddTime(time - remaining);
            }}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium',
              'transition-all duration-150',
              duration === time
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white hover:border-gray-600'
            )}
          >
            {time >= 60 ? `${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}` : `${time}s`}
          </button>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="flex items-center gap-4">
        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg',
            'text-sm font-medium transition-colors',
            soundEnabled
              ? 'text-gray-300 hover:text-white'
              : 'text-gray-400 hover:text-gray-400'
          )}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
          <span>{soundEnabled ? 'Sound on' : 'Sound off'}</span>
        </button>

        {/* Skip button */}
        <button
          onClick={onSkip}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            'bg-gray-800 border border-gray-700',
            'text-gray-300 hover:text-white hover:bg-gray-700',
            'text-sm font-medium transition-all duration-150'
          )}
        >
          <SkipForward className="w-4 h-4" />
          <span>Skip rest</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Compact version for inline display
 */
interface RestTimerCompactProps {
  remaining: number;
  duration: number;
  isActive: boolean;
  onSkip: () => void;
}

export function RestTimerCompact({
  remaining,
  duration,
  isActive,
  onSkip,
}: RestTimerCompactProps) {
  const progress = duration > 0 ? (remaining / duration) * 100 : 0;

  const getColor = () => {
    if (remaining <= 10) return 'text-red-500 bg-red-500';
    if (remaining <= 30) return 'text-amber-500 bg-amber-500';
    return 'text-green-500 bg-green-500';
  };

  const colors = getColor();

  if (!isActive && remaining === 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700">
      {/* Mini progress ring */}
      <div className="relative w-10 h-10">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-gray-400"
          />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={100}
            strokeDashoffset={100 - progress}
            className={colors.split(' ')[0]}
          />
        </svg>
        <span className={cn(
          'absolute inset-0 flex items-center justify-center',
          'text-xs font-bold',
          colors.split(' ')[0]
        )}>
          {remaining}
        </span>
      </div>

      {/* Label */}
      <div className="flex-1">
        <p className="text-sm font-medium text-white">Rest timer</p>
        <p className="text-xs text-gray-400">{formatTime(remaining)} remaining</p>
      </div>

      {/* Skip button */}
      <button
        onClick={onSkip}
        className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 text-xs font-medium hover:bg-gray-600 transition-colors"
      >
        Skip
      </button>
    </div>
  );
}
