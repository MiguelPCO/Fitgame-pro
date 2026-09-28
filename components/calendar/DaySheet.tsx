import React, { useState } from 'react';
import { GripVertical, Plus, SkipForward, CalendarClock, Play } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ScheduledSession } from '../../types';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { ACTIVITY, STATUS } from './activity';

export interface MoveTarget {
  iso: string;
  label: string;
}

export interface SessionCardProps {
  session: ScheduledSession;
  /** Linea secundaria: "5 ejercicios · 50 min". */
  meta?: string;
  /** Dias validos segun las 3 reglas. Vacio = la sesion no se puede mover. */
  moveTargets: MoveTarget[];
  onMove: (isoDate: string) => void;
  onSkip: () => void;
  onStart?: () => void;
  /** Arrastre: el padre decide cuando se levanta la tarjeta. */
  onDragHandleDown?: (event: React.PointerEvent<HTMLButtonElement>) => void;
  isDragging?: boolean;
}

/**
 * Tarjeta de una sesion del plan. Estado y tipo se leen sin depender del color:
 * barra + icono de tipo + icono y texto de estado.
 *
 * "Mover a" es la via accesible de la reprogramacion: el arrastre es el atajo,
 * no la unica forma, porque arrastrar con teclado o con lector de pantalla no
 * es posible.
 */
export const SessionCard: React.FC<SessionCardProps> = ({
  session, meta, moveTargets, onMove, onSkip, onStart, onDragHandleDown, isDragging,
}) => {
  const [showMove, setShowMove] = useState(false);
  const activity = ACTIVITY[session.activityType];
  const status = STATUS[session.status];
  const TypeIcon = activity.icon;
  const StatusIcon = status.icon;
  const isOpen = session.status === 'planned' || session.status === 'moved';

  return (
    <div
      className={cn(
        'flex rounded-2xl border bg-background-card overflow-hidden',
        activity.border,
        isDragging && 'opacity-60 ring-2 ring-primary'
      )}
    >
      <span className={cn('w-1.5 shrink-0', activity.bar)} aria-hidden="true" />

      <div className="flex-1 min-w-0 p-3">
        <div className="flex items-start gap-2">
          <TypeIcon className={cn('w-5 h-5 shrink-0 mt-0.5', activity.text)} aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-text-main truncate">{session.title}</p>
            {meta && <p className="text-xs text-text-muted mt-0.5">{meta}</p>}
            <p className={cn('flex items-center gap-1 text-xs font-bold mt-1.5', activity.text)}>
              <StatusIcon className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" />
              {status.label}
            </p>
          </div>

          {isOpen && moveTargets.length > 0 && (
            <button
              type="button"
              onPointerDown={onDragHandleDown}
              onClick={() => setShowMove(v => !v)}
              aria-label={`Mover ${session.title}`}
              aria-expanded={showMove}
              className="min-w-11 min-h-11 -mr-1 -mt-1 flex items-center justify-center rounded-lg text-text-muted hover:text-text-main hover:bg-surface-raised transition-colors duration-fast touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <GripVertical className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {showMove && (
          <div className="mt-3 pt-3 border-t border-divider">
            <p className="text-2xs font-bold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5" aria-hidden="true" />
              Mover a
            </p>
            <div className="flex flex-wrap gap-2">
              {moveTargets.map(t => (
                <button
                  key={t.iso}
                  type="button"
                  onClick={() => { onMove(t.iso); setShowMove(false); }}
                  className="min-h-11 px-3 rounded-xl border border-divider bg-surface-raised text-sm font-medium text-text-main hover:border-primary transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {isOpen && (
          <div className="flex flex-wrap gap-2 mt-3">
            {onStart && (
              <Button size="sm" leftIcon={<Play className="w-4 h-4" />} onClick={onStart} className="min-h-11">
                Empezar
              </Button>
            )}
            {/* Saltar, nunca borrar: la progresion del plan depende de la sesion prevista */}
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<SkipForward className="w-4 h-4" />}
              onClick={onSkip}
              className="min-h-11"
            >
              Saltar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export interface DaySheetProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  sessions: ScheduledSession[];
  onAdd: () => void;
  children: React.ReactNode;
}

const formatDayTitle = (date: Date): string => {
  const text = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/** Agenda de un dia en hoja inferior. Es como se entra a un dia desde la vista mes. */
export const DaySheet: React.FC<DaySheetProps> = ({ isOpen, onClose, date, sessions, onAdd, children }) => (
  <Sheet isOpen={isOpen} onClose={onClose} title={formatDayTitle(date)} size="md">
    <div className="p-4 space-y-3">
      {sessions.length === 0 && (
        <p className="text-sm text-text-muted text-center py-4">Sin sesiones este dia.</p>
      )}
      {children}
      <button
        type="button"
        onClick={onAdd}
        className="w-full min-h-11 py-3 rounded-2xl border border-dashed border-border-input text-text-muted hover:text-text-main hover:border-primary transition-colors duration-fast flex items-center justify-center gap-2 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
        Anadir sesion
      </button>
    </div>
  </Sheet>
);

export default DaySheet;
