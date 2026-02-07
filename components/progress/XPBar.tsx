import React from 'react';
import { Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

interface XPBarProps {
  currentXP: number;
  xpToNext: number;
  level: number;
  showLabel?: boolean;
}

export function XPBar({ currentXP, xpToNext, level, showLabel = true }: XPBarProps) {
  const progress = Math.min((currentXP / xpToNext) * 100, 100);
  const xpRemaining = xpToNext - currentXP;

  return (
    <div className="w-full space-y-2">
      {/* Labels */}
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1 text-primary">
            <Zap className="w-3 h-3" />
            {currentXP.toLocaleString()} XP
          </span>
          <span className="text-text-muted">
            {xpToNext.toLocaleString()} XP
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-y-0 left-0 bg-primary/20 blur-sm"
          style={{ width: `${progress}%` }}
        />

        {/* Main progress */}
        <div
          className={cn(
            'h-full bg-gradient-to-r from-primary to-red-400 relative overflow-hidden',
            'transition-all duration-500 ease-out'
          )}
          style={{ width: `${progress}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_2s_infinite]" />
        </div>

        {/* Level markers (subtle notches) */}
        <div className="absolute inset-0 flex justify-between px-[2px] pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-px h-full bg-gray-700/50" />
          ))}
        </div>
      </div>

      {/* Remaining XP hint */}
      {showLabel && (
        <p className="text-xs text-center text-text-muted">
          <span className="text-gray-300 font-semibold">{xpRemaining.toLocaleString()}</span> XP to Level {level + 1}
        </p>
      )}
    </div>
  );
}
