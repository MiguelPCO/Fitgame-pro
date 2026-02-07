import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

type SetType = 'warmup' | 'top' | 'backoff';

interface SetCardProps {
  setNumber: number;
  status: 'pending' | 'active' | 'completed';
  data?: { weight: number; reps: number; rpe: number };
  target?: { reps: string; rpe: number };
  recommendedWeight?: number;
  setType?: SetType;
  onClick: () => void;
}

function getSetTypeLabel(type: SetType): string {
  switch (type) {
    case 'warmup': return 'W';
    case 'top': return 'T';
    case 'backoff': return 'B';
  }
}

function getSetTypeBadge(type: SetType): string {
  switch (type) {
    case 'warmup': return 'text-blue-400 bg-blue-500/15 border-blue-500/20';
    case 'top': return 'text-primary bg-primary/15 border-primary/20';
    case 'backoff': return 'text-amber-400 bg-amber-500/15 border-amber-500/20';
  }
}

function getRPEColor(rpe: number): string {
  if (rpe >= 9) return 'text-red-400';
  if (rpe >= 7) return 'text-yellow-400';
  return 'text-green-400';
}

export const SetCard: React.FC<SetCardProps> = ({
  setNumber,
  status,
  data,
  target,
  recommendedWeight = 0,
  setType,
  onClick,
}) => {
  const isActive = status === 'active';
  const isCompleted = status === 'completed';
  const isPending = status === 'pending';

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative rounded-xl p-3 transition-all duration-200 text-center border',
        // Active: scaled up, primary glow
        isActive && [
          'bg-primary/10 border-primary/40',
          'ring-2 ring-primary/20',
          'scale-[1.05] shadow-lg shadow-primary/10',
          'z-10'
        ],
        // Completed: soft green tint
        isCompleted && [
          'bg-green-500/[0.06] border-green-500/20',
          'hover:bg-green-500/10 hover:border-green-500/30'
        ],
        // Pending: grey, muted
        isPending && [
          'bg-gray-800/20 border-gray-800/50',
          'hover:bg-gray-800/40 hover:border-gray-700'
        ]
      )}
    >
      {/* Set type badge + number */}
      <div className="flex items-center justify-center gap-1.5 mb-2">
        {setType && (
          <span className={cn(
            'text-[9px] font-bold uppercase px-1.5 py-px rounded border',
            getSetTypeBadge(setType)
          )}>
            {getSetTypeLabel(setType)}
          </span>
        )}
        <span className={cn(
          'text-[11px] font-bold',
          isCompleted ? 'text-gray-400' : isActive ? 'text-primary' : 'text-gray-600'
        )}>
          #{setNumber}
        </span>
      </div>

      {/* Content by status */}
      {isCompleted && data ? (
        <>
          <p className="text-base font-black text-white leading-tight">
            {data.weight}<span className="text-gray-500 text-xs font-medium">kg</span>
          </p>
          <p className="text-xs text-gray-400 font-semibold mt-0.5">
            × {data.reps} reps
          </p>
          {data.rpe > 0 && (
            <span className={cn(
              'text-[10px] font-bold mt-1 inline-block',
              getRPEColor(data.rpe)
            )}>
              RPE {data.rpe}
            </span>
          )}
        </>
      ) : isActive ? (
        <>
          <div className="flex items-center justify-center gap-1 text-primary">
            <ChevronRight className="w-4 h-4" />
            <span className="text-xs font-bold">Registrar</span>
          </div>
          {target && (
            <p className="text-[10px] text-gray-500 mt-1">
              {target.reps} @ RPE {target.rpe}
            </p>
          )}
        </>
      ) : (
        <>
          {recommendedWeight > 0 && (
            <p className="text-xs font-bold text-gray-500 mb-0.5">
              {recommendedWeight}<span className="text-gray-600 text-[9px] font-medium">kg</span>
            </p>
          )}
          {target && (
            <>
              <p className="text-sm font-semibold text-gray-600">
                {target.reps}
              </p>
              <p className="text-[10px] text-gray-700 mt-0.5">
                RPE {target.rpe}
              </p>
            </>
          )}
        </>
      )}

      {/* Completed checkmark */}
      {isCompleted && (
        <div className="absolute top-1.5 right-1.5">
          <Check className="w-3.5 h-3.5 text-green-500" />
        </div>
      )}

      {/* Active pulse ring */}
      {isActive && (
        <div className="absolute inset-0 rounded-xl border-2 border-primary/30 animate-pulse pointer-events-none" />
      )}
    </button>
  );
};
