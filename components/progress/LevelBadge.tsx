import React from 'react';
import { cn } from '../../lib/utils';

type BadgeSize = 'sm' | 'md' | 'lg';

interface LevelBadgeProps {
  level: number;
  levelName: string;
  size?: BadgeSize;
}

const sizeConfig: Record<BadgeSize, { container: string; level: string; name: string; ring: string }> = {
  sm: {
    container: 'w-12 h-12',
    level: 'text-lg',
    name: 'text-[10px]',
    ring: 'ring-2',
  },
  md: {
    container: 'w-16 h-16',
    level: 'text-2xl',
    name: 'text-xs',
    ring: 'ring-2',
  },
  lg: {
    container: 'w-24 h-24',
    level: 'text-4xl',
    name: 'text-sm',
    ring: 'ring-4',
  },
};

function getLevelColor(level: number): { bg: string; ring: string; glow: string } {
  if (level >= 50) {
    return {
      bg: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500',
      ring: 'ring-amber-400/50',
      glow: 'shadow-amber-500/40',
    };
  }
  if (level >= 30) {
    return {
      bg: 'bg-gradient-to-br from-purple-500 via-violet-500 to-fuchsia-500',
      ring: 'ring-purple-400/50',
      glow: 'shadow-purple-500/40',
    };
  }
  if (level >= 20) {
    return {
      bg: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500',
      ring: 'ring-cyan-400/50',
      glow: 'shadow-cyan-500/40',
    };
  }
  if (level >= 10) {
    return {
      bg: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500',
      ring: 'ring-emerald-400/50',
      glow: 'shadow-emerald-500/40',
    };
  }
  return {
    bg: 'bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-600',
    ring: 'ring-slate-400/50',
    glow: 'shadow-slate-500/40',
  };
}

export function LevelBadge({ level, levelName, size = 'md' }: LevelBadgeProps) {
  const sizes = sizeConfig[size];
  const colors = getLevelColor(level);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'relative rounded-full flex items-center justify-center',
          'shadow-lg transition-transform hover:scale-105',
          sizes.container,
          sizes.ring,
          colors.bg,
          colors.ring,
          colors.glow
        )}
      >
        {/* Inner glow effect */}
        <div className="absolute inset-1 rounded-full bg-black/20 backdrop-blur-sm" />

        {/* Level number */}
        <span className={cn('relative z-10 font-black text-white drop-shadow-md', sizes.level)}>
          {level}
        </span>
      </div>

      {/* Level name */}
      <span className={cn('font-bold uppercase tracking-wider text-gray-400', sizes.name)}>
        {levelName}
      </span>
    </div>
  );
}
