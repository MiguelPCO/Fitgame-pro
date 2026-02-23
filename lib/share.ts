import { WorkoutSession, UserProfile } from '../types';
import { EarnedBadge } from '../types';
import { getBadgeDefinition } from './badges';
import { WeeklySummaryData } from './weeklySummary';

const APP_URL = 'https://fitgame-pro.vercel.app';
const APP_NAME = 'FitGame Pro';

async function nativeShare(title: string, text: string): Promise<void> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url: APP_URL });
    } catch {
      // User cancelled or share failed — silent
    }
  } else {
    await navigator.clipboard.writeText(`${text}\n\n${APP_URL}`);
  }
}

/** Share a newly unlocked badge */
export async function shareBadge(badge: EarnedBadge): Promise<void> {
  const def = getBadgeDefinition(badge.badgeId);
  if (!def) return;
  const text =
    `🏆 ¡Nuevo logro desbloqueado en ${APP_NAME}!\n\n` +
    `${def.icon} ${def.name}\n` +
    `${def.description}\n\n` +
    `¡Únete y supera tus límites! 💪`;
  await nativeShare(`${def.icon} ${def.name} — ${APP_NAME}`, text);
}

/** Share a completed workout session */
export async function shareWorkout(
  session: WorkoutSession,
  user: UserProfile
): Promise<void> {
  const durationSec =
    session.endTime && session.startTime
      ? Math.floor((session.endTime - session.startTime) / 1000)
      : 0;
  const durationMin = Math.floor(durationSec / 60);

  let totalSets = 0;
  let totalVolume = 0;
  session.exercises.forEach(ex => {
    ex.sets.forEach(s => {
      if (s.completed) {
        totalSets++;
        totalVolume += s.weight * s.reps;
      }
    });
  });

  const volumeStr =
    totalVolume >= 1000
      ? `${(totalVolume / 1000).toFixed(1)}k`
      : String(Math.round(totalVolume));

  const text =
    `💪 ¡Acabo de terminar "${session.name}" en ${APP_NAME}!\n\n` +
    `⏱ ${durationMin} min  •  🏋 ${totalSets} series  •  📊 ${volumeStr} kg\n` +
    `⚡ +${session.xpReward} XP  •  🔥 ${user.streak} días de racha\n\n` +
    `Nivel ${user.level} ${user.tier} — ¡Sigue empujando!`;
  await nativeShare(`Workout completado — ${APP_NAME}`, text);
}

/** Share the weekly summary */
export async function shareWeeklySummary(
  data: WeeklySummaryData,
  user: UserProfile
): Promise<void> {
  const { lastWeek } = data;
  const volumeStr =
    lastWeek.volumeKg >= 1000
      ? `${(lastWeek.volumeKg / 1000).toFixed(1)}k`
      : String(lastWeek.volumeKg);

  const text =
    `📊 Mi semana en ${APP_NAME}:\n\n` +
    `🏋 ${lastWeek.workouts} entrenamientos\n` +
    `📈 ${volumeStr} kg de volumen total\n` +
    `⚡ ${lastWeek.xpEarned.toLocaleString('es-ES')} XP ganados\n\n` +
    `Nivel ${user.level} ${user.tier} • Racha 🔥 ${user.streak} días\n` +
    `¡Únete a FitGame Pro!`;
  await nativeShare(`Mi semana fitness — ${APP_NAME}`, text);
}
