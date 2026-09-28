import React from 'react';
import { cn } from '../../lib/utils';
import { ScheduledSession } from '../../types';
import { isSameDay } from '../../lib/dateUtils';
import { toISODate } from '../../lib/schedule';
import { ACTIVITY, describeSession, STATUS } from './activity';

const DAY_INITIALS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;

export interface WeekStripProps {
  weekDates: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  sessionsByDate: Map<string, ScheduledSession[]>;
  /**
   * Dias a los que se puede soltar la sesion que se esta arrastrando.
   * null = no hay arrastre en curso.
   */
  dropTargets?: Set<string> | null;
  onDropDay?: (isoDate: string) => void;
}

/**
 * Marca de una sesion dentro del dia: color del tipo + icono del estado.
 * Sobre el dia seleccionado el color del tipo no llega a AA contra el fondo de
 * marca, asi que ahi se usa la tinta del primario; el tipo sigue leyendose por
 * el icono y por la agenda de debajo.
 */
const DayMarker: React.FC<{ session: ScheduledSession; isSelected: boolean }> = ({ session, isSelected }) => {
  const activity = ACTIVITY[session.activityType];
  const StatusIcon = STATUS[session.status].icon;
  const done = session.status === 'completed';

  return (
    <span
      className={cn(
        'w-5 h-5 rounded-full flex items-center justify-center border',
        isSelected
          ? (done ? 'bg-primary-ink border-transparent' : 'bg-transparent border-primary-ink/50')
          : (done ? cn(activity.bar, 'border-transparent') : cn(activity.bg, activity.border))
      )}
    >
      <StatusIcon
        className={cn(
          'w-3 h-3',
          isSelected ? (done ? 'text-primary' : 'text-primary-ink') : (done ? 'text-background' : activity.text)
        )}
        strokeWidth={3}
        aria-hidden="true"
      />
    </span>
  );
};

/**
 * Tira de 7 dias de la vista semana. Tambien es la zona de soltado del arrastre:
 * mientras se arrastra, los dias validos se iluminan y los invalidos se atenuan
 * (05-arquitectura-ux.md SS 4.2, regla 4).
 */
export const WeekStrip: React.FC<WeekStripProps> = ({
  weekDates, selectedDate, onSelectDate, sessionsByDate, dropTargets = null, onDropDay,
}) => {
  const today = new Date();
  const dragging = dropTargets !== null;

  return (
    <div className="grid grid-cols-7 gap-1 sm:gap-2" role="group" aria-label="Dias de la semana">
      {weekDates.map(date => {
        const iso = toISODate(date);
        const sessions = sessionsByDate.get(iso) ?? [];
        const isSelected = isSameDay(date, selectedDate);
        const isToday = isSameDay(date, today);
        const isValidTarget = dropTargets?.has(iso) ?? false;

        const label = sessions.length === 0
          ? `${iso}, sin sesiones`
          : `${iso}, ${sessions.map(s => describeSession(s.title, s.activityType, s.status)).join('; ')}`;

        return (
          <button
            key={iso}
            type="button"
            data-day={iso}
            onClick={() => (dragging && onDropDay ? onDropDay(iso) : onSelectDate(date))}
            aria-label={label}
            aria-current={isSelected ? 'date' : undefined}
            className={cn(
              'min-h-[76px] flex flex-col items-center gap-1 py-2 px-0.5 rounded-xl border',
              'transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              isSelected
                ? 'bg-primary border-primary text-primary-ink'
                : 'bg-background-card border-divider hover:border-border-input',
              isToday && !isSelected && 'ring-2 ring-primary/60',
              dragging && (isValidTarget
                ? 'border-success bg-success/10'
                : 'opacity-40 pointer-events-none')
            )}
          >
            <span className={cn('text-2xs font-bold uppercase', isSelected ? 'text-primary-ink/80' : 'text-text-muted')}>
              {DAY_INITIALS[(date.getDay() + 6) % 7]}
            </span>
            <span className={cn('text-lg font-black leading-none', isSelected ? 'text-primary-ink' : 'text-text-main')}>
              {date.getDate()}
            </span>
            <span className="flex flex-col items-center gap-0.5 mt-0.5" aria-hidden="true">
              {sessions.slice(0, 2).map(s => <DayMarker key={s.id} session={s} isSelected={isSelected} />)}
              {sessions.length === 0 && (
                <span className={cn('w-3 h-0.5 rounded-full', isSelected ? 'bg-primary-ink/40' : 'bg-border-input')} />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default WeekStrip;
