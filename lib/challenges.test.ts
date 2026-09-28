import { describe, it, expect } from 'vitest';
import { hasCompletedSessionInWeek, isNearWeekEnd, getWeekStart } from './challenges';
import { WorkoutSession } from '../types';

const session = (endTime: number): WorkoutSession => ({
  id: 's', name: 'Test', duration: '30 min', muscleFocus: [], exercises: [],
  completed: true, xpReward: 10, status: 'completed', endTime,
});

describe('hasCompletedSessionInWeek', () => {
  it('true si hay una sesion completada dentro de la semana', () => {
    const weekStart = getWeekStart();
    const midWeek = new Date(weekStart);
    midWeek.setDate(midWeek.getDate() + 2);
    expect(hasCompletedSessionInWeek([session(midWeek.getTime())], weekStart)).toBe(true);
  });

  it('false si la sesion cae en la semana anterior', () => {
    const weekStart = getWeekStart();
    const lastWeek = new Date(weekStart);
    lastWeek.setDate(lastWeek.getDate() - 1);
    expect(hasCompletedSessionInWeek([session(lastWeek.getTime())], weekStart)).toBe(false);
  });

  it('false si la sesion no esta completada', () => {
    const weekStart = getWeekStart();
    const midWeek = new Date(weekStart);
    midWeek.setDate(midWeek.getDate() + 2);
    const s = { ...session(midWeek.getTime()), completed: false };
    expect(hasCompletedSessionInWeek([s], weekStart)).toBe(false);
  });

  it('false sin historial', () => {
    expect(hasCompletedSessionInWeek([], getWeekStart())).toBe(false);
  });
});

describe('isNearWeekEnd', () => {
  it('true en sabado', () => {
    // 2026-09-26 es sabado
    expect(isNearWeekEnd(new Date(2026, 8, 26))).toBe(true);
  });

  it('true en domingo', () => {
    expect(isNearWeekEnd(new Date(2026, 8, 27))).toBe(true);
  });

  it('false entre semana', () => {
    expect(isNearWeekEnd(new Date(2026, 8, 23))).toBe(false); // miercoles
  });
});
