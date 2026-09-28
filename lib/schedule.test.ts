import { describe, it, expect } from 'vitest';
import {
  canMove, groupByDate, projectWeeklySchedule, reconcileWithHistory,
  startOfWeek, toISODate, validTargetDates, getWeekDates, getMonthGridDates,
} from './schedule';
import { ScheduledSession, WorkoutSession, WorkoutTemplate } from '../types';

const template = (id: string, name: string, focus: string[] = ['Chest']): WorkoutTemplate => ({
  id, name, muscleFocus: focus, exercises: [], duration: '45 Mins', difficulty: 'Intermediate',
});

const planned = (id: string, scheduledFor: string, over: Partial<ScheduledSession> = {}): ScheduledSession => ({
  id, scheduledFor, activityType: 'strength', title: 'Empuje', status: 'planned', sortOrder: 0, ...over,
});

// Lunes fijo: las fechas relativas a "hoy" harian el test dependiente del calendario.
const MONDAY = new Date(2026, 8, 21);

describe('helpers de fecha', () => {
  it('la semana empieza en lunes, tambien en domingo', () => {
    expect(toISODate(startOfWeek(new Date(2026, 8, 27)))).toBe('2026-09-21'); // domingo
    expect(toISODate(startOfWeek(new Date(2026, 8, 21)))).toBe('2026-09-21'); // lunes
  });

  it('la semana tiene 7 dias y el mes rejillas completas', () => {
    expect(getWeekDates(MONDAY)).toHaveLength(7);
    expect(getMonthGridDates(MONDAY).length % 7).toBe(0);
  });

  it('toISODate usa la fecha local, no UTC', () => {
    // 23:30 local: con toISOString esto se iria al dia siguiente en husos negativos
    expect(toISODate(new Date(2026, 8, 21, 23, 30))).toBe('2026-09-21');
  });
});

describe('projectWeeklySchedule', () => {
  const templates = [template('t1', 'Empuje'), template('t2', 'Rodaje suave', ['Cardio'])];

  it('proyecta la plantilla semanal a fechas reales', () => {
    const rows = projectWeeklySchedule([], { 1: 't1', 3: 't2' }, templates, { from: MONDAY, weeks: 2 });

    expect(rows).toHaveLength(4); // 2 dias x 2 semanas
    expect(rows.map(r => r.scheduledFor)).toContain('2026-09-21');
    expect(rows.find(r => r.title === 'Rodaje suave')?.activityType).toBe('run');
  });

  it('es idempotente: volver a proyectar no duplica', () => {
    const once = projectWeeklySchedule([], { 1: 't1' }, templates, { from: MONDAY, weeks: 4 });
    const twice = projectWeeklySchedule(once, { 1: 't1' }, templates, { from: MONDAY, weeks: 4 });
    expect(twice).toHaveLength(once.length);
  });

  it('no pisa lo que el usuario ya movio, salto o completo', () => {
    const moved = planned('wk-2026-09-21', '2026-09-23', { status: 'moved', templateId: 't1' });
    const rows = projectWeeklySchedule([moved], { 1: 't1' }, templates, { from: MONDAY, weeks: 1 });

    expect(rows.find(r => r.id === 'wk-2026-09-21')?.scheduledFor).toBe('2026-09-23');
    expect(rows.find(r => r.id === 'wk-2026-09-21')?.status).toBe('moved');
  });

  it('actualiza un dia aun planificado si cambia la plantilla semanal', () => {
    const before = projectWeeklySchedule([], { 1: 't1' }, templates, { from: MONDAY, weeks: 1 });
    const after = projectWeeklySchedule(before, { 1: 't2' }, templates, { from: MONDAY, weeks: 1 });

    expect(after).toHaveLength(1);
    expect(after[0].title).toBe('Rodaje suave');
  });
});

describe('reconcileWithHistory', () => {
  it('marca completada la sesion del dia en que se entreno', () => {
    const history: WorkoutSession[] = [{
      id: 's1', name: 'Empuje', duration: '45 Mins', muscleFocus: [], exercises: [],
      completed: true, xpReward: 100, date: '2026-09-21T18:00:00.000Z',
    }];
    const [row] = reconcileWithHistory([planned('wk-1', '2026-09-21')], history);

    expect(row.status).toBe('completed');
    expect(row.sessionId).toBe('s1');
  });

  it('no resucita una sesion saltada', () => {
    const history: WorkoutSession[] = [{
      id: 's1', name: 'Empuje', duration: '45 Mins', muscleFocus: [], exercises: [],
      completed: true, xpReward: 100, date: '2026-09-21T18:00:00.000Z',
    }];
    const [row] = reconcileWithHistory([planned('wk-1', '2026-09-21', { status: 'skipped' })], history);
    expect(row.status).toBe('skipped');
  });
});

describe('canMove: las tres reglas de 05-arquitectura-ux.md 4.2', () => {
  const session = planned('wk-1', '2026-09-21');

  it('regla 1: no mas de una semana arriba o abajo', () => {
    expect(canMove(session, '2026-09-28', [session]).ok).toBe(true);
    expect(canMove(session, '2026-09-14', [session]).ok).toBe(true);
    expect(canMove(session, '2026-09-29', [session]).reason).toBe('out-of-window');
    expect(canMove(session, '2026-09-13', [session]).reason).toBe('out-of-window');
  });

  it('regla 2: solo a un dia sin sesion del plan', () => {
    const otro = planned('wk-2', '2026-09-23');
    expect(canMove(session, '2026-09-23', [session, otro]).reason).toBe('day-taken');

    const saltada = planned('wk-3', '2026-09-24', { status: 'skipped' });
    expect(canMove(session, '2026-09-24', [session, saltada]).ok).toBe(true);
  });

  it('regla 3: lo ya hecho o saltado no se mueve (y nada se borra)', () => {
    const hecha = planned('wk-1', '2026-09-21', { status: 'completed' });
    expect(canMove(hecha, '2026-09-22', [hecha]).reason).toBe('already-done');
  });

  it('mover al mismo dia no es un movimiento', () => {
    expect(canMove(session, '2026-09-21', [session]).reason).toBe('same-day');
  });

  it('validTargetDates solo ilumina los dias que pasan las reglas', () => {
    const otro = planned('wk-2', '2026-09-23');
    const valid = validTargetDates(session, [session, otro], getWeekDates(MONDAY));

    expect(valid.has('2026-09-22')).toBe(true);
    expect(valid.has('2026-09-23')).toBe(false); // ocupado
    expect(valid.has('2026-09-21')).toBe(false); // su propio dia
  });
});

describe('groupByDate', () => {
  it('semana y mes leen el mismo agrupado, ordenado por sortOrder', () => {
    const manana = planned('a', '2026-09-21', { sortOrder: 0, title: 'Rodaje' });
    const tarde = planned('b', '2026-09-21', { sortOrder: 1, title: 'Empuje' });
    const grouped = groupByDate([tarde, manana]);

    expect(grouped.get('2026-09-21')!.map(s => s.title)).toEqual(['Rodaje', 'Empuje']);
  });
});
