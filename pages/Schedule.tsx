import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Coffee, Dumbbell, Footprints, Plus, Settings2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Sheet } from '../components/ui/Sheet';
import { WeekStrip } from '../components/calendar/WeekStrip';
import { MonthGrid } from '../components/calendar/MonthGrid';
import { DaySheet, MoveTarget, SessionCard } from '../components/calendar/DaySheet';
import { RacePlanSheet } from '../components/run/RacePlanSheet';
import { ScheduledSession, WeeklySchedule, WorkoutTemplate } from '../types';
import {
  addDays, fromISODate, getMonthGridDates, getWeekDates, groupByDate,
  MOVE_WINDOW_DAYS, toISODate, validTargetDates,
} from '../lib/schedule';
import { generateRacePlan } from '../lib/templateGenerator';
import { cn } from '../lib/utils';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'] as const;
const SHORT_DAYS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'] as const;

/** Milisegundos de pulsacion antes de levantar la tarjeta. Por debajo compite con el scroll. */
const LONG_PRESS_MS = 400;

type CalendarView = 'week' | 'month';

const formatMonthYear = (date: Date): string =>
  date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

const formatShortMonth = (date: Date): string =>
  date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });

const formatFullDay = (date: Date): string =>
  date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

const Schedule: React.FC = () => {
  const {
    user, templates, weeklySchedule, setWeeklySchedule, scheduledSessions,
    moveScheduledSession, addScheduledSession, skipScheduledSession, applyRacePlan,
    startSessionFromTemplate,
  } = useApp();
  const { toast } = useToast();

  const [view, setView] = useState<CalendarView>('week');
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [daySheetOpen, setDaySheetOpen] = useState(false);
  const [addFor, setAddFor] = useState<string | null>(null);
  const [templateSheetOpen, setTemplateSheetOpen] = useState(false);
  const [racePlanSheetOpen, setRacePlanSheetOpen] = useState(false);

  // Arrastre: la sesion levantada. null = no hay arrastre.
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const pressTimerRef = useRef<number | null>(null);

  const sessionsByDate = useMemo(() => groupByDate(scheduledSessions), [scheduledSessions]);
  const weekDates = useMemo(() => getWeekDates(anchorDate), [anchorDate]);
  const monthDates = useMemo(() => getMonthGridDates(anchorDate), [anchorDate]);
  const selectedISO = toISODate(selectedDate);
  const daySessions = sessionsByDate.get(selectedISO) ?? [];

  const templateById = useMemo(
    () => new Map(templates.map(t => [t.id, t])),
    [templates]
  );

  const draggedSession = draggedId ? scheduledSessions.find(s => s.id === draggedId) : undefined;

  /** Dias iluminados mientras se arrastra: los que pasan las 3 reglas. */
  const dropTargets = useMemo(() => {
    if (!draggedSession) return null;
    return validTargetDates(draggedSession, scheduledSessions, weekDates);
  }, [draggedSession, scheduledSessions, weekDates]);

  const clearPressTimer = () => {
    if (pressTimerRef.current !== null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  useEffect(() => clearPressTimer, []);

  // Soltar fuera de la tira cancela el arrastre en lugar de dejar la tarjeta levantada.
  useEffect(() => {
    if (!draggedId) return;
    const cancel = () => setDraggedId(null);
    window.addEventListener('pointerup', cancel);
    window.addEventListener('pointercancel', cancel);
    return () => {
      window.removeEventListener('pointerup', cancel);
      window.removeEventListener('pointercancel', cancel);
    };
  }, [draggedId]);

  /**
   * Mantener pulsado levanta la tarjeta; es obligatorio para no competir con el
   * scroll vertical. Soltar antes de tiempo cancela: si no, un toque corto acaba
   * levantando la tarjeta 400 ms despues, cuando el dedo ya no esta.
   */
  const handleDragHandleDown = useCallback((sessionId: string) => {
    clearPressTimer();
    const cancel = () => {
      clearPressTimer();
      window.removeEventListener('pointerup', cancel);
      window.removeEventListener('pointercancel', cancel);
    };
    window.addEventListener('pointerup', cancel);
    window.addEventListener('pointercancel', cancel);

    pressTimerRef.current = window.setTimeout(() => {
      cancel();
      setDraggedId(sessionId);
      if (navigator.vibrate) navigator.vibrate(10);
    }, LONG_PRESS_MS);
  }, []);

  // Cambiar de vista cancela el arrastre: la zona de soltado es la tira de la semana.
  useEffect(() => { setDraggedId(null); }, [view]);

  const handleMove = useCallback((sessionId: string, targetISO: string) => {
    const result = moveScheduledSession(sessionId, targetISO);
    setDraggedId(null);
    if (!result.ok) {
      toast(result.reason ?? 'No se puede mover ahi', 'error');
      return;
    }
    toast('Sesion reprogramada', 'success');
  }, [moveScheduledSession, toast]);

  const handleDropDay = useCallback((iso: string) => {
    if (draggedId) handleMove(draggedId, iso);
  }, [draggedId, handleMove]);

  const goPrev = () => setAnchorDate(prev =>
    view === 'week' ? addDays(prev, -7) : new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goNext = () => setAnchorDate(prev =>
    view === 'week' ? addDays(prev, 7) : new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const goToday = () => {
    const today = new Date();
    setAnchorDate(today);
    setSelectedDate(today);
  };

  const moveTargetsFor = useCallback((session: ScheduledSession): MoveTarget[] => {
    const from = fromISODate(session.scheduledFor);
    const candidates = Array.from(
      { length: MOVE_WINDOW_DAYS * 2 + 1 },
      (_, i) => addDays(from, i - MOVE_WINDOW_DAYS)
    );
    const valid = validTargetDates(session, scheduledSessions, candidates);
    return candidates
      .filter(d => valid.has(toISODate(d)))
      .map(d => ({ iso: toISODate(d), label: `${SHORT_DAYS[d.getDay()]} ${d.getDate()}` }));
  }, [scheduledSessions]);

  const metaFor = (template?: WorkoutTemplate): string | undefined => {
    if (!template) return undefined;
    const n = template.exercises.length;
    return `${n} ${n === 1 ? 'ejercicio' : 'ejercicios'} · ${template.duration}`;
  };

  const renderCard = (session: ScheduledSession) => {
    const template = session.templateId ? templateById.get(session.templateId) : undefined;
    const isTodayCard = session.scheduledFor === toISODate(new Date());
    return (
      <SessionCard
        key={session.id}
        session={session}
        meta={metaFor(template)}
        moveTargets={moveTargetsFor(session)}
        onMove={iso => handleMove(session.id, iso)}
        onSkip={() => { skipScheduledSession(session.id); toast('Sesion marcada como saltada', 'info'); }}
        onStart={isTodayCard && template ? () => startSessionFromTemplate(template) : undefined}
        onDragHandleDown={() => handleDragHandleDown(session.id)}
        isDragging={draggedId === session.id}
      />
    );
  };

  const openDay = (date: Date) => {
    setSelectedDate(date);
    if (view === 'month') setDaySheetOpen(true);
  };

  const handleAdd = (templateId: string | null) => {
    if (!addFor) return;
    addScheduledSession(addFor, templateId);
    setAddFor(null);
    toast('Sesion anadida al plan', 'success');
  };

  // En movil el rotulo tiene que caber en una linea entre las dos flechas.
  const periodLabel = view === 'week'
    ? `${weekDates[0].getDate()} – ${weekDates[6].getDate()} ${formatShortMonth(weekDates[6])}`
    : formatMonthYear(anchorDate);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Cabecera: titulo + conmutador de vista */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-black text-text-main flex items-center gap-2">
            <CalendarDays className="w-6 h-6 md:w-7 md:h-7 text-primary" aria-hidden="true" />
            Plan
          </h1>
          <p className="text-sm text-text-muted mt-1">Tu Programa Semanal, dia a dia</p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-raised border border-divider shrink-0" role="tablist" aria-label="Vista del calendario">
          {(['week', 'month'] as const).map(v => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={cn(
                'min-h-11 px-3 rounded-lg text-sm font-bold transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                view === v ? 'bg-primary text-primary-ink' : 'text-text-muted hover:text-text-main'
              )}
            >
              {v === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      {/* Navegacion de periodo */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={goPrev}
          aria-label={view === 'week' ? 'Semana anterior' : 'Mes anterior'}
          className="min-w-11 min-h-11 flex items-center justify-center rounded-xl text-text-muted hover:text-text-main hover:bg-surface-raised transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={goToday}
          className="min-h-11 px-3 rounded-xl text-sm font-bold text-text-main hover:bg-surface-raised transition-colors duration-fast first-letter:uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {periodLabel}
        </button>

        <button
          type="button"
          onClick={goNext}
          aria-label={view === 'week' ? 'Semana siguiente' : 'Mes siguiente'}
          className="min-w-11 min-h-11 flex items-center justify-center rounded-xl text-text-muted hover:text-text-main hover:bg-surface-raised transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {draggedSession && (
        <p role="status" className="text-sm font-bold text-primary text-center">
          Suelta en un dia iluminado para mover «{draggedSession.title}»
        </p>
      )}

      {view === 'week' ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="space-y-5">
            <WeekStrip
              weekDates={weekDates}
              selectedDate={selectedDate}
              onSelectDate={openDay}
              sessionsByDate={sessionsByDate}
              dropTargets={dropTargets}
              onDropDay={handleDropDay}
            />

            {/* Agenda del dia seleccionado */}
            <section aria-label={`Sesiones del ${formatFullDay(selectedDate)}`} className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted first-letter:uppercase">
                {formatFullDay(selectedDate)}
              </h2>
              {daySessions.map(renderCard)}
              {/* Un dia vacio es un "+ Anadir", no un hueco muerto */}
              <button
                type="button"
                onClick={() => setAddFor(selectedISO)}
                className="w-full min-h-11 py-3 rounded-2xl border border-dashed border-border-input text-text-muted hover:text-text-main hover:border-primary transition-colors duration-fast flex items-center justify-center gap-2 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Anadir
              </button>
            </section>
          </div>

          <Card className="hidden lg:block">
            <MonthGrid
              monthDates={monthDates}
              anchorDate={anchorDate}
              selectedDate={selectedDate}
              onSelectDate={openDay}
              sessionsByDate={sessionsByDate}
            />
          </Card>
        </div>
      ) : (
        <Card>
          <MonthGrid
            monthDates={monthDates}
            anchorDate={anchorDate}
            selectedDate={selectedDate}
            onSelectDate={openDay}
            sessionsByDate={sessionsByDate}
          />
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="secondary"
          fullWidth
          leftIcon={<Settings2 className="w-4 h-4" />}
          onClick={() => setTemplateSheetOpen(true)}
          className="min-h-11 sm:w-auto"
        >
          Editar plantilla semanal
        </Button>
        <Button
          variant="secondary"
          fullWidth
          leftIcon={<Footprints className="w-4 h-4" />}
          onClick={() => setRacePlanSheetOpen(true)}
          className="min-h-11 sm:w-auto"
        >
          Generar plan de carrera
        </Button>
      </div>

      <DaySheet
        isOpen={daySheetOpen}
        onClose={() => setDaySheetOpen(false)}
        date={selectedDate}
        sessions={daySessions}
        onAdd={() => { setDaySheetOpen(false); setAddFor(selectedISO); }}
      >
        {daySessions.map(renderCard)}
      </DaySheet>

      <AddSessionSheet
        isoDate={addFor}
        templates={templates}
        onClose={() => setAddFor(null)}
        onPick={handleAdd}
      />

      <WeeklyTemplateSheet
        isOpen={templateSheetOpen}
        onClose={() => setTemplateSheetOpen(false)}
        templates={templates}
        weeklySchedule={weeklySchedule}
        onSave={schedule => {
          setWeeklySchedule(schedule);
          setTemplateSheetOpen(false);
          toast('Programa guardado', 'success');
        }}
      />

      <RacePlanSheet
        isOpen={racePlanSheetOpen}
        onClose={() => setRacePlanSheetOpen(false)}
        defaultExperienceLevel={user?.experienceLevel ?? 'Intermediate'}
        defaultDaysPerWeek={user?.daysPerWeek ?? 4}
        onGenerate={values => {
          const sessions = generateRacePlan(values);
          applyRacePlan(sessions);
          setRacePlanSheetOpen(false);
          toast(`Plan generado: ${sessions.length} sesiones anadidas al calendario`, 'success');
        }}
      />
    </div>
  );
};

/** Elegir que se anade a un dia: una rutina existente o descanso. */
const AddSessionSheet: React.FC<{
  isoDate: string | null;
  templates: WorkoutTemplate[];
  onClose: () => void;
  onPick: (templateId: string | null) => void;
}> = ({ isoDate, templates, onClose, onPick }) => (
  <Sheet isOpen={isoDate !== null} onClose={onClose} title="Anadir al plan" size="md">
    <div className="p-4 space-y-2">
      <button
        type="button"
        onClick={() => onPick(null)}
        className="w-full min-h-11 p-3 rounded-xl border border-divider bg-surface-raised flex items-center gap-3 text-left hover:border-primary transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Coffee className="w-5 h-5 text-rest" aria-hidden="true" />
        <span className="font-bold text-text-main">Descanso</span>
      </button>
      {templates.map(t => (
        <button
          key={t.id}
          type="button"
          onClick={() => onPick(t.id)}
          className="w-full min-h-11 p-3 rounded-xl border border-divider flex items-center gap-3 text-left hover:border-primary transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Dumbbell className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block font-bold text-text-main truncate">{t.name}</span>
            <span className="block text-xs text-text-muted">{t.duration}</span>
          </span>
        </button>
      ))}
      {templates.length === 0 && (
        <p className="text-sm text-text-muted text-center py-4">No hay plantillas creadas.</p>
      )}
    </div>
  </Sheet>
);

/**
 * La plantilla semanal recurrente que ya existia. No desaparece: sigue siendo la
 * que genera las sesiones con fecha hacia delante (06-modelo-datos.md SS C).
 */
const WeeklyTemplateSheet: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  templates: WorkoutTemplate[];
  weeklySchedule: WeeklySchedule;
  onSave: (schedule: WeeklySchedule) => void;
}> = ({ isOpen, onClose, templates, weeklySchedule, onSave }) => {
  const [draft, setDraft] = useState<WeeklySchedule>(weeklySchedule);

  useEffect(() => {
    if (isOpen) setDraft(weeklySchedule);
  }, [isOpen, weeklySchedule]);

  const assign = (day: number, templateId: string | null) => {
    setDraft(prev => {
      const next = { ...prev };
      if (templateId) next[day as keyof WeeklySchedule] = templateId;
      else delete next[day as keyof WeeklySchedule];
      return next;
    });
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Programa Semanal" size="lg">
      <div className="p-4 space-y-3">
        <p className="text-sm text-text-muted">
          Esta plantilla se repite cada semana y es la que rellena el calendario hacia delante.
        </p>

        {[1, 2, 3, 4, 5, 6, 0].map(day => (
          <div key={day} className="space-y-2">
            <label htmlFor={`day-${day}`} className="text-xs font-bold uppercase tracking-wider text-text-muted">
              {DAY_NAMES[day]}
            </label>
            <select
              id={`day-${day}`}
              value={draft[day as keyof WeeklySchedule] ?? ''}
              onChange={e => assign(day, e.target.value || null)}
              className="w-full min-h-11 px-3 rounded-xl bg-background border border-border-input text-text-main focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-colors duration-fast"
            >
              <option value="">Descanso</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        ))}

        <Button fullWidth onClick={() => onSave(draft)} className="min-h-11">
          Guardar Programa
        </Button>
      </div>
    </Sheet>
  );
};

export default Schedule;
