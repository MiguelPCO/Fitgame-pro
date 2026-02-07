import React from 'react';
import { cn } from '../../lib/utils';

interface RPESliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const RPE_DESCRIPTORS: Record<number, string> = {
  1: 'Very light effort',
  2: 'Light effort',
  3: 'Moderate effort',
  4: 'Somewhat hard',
  5: 'Hard',
  6: 'Could do 4+ more reps',
  7: 'Could do 3 more reps',
  8: 'Could do 2 more reps',
  9: 'Could do 1 more rep',
  10: 'Maximum effort',
};

const RPE_DESCRIPTORS_ES: Record<number, string> = {
  1: 'Muy ligero',
  2: 'Ligero',
  3: 'Moderado',
  4: 'Algo difícil',
  5: 'Difícil',
  6: 'Podrías hacer 4+ reps más',
  7: 'Podrías hacer 3 reps más',
  8: 'Podrías hacer 2 reps más',
  9: 'Podrías hacer 1 rep más',
  10: 'Máximo esfuerzo',
};

function getRPEColor(rpe: number): { bg: string; text: string; ring: string } {
  if (rpe <= 4) {
    return {
      bg: 'bg-green-500',
      text: 'text-green-400',
      ring: 'ring-green-500/30',
    };
  }
  if (rpe <= 7) {
    return {
      bg: 'bg-yellow-500',
      text: 'text-yellow-400',
      ring: 'ring-yellow-500/30',
    };
  }
  return {
    bg: 'bg-red-500',
    text: 'text-red-400',
    ring: 'ring-red-500/30',
  };
}

function getGradientPosition(value: number): string {
  // Map 1-10 to percentage
  return `${((value - 1) / 9) * 100}%`;
}

export function RPESlider({ value, onChange, disabled = false }: RPESliderProps) {
  const colors = getRPEColor(value);
  const descriptor = RPE_DESCRIPTORS_ES[value] || '';

  const handlePointClick = (rpe: number) => {
    if (!disabled) {
      onChange(rpe);
    }
  };

  return (
    <div className={cn('w-full space-y-3', disabled && 'opacity-50')}>
      {/* Header with value */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-400">RPE</span>
        <div className={cn('flex items-center gap-2', colors.text)}>
          <span className="text-2xl font-black">{value}</span>
          <span className="text-xs font-medium uppercase tracking-wide">/10</span>
        </div>
      </div>

      {/* Slider track with points */}
      <div className="relative py-4">
        {/* Background track */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-gradient-to-r from-green-500/20 via-yellow-500/20 to-red-500/20" />

        {/* Filled track */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-200"
          style={{ width: getGradientPosition(value) }}
        />

        {/* Points */}
        <div className="relative flex justify-between">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rpe) => {
            const isSelected = rpe === value;
            const isPassed = rpe <= value;
            const pointColors = getRPEColor(rpe);

            return (
              <button
                key={rpe}
                type="button"
                onClick={() => handlePointClick(rpe)}
                disabled={disabled}
                className={cn(
                  'relative flex items-center justify-center',
                  'w-11 h-11 -mx-1 rounded-full', // 44px touch target
                  'transition-all duration-200',
                  !disabled && 'cursor-pointer hover:scale-110 active:scale-95',
                  disabled && 'cursor-not-allowed'
                )}
                aria-label={`RPE ${rpe}: ${RPE_DESCRIPTORS[rpe]}`}
              >
                {/* Point circle */}
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border-2 transition-all duration-200',
                    isSelected && [
                      'w-6 h-6',
                      pointColors.bg,
                      'border-white',
                      'ring-4',
                      pointColors.ring,
                      'shadow-lg'
                    ],
                    !isSelected && isPassed && [
                      pointColors.bg,
                      'border-transparent'
                    ],
                    !isSelected && !isPassed && [
                      'bg-gray-700',
                      'border-gray-600'
                    ]
                  )}
                />

                {/* Number label on hover/selected */}
                {isSelected && (
                  <span className={cn(
                    'absolute -bottom-6 text-xs font-bold',
                    pointColors.text
                  )}>
                    {rpe}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between px-1 text-[10px] font-medium text-gray-500">
        <span>Easy</span>
        <span>Hard</span>
        <span>Max</span>
      </div>

      {/* Descriptor */}
      <div className={cn(
        'text-center py-2 px-4 rounded-xl',
        'bg-gray-800/50 border border-gray-700/50'
      )}>
        <p className={cn('text-sm font-medium', colors.text)}>
          RPE {value}: <span className="text-gray-300">{descriptor}</span>
        </p>
      </div>
    </div>
  );
}
