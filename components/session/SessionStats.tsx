import { Clock, Dumbbell, CheckCircle2, Flame } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatTime } from '../../lib/utils';

interface SessionStatsProps {
  duration: number;
  totalVolume: number;
  setsCompleted: number;
  averageRPE: number;
}

function getRPEColor(rpe: number): string {
  if (rpe >= 9) return 'text-red-400 bg-red-500/10 border-red-500/20';
  if (rpe >= 7) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
  if (rpe > 0) return 'text-green-400 bg-green-500/10 border-green-500/20';
  return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
}

const stats = [
  {
    key: 'duration',
    label: 'Duración',
    icon: Clock,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    format: (v: number) => formatTime(v),
  },
  {
    key: 'volume',
    label: 'Volumen',
    icon: Dumbbell,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    format: (v: number) => `${v.toLocaleString()} kg`,
  },
  {
    key: 'sets',
    label: 'Series',
    icon: CheckCircle2,
    color: 'text-green-400 bg-green-500/10 border-green-500/20',
    format: (v: number) => `${v}`,
  },
  {
    key: 'rpe',
    label: 'RPE Prom.',
    icon: Flame,
    color: null, // dynamic
    format: (v: number) => v > 0 ? v.toFixed(1) : '—',
  },
] as const;

export function SessionStats({
  duration,
  totalVolume,
  setsCompleted,
  averageRPE,
}: SessionStatsProps) {
  const values: Record<string, number> = {
    duration,
    volume: totalVolume,
    sets: setsCompleted,
    rpe: averageRPE,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {stats.map(({ key, label, icon: Icon, color, format }) => {
        const value = values[key];
        const cardColor = key === 'rpe' ? getRPEColor(value) : color;

        return (
          <div
            key={key}
            className={cn(
              'rounded-xl border p-3 transition-all duration-200',
              'bg-background-card/50',
              'border-gray-800/50'
            )}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className={cn(
                'w-6 h-6 rounded-md flex items-center justify-center',
                cardColor
              )}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                {label}
              </span>
            </div>
            <p className="text-lg font-black text-white leading-tight pl-0.5">
              {format(value)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
