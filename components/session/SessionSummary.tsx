import { useState, useEffect } from 'react';
import { PartyPopper, Zap, Trophy, ArrowRight } from 'lucide-react';
import { WorkoutSession, UserProfile } from '../../types';
import { XPBreakdown as XPBreakdownType } from '../../services/xp';
import { exercises as allExercises } from '../../data/mockData';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { SessionStats } from './SessionStats';
import { XPBreakdown } from './XPBreakdown';
import { PRBadge } from './PRBadge';

interface SessionSummaryProps {
  session: WorkoutSession;
  xpBreakdown: XPBreakdownType;
  user: UserProfile;
  previousRecords?: Map<string, { weight: number; reps: number }>;
  onClose: () => void;
}

export function SessionSummary({
  session,
  xpBreakdown,
  user,
  previousRecords,
  onClose,
}: SessionSummaryProps) {
  const [visibleSections, setVisibleSections] = useState(0);

  // Staggered entrance: reveal sections one by one
  useEffect(() => {
    const timers = [0, 300, 600, 900, 1200].map((delay, i) =>
      setTimeout(() => setVisibleSections(i + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // --- Compute stats ---
  const durationSec = session.endTime && session.startTime
    ? Math.floor((session.endTime - session.startTime) / 1000)
    : 0;

  let totalVolume = 0;
  let setsCompleted = 0;
  let rpeSum = 0;
  let rpeCount = 0;

  session.exercises.forEach(ex => {
    ex.sets.forEach(set => {
      if (set.completed) {
        totalVolume += set.weight * set.reps;
        setsCompleted++;
        if (set.rpe) {
          rpeSum += set.rpe;
          rpeCount++;
        }
      }
    });
  });

  const averageRPE = rpeCount > 0 ? rpeSum / rpeCount : 0;

  // --- Compute PRs ---
  const prs = xpBreakdown.prsAchieved.map(exerciseId => {
    const info = allExercises.find(e => e.id === exerciseId);
    const activeEx = session.exercises.find(e => e.exerciseId === exerciseId);
    const bestSet = activeEx?.sets
      .filter(s => s.completed && s.weight > 0)
      .reduce((max, s) => (s.weight > max.weight ? s : max), { weight: 0, reps: 0 });

    const prev = previousRecords?.get(exerciseId);
    let improvement: string | undefined;
    if (prev && bestSet && bestSet.weight > 0) {
      const weightDiff = bestSet.weight - prev.weight;
      if (weightDiff > 0) {
        improvement = `+${weightDiff}kg`;
      } else if (bestSet.reps > prev.reps) {
        improvement = `+${bestSet.reps - prev.reps} reps`;
      }
    }

    return {
      exercise: info?.name || 'Ejercicio',
      weight: bestSet?.weight || 0,
      reps: bestSet?.reps || 0,
      improvement,
    };
  }).filter(pr => pr.weight > 0);

  // --- XP breakdown mapped to component props ---
  const breakdownData = {
    baseSets: xpBreakdown.setsXP,
    bonusRPE: xpBreakdown.rpeBonus,
    bonusPR: xpBreakdown.prBonus,
    bonusCompletion: xpBreakdown.completionBonus,
    bonusStreak: xpBreakdown.streakMultiplier > 1
      ? Math.round(xpBreakdown.baseXP * (xpBreakdown.streakMultiplier - 1))
      : 0,
    bonusMorning: xpBreakdown.morningBonus > 0
      ? Math.round(xpBreakdown.baseXP * xpBreakdown.streakMultiplier * xpBreakdown.morningBonus)
      : 0,
    total: xpBreakdown.totalXP,
  };

  // --- Level progress ---
  const newXP = user.xp;
  const xpToNext = user.xpToNextLevel;
  const xpNeeded = xpToNext - newXP;
  const progressPct = Math.min((newXP / xpToNext) * 100, 100);

  const sectionClass = (index: number) => cn(
    'transition-all duration-500',
    visibleSections > index
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-6'
  );

  return (
    <div className="min-h-[100dvh] bg-background relative overflow-hidden">
      {/* Confetti particles */}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes prEnter {
          0% { opacity: 0; transform: scale(0.85); }
          60% { opacity: 1; transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[
          { color: 'bg-red-500', left: '12%', delay: '0s', duration: '3s', size: 'w-2 h-2' },
          { color: 'bg-amber-400', left: '28%', delay: '0.4s', duration: '3.5s', size: 'w-2.5 h-2.5' },
          { color: 'bg-blue-500', left: '45%', delay: '0.8s', duration: '2.8s', size: 'w-2 h-2' },
          { color: 'bg-green-400', left: '62%', delay: '1.2s', duration: '4s', size: 'w-1.5 h-1.5' },
          { color: 'bg-primary', left: '78%', delay: '0.2s', duration: '3.2s', size: 'w-2 h-2' },
          { color: 'bg-purple-400', left: '88%', delay: '1.5s', duration: '3.8s', size: 'w-2 h-2' },
        ].map((p, i) => (
          <div
            key={i}
            className={cn('absolute top-0 rounded-full', p.color, p.size)}
            style={{
              left: p.left,
              animationDelay: p.delay,
              animation: `confettiFall ${p.duration} ease-in infinite`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 space-y-5">
        {/* Section 1: Header */}
        <div className={sectionClass(0)}>
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 mb-4">
              <PartyPopper className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              ¡SESIÓN COMPLETADA!
            </h1>
            <p className="text-lg text-gray-400 font-medium mt-1">
              {session.name}
            </p>
          </div>
        </div>

        {/* Section 2: Stats */}
        <div className={sectionClass(1)}>
          <SessionStats
            duration={durationSec}
            totalVolume={totalVolume}
            setsCompleted={setsCompleted}
            averageRPE={averageRPE}
          />
        </div>

        {/* Section 3: PRs (only if any) */}
        {prs.length > 0 && (
          <div className={sectionClass(2)}>
            <div className="rounded-2xl border border-gray-800/50 bg-background-card/50 overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-gray-800/30">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Récords personales
                  </h3>
                </div>
              </div>
              <div className="p-3 space-y-2">
                {prs.map((pr, i) => (
                  <PRBadge
                    key={i}
                    exercise={pr.exercise}
                    weight={pr.weight}
                    reps={pr.reps}
                    improvement={pr.improvement}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 4: XP Breakdown + Level Progress */}
        <div className={sectionClass(3)}>
          <XPBreakdown breakdown={breakdownData} />

          {/* Level progress bar */}
          <div className="mt-3 rounded-xl border border-gray-800/50 bg-background-card/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-400">
                Nivel {user.level}
              </span>
              <span className="text-xs font-semibold text-gray-500">
                {newXP.toLocaleString()} / {xpToNext.toLocaleString()} XP
              </span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-1000 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {xpNeeded > 0 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                ¡<span className="text-amber-400 font-bold">{xpNeeded.toLocaleString()} XP</span> para nivel {user.level + 1}!
              </p>
            )}
          </div>
        </div>

        {/* Section 5: CTA */}
        <div className={sectionClass(4)}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onClose}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Finalizar
          </Button>
        </div>
      </div>
    </div>
  );
}
