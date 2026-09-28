import React from 'react';
import { cn } from '../../lib/utils';
import { ScheduledSession } from '../../types';
import { isSameDay } from '../../lib/dateUtils';
import { toISODate } from '../../lib/schedule';
import { ACTIVITY, describeSession, STATUS } from './activity';

const DAY_INITIALS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;
const LEGEND = ['strength', 'run', 'mobility', 'rest'] as const;

export interface MonthGridProps {
  /** Dias de la cuadricula: semanas completas, puede incluir dias del mes vecino. */
  monthDates: Date[];
  /** Mes que se esta mirando, para atenuar los dias de fuera. */
  anchorDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  sessionsByDate: Map<string, ScheduledSession[]>;
}

/**
 * Vista mes: contexto de carga, no operativa. Lee el mismo `sessionsByDate` que
 * WeekStrip, por eso las dos vistas no pueden contradecirse.
 */
export const MonthGrid: React.FC<MonthGridProps> = ({
  monthDates, anchorDate, selectedDate, onSelectDate, sessionsByDate,
}) => {
  const today = new Date();
  const month = anchorDate.getMonth();

  const inMonth = monthDates.filter(d => d.getMonth() === month);
  const monthSessions = inMonth.flatMap(d => sessionsByDate.get(toISODate(d)) ?? []);
  const done = monthSessions.filter(s => s.status === 'completed').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-1" aria-hidden="true">
        {DAY_INITIALS.map((d, i) => (
          <span key={i} className="text-2xs font-bold uppercase text-text-muted text-center py-1">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2" role="group" aria-label="Dias del mes">
        {monthDates.map(date => {
          const iso = toISODate(date);
          const sessions = sessionsByDate.get(iso) ?? [];
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          const isOutside = date.getMonth() !== month;

          const label = sessions.length === 0
            ? `${iso}, sin sesiones`
            : `${iso}, ${sessions.map(s => describeSession(s.title, s.activityType, s.status)).join('; ')}`;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate(date)}
              aria-label={label}
              aria-current={isSelected ? 'date' : undefined}
              className={cn(
                'min-h-11 aspect-square flex flex-col items-center justify-center gap-1 rounded-xl border',
                'transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isSelected
                  ? 'bg-primary border-primary'
                  : 'bg-background-card border-divider hover:border-border-input',
                isToday && !isSelected && 'ring-2 ring-primary/60',
                isOutside && 'opacity-40'
              )}
            >
              <span className={cn('text-sm font-bold leading-none', isSelected ? 'text-primary-ink' : 'text-text-main')}>
                {date.getDate()}
              </span>
              <span className="flex items-center gap-0.5 h-3" aria-hidden="true">
                {sessions.slice(0, 2).map(s => {
                  const StatusIcon = STATUS[s.status].icon;
                  return (
                    <StatusIcon
                      key={s.id}
                      className={cn('w-3 h-3', isSelected ? 'text-primary-ink' : ACTIVITY[s.activityType].text)}
                      strokeWidth={3}
                    />
                  );
                })}
              </span>
            </button>
          );
        })}
      </div>

      {/* Leyenda siempre visible: el color por si solo no identifica nada */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-divider">
        {LEGEND.map(type => {
          const { label, icon: Icon, text } = ACTIVITY[type];
          return (
            <span key={type} className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <Icon className={cn('w-4 h-4', text)} aria-hidden="true" />
              {label}
            </span>
          );
        })}
      </div>

      <p className="text-sm text-text-muted">
        <span className="font-bold text-text-main">{done}</span> de {monthSessions.length} sesiones completadas este mes
      </p>
    </div>
  );
};

export default MonthGrid;
