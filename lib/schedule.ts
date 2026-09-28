import { ActivityType, ScheduledSession, ScheduledStatus, WeeklySchedule, WorkoutSession, WorkoutTemplate } from '../types';

/**
 * Logica del calendario (Fase 4). Todo gira sobre fechas 'YYYY-MM-DD':
 * scheduled_for es DATE, no TIMESTAMPTZ, para que el entreno del martes siga
 * siendo del martes al cambiar de zona horaria (06-modelo-datos.md SS C).
 */

/** Semanas hacia delante que se proyectan desde la plantilla semanal. */
export const PROJECTION_WEEKS = 8;

/** Margen de reprogramacion: mas o menos una semana (05-arquitectura-ux.md SS 4.2, regla 1). */
export const MOVE_WINDOW_DAYS = 7;

export const toISODate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** Medianoche local. Parsear con new Date('YYYY-MM-DD') daria UTC y restaria un dia. */
export const fromISODate = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/** Lunes de la semana de `date`. La semana empieza en lunes en toda la app. */
export const startOfWeek = (date: Date): Date => {
  const day = date.getDay();
  return addDays(date, day === 0 ? -6 : 1 - day);
};

export const getWeekDates = (anchor: Date): Date[] => {
  const monday = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
};

/** Dias de la cuadricula del mes: semanas completas de lunes a domingo. */
export const getMonthGridDates = (anchor: Date): Date[] => {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const last = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  const start = startOfWeek(first);
  const end = addDays(startOfWeek(last), 6);
  const dates: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) dates.push(d);
  return dates;
};

export const diffInDays = (a: string, b: string): number =>
  Math.round((fromISODate(a).getTime() - fromISODate(b).getTime()) / 86400000);

/**
 * Deriva el tipo de actividad de una plantilla. La Fase 3 marca las rutinas de
 * carrera con muscleFocus 'Cardio'; hasta que exista activity_type en plantillas
 * (Fase 5) esta es la unica senal disponible.
 */
export const activityTypeOf = (template?: WorkoutTemplate): ActivityType => {
  if (!template) return 'strength';
  const focus = template.muscleFocus.map(m => m.toLowerCase());
  if (focus.includes('cardio')) return 'run';
  if (focus.includes('mobility') || focus.includes('movilidad')) return 'mobility';
  return 'strength';
};

/** id estable por dia: la plantilla semanal asigna como mucho una rutina por dia. */
const weeklyId = (iso: string): string => `wk-${iso}`;

export interface ProjectionOptions {
  from: Date;
  weeks?: number;
}

/**
 * Proyecta la plantilla semanal a filas con fecha, desde el lunes de `from`.
 *
 * Es idempotente: el id depende solo de la fecha, asi que volver a proyectar no
 * duplica nada. Una fila ya existente solo se actualiza si sigue en 'planned' y
 * la plantilla del dia ha cambiado; completada, saltada o movida no se toca,
 * porque ya es historia del usuario.
 */
export function projectWeeklySchedule(
  existing: ScheduledSession[],
  weeklySchedule: WeeklySchedule,
  templates: WorkoutTemplate[],
  { from, weeks = PROJECTION_WEEKS }: ProjectionOptions
): ScheduledSession[] {
  const byId = new Map(existing.map(s => [s.id, s]));
  const monday = startOfWeek(from);

  for (let i = 0; i < weeks * 7; i++) {
    const date = addDays(monday, i);
    const templateId = weeklySchedule[date.getDay() as keyof WeeklySchedule];
    if (!templateId) continue;

    const template = templates.find(t => t.id === templateId);
    if (!template) continue;

    const iso = toISODate(date);
    const id = weeklyId(iso);
    const current = byId.get(id);

    if (current && (current.status !== 'planned' || current.templateId === templateId)) continue;

    byId.set(id, {
      id,
      scheduledFor: current?.scheduledFor ?? iso,
      activityType: activityTypeOf(template),
      templateId,
      title: template.name,
      status: 'planned',
      sortOrder: 0,
    });
  }

  return [...byId.values()];
}

/**
 * Marca como completada la sesion planificada que cuadre con una sesion real del
 * historial. Sin esto, semana y mes mostrarian "planificado" en un dia que el
 * usuario ya entreno, que es justo la contradiccion que el criterio prohibe.
 */
export function reconcileWithHistory(
  sessions: ScheduledSession[],
  history: WorkoutSession[]
): ScheduledSession[] {
  const completedByDate = new Map<string, WorkoutSession[]>();
  for (const s of history) {
    if (!s.completed && s.status !== 'completed') continue;
    const ts = s.endTime ?? s.startTime;
    const iso = s.date ? s.date.slice(0, 10) : ts ? toISODate(new Date(ts)) : null;
    if (!iso) continue;
    const list = completedByDate.get(iso) ?? [];
    list.push(s);
    completedByDate.set(iso, list);
  }

  return sessions.map(planned => {
    if (planned.status === 'completed' || planned.status === 'skipped') return planned;
    const sameDay = completedByDate.get(planned.scheduledFor);
    if (!sameDay || sameDay.length === 0) return planned;
    return { ...planned, status: 'completed' as ScheduledStatus, sessionId: sameDay[0].id };
  });
}

/** Agrupa por fecha. Semana y mes leen de aqui, por eso no pueden contradecirse. */
export function groupByDate(sessions: ScheduledSession[]): Map<string, ScheduledSession[]> {
  const map = new Map<string, ScheduledSession[]>();
  for (const s of sessions) {
    const list = map.get(s.scheduledFor) ?? [];
    list.push(s);
    map.set(s.scheduledFor, list);
  }
  for (const list of map.values()) list.sort((a, b) => a.sortOrder - b.sortOrder);
  return map;
}

export type MoveRejection = 'out-of-window' | 'day-taken' | 'already-done' | 'same-day';

export interface MoveCheck {
  ok: boolean;
  reason?: MoveRejection;
}

export const MOVE_REJECTION_TEXT: Record<MoveRejection, string> = {
  'out-of-window': 'Solo puedes mover una sesion una semana arriba o abajo.',
  'day-taken': 'Ese dia ya tiene una sesion del plan.',
  'already-done': 'Una sesion completada o saltada ya no se mueve.',
  'same-day': 'La sesion ya esta en ese dia.',
};

/**
 * Las tres reglas de 05-arquitectura-ux.md SS 4.2: una semana arriba o abajo,
 * solo a dias libres, y nunca borrar (por eso no hay accion de borrado, solo 'skipped').
 */
export function canMove(
  session: ScheduledSession,
  targetISO: string,
  all: ScheduledSession[]
): MoveCheck {
  if (session.status === 'completed' || session.status === 'skipped') {
    return { ok: false, reason: 'already-done' };
  }
  if (targetISO === session.scheduledFor) return { ok: false, reason: 'same-day' };
  if (Math.abs(diffInDays(targetISO, session.scheduledFor)) > MOVE_WINDOW_DAYS) {
    return { ok: false, reason: 'out-of-window' };
  }
  const taken = all.some(s => s.id !== session.id && s.scheduledFor === targetISO && s.status !== 'skipped');
  if (taken) return { ok: false, reason: 'day-taken' };
  return { ok: true };
}

/** Dias a los que se puede soltar una sesion, para iluminarlos durante el arrastre. */
export function validTargetDates(
  session: ScheduledSession,
  all: ScheduledSession[],
  candidates: Date[]
): Set<string> {
  const valid = new Set<string>();
  for (const date of candidates) {
    const iso = toISODate(date);
    if (canMove(session, iso, all).ok) valid.add(iso);
  }
  return valid;
}
