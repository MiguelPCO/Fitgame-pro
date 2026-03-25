import React, { useMemo } from 'react';
import { TrendingUp, ArrowUp, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PHASE_CONFIGS, getCachedOverloadSuggestions } from '../../lib/periodization';
import { exerciseBlueprints } from '../../data/exerciseBlueprints';

const PHASE_COLORS = {
  blue:  { accent: 'text-blue-400',  bg: 'bg-blue-500/10',  border: 'border-blue-500/20',  dot: 'bg-blue-400' },
  red:   { accent: 'text-red-400',   bg: 'bg-red-500/10',   border: 'border-red-500/20',   dot: 'bg-red-400' },
  green: { accent: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', dot: 'bg-green-400' },
} as const;

const exerciseNameMap = new Map(exerciseBlueprints.map(e => [e.id, e.name]));

export function PeriodizationCard() {
  const { periodizationState, workoutHistory } = useApp();
  const config = PHASE_CONFIGS[periodizationState.currentPhase];
  const colors = PHASE_COLORS[config.color];
  const { completedTrainingWeeks } = periodizationState;

  const suggestions = useMemo(
    () => getCachedOverloadSuggestions(workoutHistory, periodizationState.currentPhase, exerciseNameMap),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workoutHistory.length, periodizationState.currentPhase]
  );

  return (
    <div className="bg-background-card border border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-800/60">
        <div className="flex items-center gap-2">
          <TrendingUp className={`w-4 h-4 ${colors.accent}`} />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Ciclo de Entrenamiento
          </span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.accent}`}>
          Fase {config.phase}
        </span>
      </div>

      {/* Phase info */}
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-lg font-black ${colors.accent}`}>{config.name}</p>
            <p className="text-xs text-text-muted mt-0.5">{config.descriptor}</p>
          </div>
          {/* Week progress dots */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex gap-1.5">
              {Array.from({ length: config.durationWeeks }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i < completedTrainingWeeks ? colors.dot : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-text-muted">
              Semana {completedTrainingWeeks}/{config.durationWeeks}
            </p>
          </div>
        </div>

        {/* Specs row */}
        <div className="flex gap-3">
          <div className={`flex-1 rounded-xl px-3 py-2 ${colors.bg} ${colors.border} border`}>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Reps objetivo</p>
            <p className={`text-sm font-black ${colors.accent}`}>{config.repRange}</p>
          </div>
          <div className={`flex-1 rounded-xl px-3 py-2 ${colors.bg} ${colors.border} border`}>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">RPE objetivo</p>
            <p className={`text-sm font-black ${colors.accent}`}>{config.rpeTarget} / 10</p>
          </div>
        </div>
      </div>

      {/* Progressive overload suggestions */}
      <div className="px-4 pb-4">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
          Progresión esta semana
        </p>

        {workoutHistory.length < 3 ? (
          <p className="text-xs text-text-muted">
            Completa más sesiones para ver sugerencias de progresión.
          </p>
        ) : suggestions.length === 0 ? (
          <p className="text-xs text-text-muted">
            ¡Sigues progresando bien! Sin cambios esta semana.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
              <div
                key={s.exerciseId}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold ${colors.bg} ${colors.accent}`}
              >
                {s.type === 'increase_weight'
                  ? <ArrowUp className="w-3 h-3 shrink-0" />
                  : <ArrowUpRight className="w-3 h-3 shrink-0" />
                }
                <span className="truncate max-w-[140px]">{s.exerciseName}</span>
                <span className="font-black shrink-0">
                  {s.type === 'increase_weight' ? `+2.5kg` : `+1 rep`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
