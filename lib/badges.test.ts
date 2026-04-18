import { describe, it, expect } from 'vitest';
import { ALL_BADGES, BadgeDefinition } from './badges';
import { UserProfile, WorkoutSession } from '../types';
import { PRRecord } from '../services/xp';

const baseUser: UserProfile = {
  name: 'Test User',
  email: 't@t.com',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  streak: 0,
  avatarUrl: '',
  tier: 'Novice',
  goal: 'Strength',
  daysPerWeek: 3,
  minutesPerSession: 60,
  equipment: ['barbell'],
  experienceLevel: 'Beginner',
  onboardingCompleted: true,
};

const makeSession = (completed = true, muscleFocus: string[] = []): WorkoutSession => ({
  id: `s-${Math.random()}`,
  name: 'Test',
  duration: '60 min',
  date: new Date().toISOString(),
  startTime: Date.now() - 3600000,
  endTime: Date.now(),
  exercises: [],
  completed,
  status: completed ? 'completed' : 'active',
  xpReward: 0,
  muscleFocus,
});

const noPRs = new Map<string, PRRecord>();

const badge = (id: string): BadgeDefinition => {
  const b = ALL_BADGES.find(b => b.id === id);
  if (!b) throw new Error(`Badge not found: ${id}`);
  return b;
};

describe('badges — milestone', () => {
  it('first_workout: false with no sessions', () => {
    expect(badge('first_workout').check(baseUser, [], noPRs)).toBe(false);
  });

  it('first_workout: true after 1 completed session', () => {
    expect(badge('first_workout').check(baseUser, [makeSession()], noPRs)).toBe(true);
  });

  it('first_workout: false when session not completed', () => {
    expect(badge('first_workout').check(baseUser, [makeSession(false)], noPRs)).toBe(false);
  });

  it('ten_workouts: false with 9 sessions', () => {
    const nine = Array.from({ length: 9 }, () => makeSession());
    expect(badge('ten_workouts').check(baseUser, nine, noPRs)).toBe(false);
  });

  it('ten_workouts: true with 10 completed sessions', () => {
    const ten = Array.from({ length: 10 }, () => makeSession());
    expect(badge('ten_workouts').check(baseUser, ten, noPRs)).toBe(true);
  });

  it('three_muscles: false with only 2 muscle groups', () => {
    expect(badge('three_muscles').check(baseUser, [makeSession(true, ['chest', 'back'])], noPRs)).toBe(false);
  });

  it('three_muscles: true with 3 muscle groups in one session', () => {
    expect(badge('three_muscles').check(baseUser, [makeSession(true, ['chest', 'back', 'legs'])], noPRs)).toBe(true);
  });

  it('level_5: false at level 4', () => {
    expect(badge('level_5').check({ ...baseUser, level: 4 }, [], noPRs)).toBe(false);
  });

  it('level_5: true at level 5', () => {
    expect(badge('level_5').check({ ...baseUser, level: 5 }, [], noPRs)).toBe(true);
  });

  it('level_15: true at level 15', () => {
    expect(badge('level_15').check({ ...baseUser, level: 15 }, [], noPRs)).toBe(true);
  });

  it('level_30: false at level 29', () => {
    expect(badge('level_30').check({ ...baseUser, level: 29 }, [], noPRs)).toBe(false);
  });
});

describe('badges — streak', () => {
  it('streak_7: false at streak 6', () => {
    expect(badge('streak_7').check({ ...baseUser, streak: 6 }, [], noPRs)).toBe(false);
  });

  it('streak_7: true at streak 7', () => {
    expect(badge('streak_7').check({ ...baseUser, streak: 7 }, [], noPRs)).toBe(true);
  });

  it('streak_30: false at streak 29', () => {
    expect(badge('streak_30').check({ ...baseUser, streak: 29 }, [], noPRs)).toBe(false);
  });

  it('streak_30: true at streak 30', () => {
    expect(badge('streak_30').check({ ...baseUser, streak: 30 }, [], noPRs)).toBe(true);
  });
});

describe('ALL_BADGES integrity', () => {
  it('every badge has id, name, icon, check fn', () => {
    for (const b of ALL_BADGES) {
      expect(b.id, `${b.id} missing id`).toBeTruthy();
      expect(b.name, `${b.id} missing name`).toBeTruthy();
      expect(b.icon, `${b.id} missing icon`).toBeTruthy();
      expect(typeof b.check, `${b.id} check not a fn`).toBe('function');
    }
  });

  it('no duplicate badge ids', () => {
    const ids = ALL_BADGES.map(b => b.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('check fn returns boolean for every badge', () => {
    const sessions = [makeSession(), makeSession(true, ['chest', 'back', 'legs'])];
    const powerUser = { ...baseUser, level: 50, streak: 100 };
    for (const b of ALL_BADGES) {
      const result = b.check(powerUser, sessions, noPRs);
      expect(typeof result).toBe('boolean');
    }
  });
});
