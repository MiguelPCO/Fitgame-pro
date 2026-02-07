import { useState, useEffect, useRef } from 'react';
import { Zap, Dumbbell, Flame, Trophy, CheckCircle2, Sunrise, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { XP } from '../../lib/constants';

interface XPBreakdownData {
  baseSets: number;
  bonusRPE: number;
  bonusPR: number;
  bonusCompletion: number;
  bonusStreak: number;
  bonusMorning: number;
  total: number;
}

interface XPBreakdownProps {
  breakdown: XPBreakdownData;
}

function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (target <= 0) return;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    };

    // Small delay so the component mounts first
    const timer = setTimeout(() => {
      rafId.current = requestAnimationFrame(animate);
    }, 300);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId.current);
    };
  }, [target, duration]);

  return value;
}

const LINE_CONFIG = [
  {
    key: 'baseSets' as const,
    icon: Dumbbell,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    label: (xp: number) => {
      const sets = Math.floor(xp / XP.PER_SET);
      return `${sets} series completadas`;
    },
  },
  {
    key: 'bonusRPE' as const,
    icon: Flame,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    label: (xp: number) => {
      const sets = Math.floor(xp / XP.BONUS_RPE_9_PLUS);
      return `${sets} sets RPE 9+`;
    },
  },
  {
    key: 'bonusPR' as const,
    icon: Trophy,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    label: (xp: number) => {
      const prs = Math.floor(xp / XP.BONUS_PR);
      return `${prs} nuevo${prs > 1 ? 's' : ''} PR${prs > 1 ? 's' : ''}`;
    },
  },
  {
    key: 'bonusCompletion' as const,
    icon: CheckCircle2,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    label: () => 'Sesión completa',
  },
  {
    key: 'bonusStreak' as const,
    icon: TrendingUp,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    label: (xp: number) => `Racha día ${xp}`,
  },
  {
    key: 'bonusMorning' as const,
    icon: Sunrise,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    label: () => 'Bonus matutino',
  },
];

export function XPBreakdown({ breakdown }: XPBreakdownProps) {
  const animatedTotal = useCountUp(breakdown.total);
  const activeLines = LINE_CONFIG.filter(line => breakdown[line.key] > 0);

  return (
    <div className="rounded-2xl border border-gray-800/50 bg-background-card/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-800/30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Desglose XP
          </h3>
        </div>
      </div>

      {/* Breakdown lines */}
      <div className="px-4 py-3 space-y-2">
        {activeLines.map(({ key, icon: Icon, color, bg, label }) => (
          <div
            key={key}
            className="flex items-center justify-between py-1.5"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={cn(
                'w-6 h-6 rounded-md flex items-center justify-center shrink-0',
                bg
              )}>
                <Icon className={cn('w-3.5 h-3.5', color)} />
              </div>
              <span className="text-sm text-gray-300 truncate">
                {label(breakdown[key])}
              </span>
            </div>
            <span className={cn('text-sm font-bold shrink-0 ml-3', color)}>
              +{breakdown[key]} XP
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="px-4 py-3 border-t border-gray-800/30 bg-amber-500/[0.04]">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">
            Total
          </span>
          <span className="text-2xl font-black text-amber-400">
            +{animatedTotal} XP
          </span>
        </div>
      </div>
    </div>
  );
}
