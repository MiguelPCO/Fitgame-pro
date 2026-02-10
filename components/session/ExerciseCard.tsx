import React from 'react';
import { Dumbbell, Target } from 'lucide-react';
import { Exercise, WorkoutSet } from '../../types';
import { cn } from '../../lib/utils';
import { SetCard } from './SetCard';

interface ExerciseCardProps {
  exercise: Exercise;
  sets: WorkoutSet[];
  currentSetIndex: number;
  onSetClick: (setIndex: number) => void;
  onDeleteSet?: (setIndex: number) => void;
  isActive: boolean;
  targetReps?: string;
  targetRPE?: number;
}

function getRPEColor(rpe: number): string {
  if (rpe >= 9) return 'text-red-400';
  if (rpe >= 7) return 'text-yellow-400';
  return 'text-green-400';
}

const MUSCLE_COLORS: Record<string, string> = {
  Chest: 'bg-red-500/25 text-red-400 border-red-500/20',
  Back: 'bg-blue-500/25 text-blue-400 border-blue-500/20',
  Quadriceps: 'bg-emerald-500/25 text-emerald-400 border-emerald-500/20',
  Hamstrings: 'bg-teal-500/25 text-teal-400 border-teal-500/20',
  Glutes: 'bg-pink-500/25 text-pink-400 border-pink-500/20',
  Shoulders: 'bg-orange-500/25 text-orange-400 border-orange-500/20',
  Biceps: 'bg-violet-500/25 text-violet-400 border-violet-500/20',
  Triceps: 'bg-indigo-500/25 text-indigo-400 border-indigo-500/20',
};

const DEFAULT_MUSCLE_COLOR = 'bg-gray-500/25 text-gray-400 border-gray-500/20';

export function ExerciseCard({
  exercise,
  sets,
  currentSetIndex,
  onSetClick,
  onDeleteSet,
  isActive,
  targetReps,
  targetRPE,
}: ExerciseCardProps) {
  const completedSets = sets.filter(s => s.completed);
  const totalSets = sets.length;
  const progress = totalSets > 0 ? (completedSets.length / totalSets) * 100 : 0;

  const totalVolume = completedSets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
  const avgRPE = completedSets.length > 0
    ? completedSets.reduce((sum, set) => sum + (set.rpe || 0), 0) / completedSets.length
    : 0;

  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-300 overflow-hidden',
        isActive
          ? 'bg-background-card border-primary/40 shadow-lg shadow-primary/5'
          : 'bg-background-card border-gray-800 hover:border-gray-700'
      )}
    >
      {/* === Top section: Image + Exercise info (responsive) === */}
      <div className="flex flex-col md:flex-row">
        {/* Exercise image / placeholder */}
        <div className={cn(
          'relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900',
          'flex items-center justify-center',
          // Mobile: banner on top
          'h-36 w-full',
          // Desktop: square on left
          'md:h-auto md:w-44 md:shrink-0'
        )}>
          {exercise.videoUrl ? (
            <img
              src={exercise.videoUrl}
              alt={exercise.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <>
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              />
              <Dumbbell className="w-12 h-12 text-gray-400" />
            </>
          )}

          {/* Progress overlay badge */}
          <div className="absolute top-3 right-3 md:top-2 md:right-2">
            <div className={cn(
              'px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-md',
              progress === 100
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-black/40 text-white border border-white/10'
            )}>
              {completedSets.length}/{totalSets}
            </div>
          </div>

          {/* Equipment badge */}
          <div className="absolute bottom-3 left-3 md:bottom-2 md:left-2">
            <span className="text-[10px] font-bold uppercase text-gray-400 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md border border-white/5">
              {exercise.equipment}
            </span>
          </div>
        </div>

        {/* Exercise info */}
        <div className="flex-1 p-4">
          {/* Name */}
          <h3 className="text-xl font-black text-white leading-tight">
            {exercise.name}
          </h3>

          {/* Muscle group badges */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {exercise.muscleGroup.map((muscle, idx) => (
              <span
                key={idx}
                className={cn(
                  'text-[11px] font-semibold px-2.5 py-0.5 rounded-full border',
                  MUSCLE_COLORS[muscle] || DEFAULT_MUSCLE_COLOR
                )}
              >
                {muscle}
              </span>
            ))}
            <span className={cn(
              'text-[11px] font-semibold px-2.5 py-0.5 rounded-full border',
              exercise.type === 'Compound'
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
            )}>
              {exercise.type}
            </span>
          </div>

          {/* Target info */}
          {(targetReps || targetRPE) && (
            <div className="flex items-center gap-2 mt-3 text-sm">
              <Target className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-400">
                {totalSets} sets × {targetReps || '8-12'} reps
                {targetRPE && <span className="text-gray-400"> @ RPE {targetRPE}</span>}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* === Sets grid === */}
      <div className="px-3 pb-3 pt-1">
        <div className={cn(
          'grid gap-2',
          totalSets <= 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'
        )}>
          {sets.map((set, idx) => {
            const isCurrent = idx === currentSetIndex && isActive;
            const status: 'completed' | 'active' | 'pending' = set.completed
              ? 'completed'
              : isCurrent
                ? 'active'
                : 'pending';

            return (
              <SetCard
                key={set.id}
                setNumber={idx + 1}
                status={status}
                setType={set.type}
                data={set.completed ? { weight: set.weight, reps: set.reps, rpe: set.rpe || 0 } : undefined}
                target={{ reps: set.targetReps, rpe: set.targetRPE }}
                recommendedWeight={set.recommendedWeight}
                onClick={() => onSetClick(idx)}
                onDelete={onDeleteSet ? () => onDeleteSet(idx) : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* === Summary footer === */}
      {completedSets.length > 0 && (
        <div className="mx-3 mb-3 px-4 py-2.5 rounded-xl bg-gray-800/30 border border-gray-800/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-gray-400 text-xs">Volumen </span>
                <span className="font-bold text-white">
                  {totalVolume.toLocaleString()} kg
                </span>
              </div>
              {avgRPE > 0 && (
                <div>
                  <span className="text-gray-400 text-xs">RPE </span>
                  <span className={cn('font-bold', getRPEColor(avgRPE))}>
                    {avgRPE.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {progress === 100 && (
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">
                Completado
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
