import { useState } from 'react';
import { X, Timer, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatTime } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Modal, ModalBody, ModalFooter } from '../ui/Modal';

interface SessionHeaderProps {
  exerciseIndex: number;
  totalExercises: number;
  sessionTime: number;
  sessionXP?: number;
  onExit: () => void;
}

export function SessionHeader({
  exerciseIndex,
  totalExercises,
  sessionTime,
  sessionXP = 0,
  onExit,
}: SessionHeaderProps) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const current = exerciseIndex + 1;
  const progress = totalExercises > 0 ? (current / totalExercises) * 100 : 0;

  return (
    <>
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-gray-800/50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Exercise counter */}
          <span className="text-sm font-bold text-white">
            Ejercicio{' '}
            <span className="text-primary">{current}</span>
            <span className="text-text-muted">/{totalExercises}</span>
          </span>

          {/* Session timer */}
          <div className="flex items-center gap-1.5 text-sm text-text-muted">
            <Timer className="w-4 h-4" />
            <span className="font-mono font-semibold tabular-nums">
              {formatTime(sessionTime)}
            </span>
          </div>

          {/* XP counter */}
          <div className="flex items-center gap-1 text-sm font-bold text-amber-400">
            <Zap className="w-4 h-4" />
            <span className="tabular-nums">{sessionXP}</span>
            <span className="text-amber-400/60 text-xs">XP</span>
          </div>

          {/* Exit button */}
          <button
            onClick={() => setShowExitConfirm(true)}
            className={cn(
              'w-9 h-9 flex items-center justify-center rounded-full',
              'bg-gray-800/60 text-text-muted hover:text-white hover:bg-red-600/20 hover:text-red-400',
              'transition-all duration-200 active:scale-90'
            )}
            aria-label="Salir del entrenamiento"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Exit confirmation modal */}
      <Modal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        title="Salir del entrenamiento"
        size="sm"
      >
        <ModalBody>
          <p className="text-text-muted">
            La sesión quedará pausada y podrás retomarla después. ¿Salir ahora?
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExitConfirm(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setShowExitConfirm(false);
              onExit();
            }}
          >
            Salir
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
