import { CheckCircle2, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Exercise } from '../../types';

interface ExerciseSidebarProps {
  exercises: Exercise[];
  currentIndex: number;
  completedExercises: number[];
  onSelectExercise: (index: number) => void;
  setsProgress?: { completed: number; total: number }[];
  onAddExercise?: () => void;
}

export function ExerciseSidebar({
  exercises,
  currentIndex,
  completedExercises,
  onSelectExercise,
  setsProgress,
  onAddExercise,
}: ExerciseSidebarProps) {
  return (
    <div className="space-y-1">
      {exercises.map((exercise, idx) => {
        const isDone = completedExercises.includes(idx);
        const isCurrent = idx === currentIndex;
        const isPending = !isDone && !isCurrent;
        const canClick = isDone || isCurrent;

        const progress = setsProgress?.[idx];

        return (
          <button
            key={exercise.id + '-' + idx}
            onClick={() => canClick && onSelectExercise(idx)}
            disabled={!canClick}
            className={cn(
              'w-full text-left p-3 rounded-xl transition-all duration-200 group',
              'flex items-center gap-3',
              isCurrent && 'bg-primary/10 border border-primary/30 ring-1 ring-primary/20',
              isDone && !isCurrent && 'border border-transparent opacity-80 hover:opacity-100 hover:bg-green-500/5',
              isPending && 'border border-transparent opacity-40 cursor-not-allowed',
              canClick && !isCurrent && 'hover:bg-background-lighter/50'
            )}
            aria-label={`Ejercicio ${idx + 1}: ${exercise.name}`}
          >
            {/* Status indicator */}
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold',
              isDone && 'bg-green-500/20 text-green-400',
              isCurrent && !isDone && 'bg-primary/20 text-primary',
              isPending && 'bg-gray-800 text-gray-600'
            )}>
              {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
            </div>

            {/* Exercise info */}
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-bold truncate',
                isCurrent && 'text-white',
                isDone && !isCurrent && 'text-green-300 group-hover:text-white',
                isPending && 'text-gray-500'
              )}>
                {exercise.name}
              </p>
              <span className="text-[10px] text-gray-500 uppercase truncate block">
                {exercise.muscleGroup.join(' · ')}
              </span>
            </div>

            {/* Set progress */}
            {progress && (
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={cn(
                  'text-xs font-bold',
                  isDone ? 'text-green-400' : isCurrent ? 'text-gray-300' : 'text-gray-600'
                )}>
                  {progress.completed}/{progress.total}
                </span>
                <div className="w-10 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      isDone ? 'bg-green-500' : 'bg-primary'
                    )}
                    style={{ width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </button>
        );
      })}

      {/* Add exercise button */}
      {onAddExercise && (
        <button
          onClick={onAddExercise}
          className={cn(
            'w-full mt-2 py-2.5 rounded-xl text-sm font-bold',
            'bg-background-lighter/50 border border-gray-700 text-text-muted',
            'hover:text-white hover:border-gray-600',
            'transition-all flex items-center justify-center gap-2'
          )}
        >
          <Plus className="w-4 h-4" /> Agregar ejercicio
        </button>
      )}
    </div>
  );
}
