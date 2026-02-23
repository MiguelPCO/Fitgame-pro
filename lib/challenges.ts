import { WorkoutSession, WeeklyChallenge, ChallengeType } from '../types';

type ChallengeTemplate = Omit<WeeklyChallenge, 'id' | 'progress' | 'completed' | 'weekStart'>;

const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    type: 'workouts' as ChallengeType,
    title: '4 entrenamientos esta semana',
    description: 'Completa 4 sesiones de entrenamiento',
    target: 4,
    bonusXP: 150,
  },
  {
    type: 'pr' as ChallengeType,
    title: 'Consigue 1 record personal',
    description: 'Establece al menos un PR esta semana',
    target: 1,
    bonusXP: 150,
  },
  {
    type: 'volume' as ChallengeType,
    title: 'Levanta 5,000 kg esta semana',
    description: 'Acumula 5,000 kg de volumen total',
    target: 5000,
    bonusXP: 150,
  },
  {
    type: 'sets' as ChallengeType,
    title: 'Completa 50 series esta semana',
    description: 'Completa un total de 50 series',
    target: 50,
    bonusXP: 120,
  },
  {
    type: 'workouts' as ChallengeType,
    title: '3 entrenamientos esta semana',
    description: 'Completa 3 sesiones de entrenamiento',
    target: 3,
    bonusXP: 100,
  },
  {
    type: 'volume' as ChallengeType,
    title: 'Levanta 10,000 kg esta semana',
    description: 'Acumula 10,000 kg de volumen total',
    target: 10000,
    bonusXP: 200,
  },
];

/** Returns the ISO date string of Monday 00:00:00 of the given date's week */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Deterministically selects a challenge template for the given week
 * by rotating through the list based on the week index.
 */
export function generateWeeklyChallenge(weekStart: string): WeeklyChallenge {
  const weekMs = new Date(weekStart).getTime();
  const weekIndex = Math.floor(weekMs / (7 * 24 * 60 * 60 * 1000));
  const template = CHALLENGE_TEMPLATES[Math.abs(weekIndex) % CHALLENGE_TEMPLATES.length];
  return {
    id: `challenge-${weekStart}`,
    ...template,
    progress: 0,
    completed: false,
    weekStart,
  };
}

/**
 * Recompute challenge progress from history sessions that fall within
 * the challenge's week. `prsThisWeek` is the count of PRs achieved.
 */
export function evaluateChallengeProgress(
  challenge: WeeklyChallenge,
  history: WorkoutSession[],
  prsThisWeek = 0
): WeeklyChallenge {
  const weekStart = new Date(challenge.weekStart);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const weekSessions = history.filter(s => {
    if (!s.completed) return false;
    const d = new Date(s.endTime || s.date || 0);
    return d >= weekStart && d < weekEnd;
  });

  let progress = 0;
  switch (challenge.type) {
    case 'workouts':
      progress = weekSessions.length;
      break;
    case 'pr':
      progress = prsThisWeek;
      break;
    case 'volume':
      progress = weekSessions.reduce(
        (acc, s) =>
          acc +
          s.exercises.reduce(
            (eAcc, ex) =>
              eAcc +
              ex.sets.reduce(
                (sAcc, set) => (set.completed ? sAcc + set.weight * set.reps : sAcc),
                0
              ),
            0
          ),
        0
      );
      break;
    case 'sets':
      progress = weekSessions.reduce(
        (acc, s) =>
          acc +
          s.exercises.reduce(
            (eAcc, ex) => eAcc + ex.sets.filter(set => set.completed).length,
            0
          ),
        0
      );
      break;
  }

  return {
    ...challenge,
    progress,
    completed: progress >= challenge.target,
  };
}

/** Format progress as a percentage string (capped at 100%) */
export function challengeProgressPct(challenge: WeeklyChallenge): number {
  return Math.min(100, Math.round((challenge.progress / challenge.target) * 100));
}

/** Human-readable progress label (e.g. "3 / 4" or "4,200 / 5,000 kg") */
export function challengeProgressLabel(challenge: WeeklyChallenge): string {
  const fmt = (n: number) =>
    challenge.type === 'volume' ? `${n.toLocaleString('es-ES')} kg` : String(n);
  return `${fmt(challenge.progress)} / ${fmt(challenge.target)}`;
}
