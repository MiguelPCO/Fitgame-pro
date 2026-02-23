import { UserProfile, WorkoutSession, BadgeCategory, EarnedBadge } from '../types';
import { PRRecord } from '../services/xp';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  check: (
    user: UserProfile,
    history: WorkoutSession[],
    personalRecords: Map<string, PRRecord>
  ) => boolean;
}

export const ALL_BADGES: BadgeDefinition[] = [
  // ── Milestone badges ──────────────────────────────────────────────
  {
    id: 'first_workout',
    name: 'Primer Paso',
    description: 'Completa tu primer entrenamiento',
    icon: '🏋️',
    category: 'milestone',
    check: (_, history) => history.some(s => s.completed),
  },
  {
    id: 'ten_workouts',
    name: 'Veterano',
    description: 'Completa 10 entrenamientos',
    icon: '💪',
    category: 'milestone',
    check: (_, history) => history.filter(s => s.completed).length >= 10,
  },
  {
    id: 'fifty_workouts',
    name: 'Dedicado',
    description: 'Completa 50 entrenamientos',
    icon: '🔥',
    category: 'milestone',
    check: (_, history) => history.filter(s => s.completed).length >= 50,
  },
  {
    id: 'hundred_workouts',
    name: 'Centurión',
    description: 'Completa 100 entrenamientos',
    icon: '👑',
    category: 'milestone',
    check: (_, history) => history.filter(s => s.completed).length >= 100,
  },
  {
    id: 'three_muscles',
    name: 'Full Body',
    description: 'Entrena 3 grupos musculares distintos en un workout',
    icon: '💡',
    category: 'milestone',
    check: (_, history) =>
      history.some(s => s.completed && Array.isArray(s.muscleFocus) && s.muscleFocus.length >= 3),
  },
  {
    id: 'level_5',
    name: 'Regular',
    description: 'Alcanza el nivel 5',
    icon: '⭐',
    category: 'milestone',
    check: (user) => (user.level || 0) >= 5,
  },
  {
    id: 'level_15',
    name: 'Intermedio',
    description: 'Alcanza el nivel 15',
    icon: '🌟',
    category: 'milestone',
    check: (user) => (user.level || 0) >= 15,
  },
  {
    id: 'level_30',
    name: 'Avanzado',
    description: 'Alcanza el nivel 30',
    icon: '💎',
    category: 'milestone',
    check: (user) => (user.level || 0) >= 30,
  },

  // ── Streak badges ─────────────────────────────────────────────────
  {
    id: 'streak_7',
    name: 'Semana de Fuego',
    description: 'Mantén una racha de 7 días',
    icon: '🗓️',
    category: 'streak',
    check: (user) => (user.streak || 0) >= 7,
  },
  {
    id: 'streak_30',
    name: 'Mes Imparable',
    description: 'Mantén una racha de 30 días',
    icon: '📅',
    category: 'streak',
    check: (user) => (user.streak || 0) >= 30,
  },
  {
    id: 'streak_100',
    name: 'Leyenda',
    description: 'Mantén una racha de 100 días',
    icon: '🏆',
    category: 'streak',
    check: (user) => (user.streak || 0) >= 100,
  },

  // ── Strength / PR badges ──────────────────────────────────────────
  {
    id: 'first_pr',
    name: 'Primer Record',
    description: 'Establece tu primer record personal',
    icon: '🥇',
    category: 'strength',
    check: (_, __, prs) => prs.size > 0,
  },
  {
    id: 'five_prs',
    name: 'Máquina',
    description: 'Establece 5 records personales',
    icon: '⚡',
    category: 'strength',
    check: (_, __, prs) => prs.size >= 5,
  },
  {
    id: 'ten_prs',
    name: 'Bestia',
    description: 'Establece 10 records personales',
    icon: '🦁',
    category: 'strength',
    check: (_, __, prs) => prs.size >= 10,
  },

  // ── Volume badges ─────────────────────────────────────────────────
  {
    id: 'volume_10k',
    name: 'Tonelada',
    description: 'Levanta 10,000 kg en total (lifetime)',
    icon: '🏗️',
    category: 'volume',
    check: (_, history) => {
      const total = history.reduce((sum, s) =>
        sum + s.exercises.reduce((eSum, ex) =>
          eSum + ex.sets.reduce((sSum, set) =>
            set.completed ? sSum + set.weight * set.reps : sSum, 0), 0), 0);
      return total >= 10000;
    },
  },
  {
    id: 'volume_100k',
    name: 'Coloso',
    description: 'Levanta 100,000 kg en total (lifetime)',
    icon: '🗿',
    category: 'volume',
    check: (_, history) => {
      const total = history.reduce((sum, s) =>
        sum + s.exercises.reduce((eSum, ex) =>
          eSum + ex.sets.reduce((sSum, set) =>
            set.completed ? sSum + set.weight * set.reps : sSum, 0), 0), 0);
      return total >= 100000;
    },
  },

  // ── Consistency badges ────────────────────────────────────────────
  {
    id: 'five_days_week',
    name: 'Semana Perfecta',
    description: 'Completa 5 entrenamientos en una semana',
    icon: '🎯',
    category: 'consistency',
    check: (_, history) => {
      const weekCounts: Record<string, number> = {};
      for (const s of history) {
        if (!s.completed) continue;
        const d = new Date(s.endTime || s.date || 0);
        const weekStart = new Date(d);
        const diff = weekStart.getDay() === 0 ? -6 : 1 - weekStart.getDay();
        weekStart.setDate(d.getDate() + diff);
        weekStart.setHours(0, 0, 0, 0);
        const key = weekStart.toISOString();
        weekCounts[key] = (weekCounts[key] || 0) + 1;
      }
      return Object.values(weekCounts).some(c => c >= 5);
    },
  },
  {
    id: 'early_bird',
    name: 'Madrugador',
    description: 'Completa un entrenamiento antes de las 8 AM',
    icon: '🌅',
    category: 'consistency',
    check: (_, history) =>
      history.some(s => {
        if (!s.completed || !s.startTime) return false;
        return new Date(s.startTime).getHours() < 8;
      }),
  },
  {
    id: 'night_owl',
    name: 'Noctámbulo',
    description: 'Completa un entrenamiento después de las 10 PM',
    icon: '🦉',
    category: 'consistency',
    check: (_, history) =>
      history.some(s => {
        if (!s.completed || !s.startTime) return false;
        return new Date(s.startTime).getHours() >= 22;
      }),
  },
];

/**
 * Check all badges against current state and return only newly earned ones
 * (badges not already in `alreadyEarned`).
 */
export function checkForNewBadges(
  user: UserProfile,
  history: WorkoutSession[],
  personalRecords: Map<string, PRRecord>,
  alreadyEarned: EarnedBadge[]
): EarnedBadge[] {
  const earnedIds = new Set(alreadyEarned.map(b => b.badgeId));
  const now = new Date().toISOString();
  const newBadges: EarnedBadge[] = [];

  for (const badge of ALL_BADGES) {
    if (!earnedIds.has(badge.id) && badge.check(user, history, personalRecords)) {
      newBadges.push({ badgeId: badge.id, earnedAt: now });
    }
  }

  return newBadges;
}

/** Look up a badge definition by id */
export function getBadgeDefinition(badgeId: string): BadgeDefinition | undefined {
  return ALL_BADGES.find(b => b.id === badgeId);
}
