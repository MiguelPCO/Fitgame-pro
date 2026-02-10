import React from 'react';
import { Trophy } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PRBadgeProps {
  exercise: string;
  weight: number;
  reps: number;
  improvement?: string;
}

export const PRBadge: React.FC<PRBadgeProps> = ({ exercise, weight, reps, improvement }) => {
  return (
    <>
      <style>{`
        @keyframes prEnter {
          0% { opacity: 0; transform: scale(0.85); }
          60% { opacity: 1; transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div
        className={cn(
          'rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-3',
          'flex items-center gap-3',
          'animate-[prEnter_0.5s_ease-out_both]'
        )}
      >
        {/* Trophy icon */}
        <div className="w-10 h-10 rounded-lg bg-amber-500/25 flex items-center justify-center shrink-0">
          <Trophy className="w-5 h-5 text-amber-400" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-white truncate">
            {exercise}
          </p>
          <p className="text-xs text-amber-300/80 font-semibold mt-0.5">
            {weight}kg × {reps} reps
          </p>
        </div>

        {/* Improvement badge */}
        {improvement && (
          <span className="text-[11px] font-bold text-amber-400 bg-amber-500/25 px-2 py-1 rounded-md shrink-0">
            {improvement}
          </span>
        )}
      </div>
    </>
  );
};
