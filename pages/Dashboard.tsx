import React, { useMemo } from 'react';
import { Flame, ChevronRight, TrendingUp, Dumbbell, Clock, Zap, Shield, Trophy, Target, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DateSelector from '../components/DateSelector';
import { Card } from '../components/ui/Card';
import { WorkoutDayCard } from '../components/home/WorkoutDayCard';
import { WelcomeChecklist } from '../components/home/WelcomeChecklist';
import { LevelBadge } from '../components/progress/LevelBadge';
import { XPBar } from '../components/progress/XPBar';
import { WorkoutSession } from '../types';
import { DEFAULT_SET_CONFIG } from '../lib/constants';
import { isSameDay, isPastDay, getTimeAgo } from '../lib/dateUtils';
import { getBadgeDefinition, ALL_BADGES } from '../lib/badges';
import { challengeProgressPct, challengeProgressLabel } from '../lib/challenges';
import { muscleFatigueScore, FatigueLevel, MuscleLoadData } from '../lib/calculations';

interface DashboardProps {
  onStartWorkout: () => void;
  onNavigateProgress?: () => void;
  onNavigateTemplates?: () => void;
  onNavigateSchedule?: () => void;
  onNavigateSettings?: () => void;
}

// Helper to format date as 'YYYY-MM-DD'
const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get tier display name
const getTierName = (level: number): string => {
  if (level >= 50) return 'Elite';
  if (level >= 30) return 'Advanced';
  if (level >= 15) return 'Intermediate';
  if (level >= 5) return 'Regular';
  return 'Novice';
};

/** Convert a template to a preview WorkoutSession (for display, not for starting) */
const templateToPreviewSession = (template: { id: string; name: string; duration: string; muscleFocus: string[]; exercises: { exerciseId: string; restTimer?: number; sets: number; targetReps?: string; targetRPE?: number }[] }): WorkoutSession => ({
  id: `preview-${template.id}`,
  name: template.name,
  duration: template.duration,
  muscleFocus: template.muscleFocus,
  completed: false,
  xpReward: 0,
  exercises: template.exercises.map((ex) => ({
    exerciseId: ex.exerciseId,
    restTimer: ex.restTimer || DEFAULT_SET_CONFIG.restTimer,
    sets: Array.from({ length: ex.sets || 3 }).map((_, idx) => ({
      id: `preview-set-${idx}`,
      type: idx === 0 ? 'warmup' as const : 'top' as const,
      weight: 0,
      reps: 0,
      completed: false,
      targetReps: ex.targetReps || '8-12',
      targetRPE: ex.targetRPE || 8,
    }))
  }))
});

const CHECKLIST_DISMISSED_KEY = 'fitgame_checklist_dismissed';

// Muscle groups to display in the heatmap
const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Glutes', 'Biceps', 'Triceps'];

const Dashboard: React.FC<DashboardProps> = ({ onStartWorkout, onNavigateProgress, onNavigateTemplates, onNavigateSchedule, onNavigateSettings }) => {
  const {
    user, selectedDate, setSelectedDate, startSessionFromTemplate, workoutHistory,
    getScheduledTemplate, weeklySchedule, templates,
    earnedBadges, newlyEarnedBadges, clearNewlyEarnedBadges,
    weeklyChallenge, streakFreezes, useStreakFreeze,
  } = useApp();

  const [checklistDismissed, setChecklistDismissed] = React.useState(() =>
    localStorage.getItem(CHECKLIST_DISMISSED_KEY) === 'true'
  );

  // Clear newly earned badge flash after render
  React.useEffect(() => {
    if (newlyEarnedBadges.length > 0) {
      const t = setTimeout(clearNewlyEarnedBadges, 5000);
      return () => clearTimeout(t);
    }
  }, [newlyEarnedBadges, clearNewlyEarnedBadges]);

  // Build a Set of completed workout date strings from real history
  const completedDateSet = useMemo(() => {
    const set = new Set<string>();
    for (const session of workoutHistory) {
      if (session.completed && session.endTime) {
        set.add(formatDateString(new Date(session.endTime)));
      } else if (session.date) {
        set.add(formatDateString(new Date(session.date)));
      }
    }
    return set;
  }, [workoutHistory]);

  // Generate real workout schedule for the calendar
  const workoutDays = useMemo(() => {
    const today = new Date();
    const days: { date: string; status: 'completed' | 'pending' | 'rest' }[] = [];

    for (let i = -7; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = formatDateString(date);
      const dayOfWeek = date.getDay();
      const hasScheduled = weeklySchedule[dayOfWeek as keyof typeof weeklySchedule];

      if (completedDateSet.has(dateStr)) {
        days.push({ date: dateStr, status: 'completed' });
      } else if (hasScheduled) {
        days.push({ date: dateStr, status: 'pending' });
      } else {
        days.push({ date: dateStr, status: 'rest' });
      }
    }

    return days;
  }, [completedDateSet, weeklySchedule]);

  // Weekly stats from real data
  const weeklyStats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(now.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    let workouts = 0;
    let volume = 0;
    let xp = 0;

    for (const session of workoutHistory) {
      const sessionDate = new Date(session.endTime || session.date || 0);
      if (sessionDate >= startOfWeek && session.completed) {
        workouts++;
        xp += session.xpReward;
        for (const ex of session.exercises) {
          for (const set of ex.sets) {
            if (set.completed) volume += set.weight * set.reps;
          }
        }
      }
    }

    return { workouts, volume, xp };
  }, [workoutHistory]);

  // Find the completed session for the selected date (if past)
  const sessionForDate = useMemo(() => {
    const dateStr = formatDateString(selectedDate);
    return workoutHistory.find(s => {
      if (!s.completed) return false;
      const sDate = s.endTime ? formatDateString(new Date(s.endTime)) : s.date ? formatDateString(new Date(s.date)) : '';
      return sDate === dateStr;
    });
  }, [selectedDate, workoutHistory]);

  // Determine workout and variant based on selected date using schedule
  const { workout, variant, scheduledTemplate } = useMemo(() => {
    const today = new Date();
    const isToday = isSameDay(selectedDate, today);
    const isPast = isPastDay(selectedDate);
    const dayOfWeek = selectedDate.getDay();
    const template = getScheduledTemplate(dayOfWeek);

    if (isToday) {
      if (template) {
        return { workout: templateToPreviewSession(template), variant: 'today' as const, scheduledTemplate: template };
      }
      return { workout: undefined, variant: 'today' as const, scheduledTemplate: null };
    }

    if (isPast) {
      if (sessionForDate) {
        return { workout: sessionForDate, variant: 'past' as const, scheduledTemplate: null };
      }
      return { workout: undefined, variant: 'past' as const, scheduledTemplate: null };
    }

    // Future workout
    if (template) {
      return { workout: templateToPreviewSession(template), variant: 'future' as const, scheduledTemplate: template };
    }
    return { workout: undefined, variant: 'future' as const, scheduledTemplate: null };
  }, [selectedDate, sessionForDate, getScheduledTemplate]);

  // Last completed session
  const lastSession = workoutHistory.length > 0
    ? workoutHistory.reduce((latest, s) =>
        (s.endTime || 0) > (latest.endTime || 0) ? s : latest
      )
    : null;

  const lastSessionVolume = lastSession
    ? lastSession.exercises.reduce((acc, ex) =>
        acc + ex.sets.reduce((sAcc, s) => s.completed ? sAcc + s.weight * s.reps : sAcc, 0), 0)
    : 0;

  const handleStartWorkout = () => {
    if (scheduledTemplate) {
      startSessionFromTemplate(scheduledTemplate);
      onStartWorkout();
    }
  };

  const handleDismissChecklist = () => {
    setChecklistDismissed(true);
    localStorage.setItem(CHECKLIST_DISMISSED_KEY, 'true');
  };

  const hasSchedule = Object.values(weeklySchedule).some(Boolean);

  const checklistItems = useMemo(() => [
    {
      id: 'profile',
      label: 'Configura tu perfil',
      description: 'Nombre, objetivo y preferencias de entrenamiento',
      completed: !!(user?.name && user.name !== 'Usuario'),
      action: 'Ir',
    },
    {
      id: 'template',
      label: 'Crea tu primera rutina',
      description: 'Arma una plantilla con tus ejercicios favoritos',
      completed: templates.length > 0,
      action: 'Crear',
    },
    {
      id: 'schedule',
      label: 'Programa tu semana',
      description: 'Asigna rutinas a los dias de la semana',
      completed: hasSchedule,
      action: 'Programar',
    },
    {
      id: 'workout',
      label: 'Completa tu primer entrenamiento',
      description: 'Inicia una sesion y registra tus series',
      completed: workoutHistory.some(s => s.completed),
      action: 'Empezar',
    },
  ], [user, templates, hasSchedule, workoutHistory]);

  const handleChecklistAction = (itemId: string) => {
    switch (itemId) {
      case 'profile': onNavigateSettings?.(); break;
      case 'template': onNavigateTemplates?.(); break;
      case 'schedule': onNavigateSchedule?.(); break;
      case 'workout': if (scheduledTemplate) handleStartWorkout(); break;
    }
  };

  const levelName = getTierName(user?.level || 1);
  const daysTarget = user?.daysPerWeek || 5;

  const formatVolume = (v: number): string => {
    if (v >= 1000) return (v / 1000).toFixed(1) + 'k';
    return String(v);
  };

  // Streak at risk: hasn't worked out today
  const todayStr = formatDateString(new Date());
  const workedOutToday = completedDateSet.has(todayStr);
  const streakAtRisk = !workedOutToday && (user?.streak || 0) > 0;

  // Recent badges (last 3 earned)
  const recentBadges = useMemo(() =>
    [...earnedBadges]
      .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
      .slice(0, 3),
    [earnedBadges]
  );

  // Newly earned badge flash (first one)
  const flashBadge = newlyEarnedBadges.length > 0
    ? getBadgeDefinition(newlyEarnedBadges[0].badgeId)
    : null;

  // Fatigue score per muscle group (exponential decay, last 7 days)
  const muscleFatigue = useMemo(() => muscleFatigueScore(workoutHistory), [workoutHistory]);

  // Challenge progress
  const challengePct = weeklyChallenge ? challengeProgressPct(weeklyChallenge) : 0;
  const challengeLabel = weeklyChallenge ? challengeProgressLabel(weeklyChallenge) : '';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Newly earned badge flash */}
      {flashBadge && (
        <div className="bg-gradient-to-r from-yellow-600/30 to-yellow-400/10 border border-yellow-500/40 rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-top duration-300">
          <span className="text-4xl">{flashBadge.icon}</span>
          <div>
            <p className="text-yellow-400 text-xs font-bold uppercase tracking-wider">¡Logro desbloqueado!</p>
            <p className="text-white font-bold">{flashBadge.name}</p>
            <p className="text-gray-400 text-xs">{flashBadge.description}</p>
          </div>
        </div>
      )}

      {/* Header: Level + XP + Streak */}
      <div className="bg-background-card border border-gray-800 rounded-3xl p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Left: Level Badge + User Info */}
          <div className="flex items-center gap-4">
            <LevelBadge
              level={user?.level || 1}
              levelName={levelName}
              size="lg"
            />
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-black text-white">
                {user?.name.split(' ')[0]}
              </h1>
              <p className="text-text-muted text-sm">
                {user?.tier} · Day {user?.streak} streak
              </p>
            </div>
          </div>

          {/* Center: XP Bar */}
          <div className="flex-1 max-w-md">
            <XPBar
              currentXP={user?.xp || 0}
              xpToNext={user?.xpToNextLevel || 100}
              level={user?.level || 1}
            />
          </div>

          {/* Right: Streak Badge + Freeze */}
          <div className="flex flex-col gap-2">
            <div className="bg-gradient-to-br from-primary to-red-900 p-4 rounded-2xl shadow-lg shadow-red-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/10 rounded-full blur-xl" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="p-2 bg-black/20 rounded-xl backdrop-blur-sm">
                  <Flame className="w-6 h-6 text-white" fill="currentColor" />
                </div>
                <div>
                  <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider">Streak</p>
                  <p className="text-2xl font-black text-white">{user?.streak}</p>
                </div>
              </div>
            </div>

            {/* Streak Freeze button */}
            {streakAtRisk && streakFreezes.count > 0 && (
              <button
                onClick={() => useStreakFreeze()}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400 text-xs font-bold hover:bg-blue-600/30 transition-colors"
                title="Usa un Freeze para proteger tu racha"
              >
                <Shield className="w-4 h-4" />
                Usar Freeze ({streakFreezes.count})
              </button>
            )}
            {!streakAtRisk && streakFreezes.count > 0 && (
              <p className="text-center text-xs text-gray-600">{streakFreezes.count} freeze{streakFreezes.count !== 1 ? 's' : ''} disponible{streakFreezes.count !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Challenge */}
      {weeklyChallenge && (
        <div className="bg-background-card border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Reto Semanal</h3>
            </div>
            {weeklyChallenge.completed && (
              <span className="flex items-center gap-1 text-green-400 text-xs font-bold">
                <CheckCircle className="w-4 h-4" /> Completado · +{weeklyChallenge.bonusXP} XP
              </span>
            )}
          </div>
          <p className="text-white font-bold mb-1">{weeklyChallenge.title}</p>
          <p className="text-gray-400 text-xs mb-3">{weeklyChallenge.description}</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${weeklyChallenge.completed ? 'bg-green-500' : 'bg-gradient-to-r from-orange-600 to-yellow-400'}`}
                style={{ width: `${challengePct}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">{challengeLabel}</span>
          </div>
        </div>
      )}

      {/* Welcome Checklist for new users */}
      {!checklistDismissed && (
        <WelcomeChecklist
          items={checklistItems}
          onDismiss={handleDismissChecklist}
          onAction={handleChecklistAction}
        />
      )}

      {/* Date Selector */}
      <DateSelector
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        workoutDays={workoutDays}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Workout Card */}
        <div className="lg:col-span-8">
          <WorkoutDayCard
            workout={workout}
            date={selectedDate}
            variant={variant}
            onStartWorkout={handleStartWorkout}
          />
        </div>

        {/* Right: Weekly Stats + Last Session */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Weekly Progress</h3>
              <ChevronRight
                className="w-5 h-5 text-text-muted hover:text-white cursor-pointer transition-colors"
                onClick={onNavigateProgress}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Workouts</p>
                    <p className="text-xs text-text-muted">{weeklyStats.workouts} completed</p>
                  </div>
                </div>
                <span className="text-white font-bold">{weeklyStats.workouts}/{daysTarget}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Volume</p>
                    <p className="text-xs text-text-muted">Total Lifted</p>
                  </div>
                </div>
                <span className="text-white font-bold">{formatVolume(weeklyStats.volume)} kg</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">XP Earned</p>
                    <p className="text-xs text-text-muted">This week</p>
                  </div>
                </div>
                <span className="text-white font-bold">+{weeklyStats.xp.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Last Session Card */}
          {lastSession && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-text-muted" />
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wide">Last Session</h3>
              </div>

              <p className="text-white font-bold text-lg">{lastSession.name}</p>
              <p className="text-text-muted text-xs mt-1">
                {lastSession.endTime ? getTimeAgo(lastSession.endTime) : ''}
              </p>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-700/50">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm text-white font-bold">+{lastSession.xpReward} XP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-sm text-white font-bold">{formatVolume(lastSessionVolume)} kg</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Badges */}
      {earnedBadges.length > 0 && (
        <div className="bg-background-card border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Logros Recientes</h3>
            </div>
            <span className="text-xs text-gray-500">{earnedBadges.length} / {ALL_BADGES.length}</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            {recentBadges.map(eb => {
              const def = getBadgeDefinition(eb.badgeId);
              if (!def) return null;
              return (
                <div
                  key={eb.badgeId}
                  className="flex flex-col items-center gap-1 bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 min-w-[80px]"
                  title={def.description}
                >
                  <span className="text-3xl">{def.icon}</span>
                  <p className="text-white text-xs font-bold text-center leading-tight">{def.name}</p>
                </div>
              );
            })}
            {earnedBadges.length === 0 && (
              <p className="text-gray-500 text-sm">Completa entrenamientos para desbloquear logros</p>
            )}
          </div>
        </div>
      )}

      {/* Fatigue Heatmap */}
      <div className="bg-background-card border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">Fatiga Muscular</h3>
          <span className="text-xs text-gray-500">últimos 7 días</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {MUSCLE_GROUPS.map(muscle => {
            const data: MuscleLoadData | undefined = muscleFatigue[muscle];
            const level: FatigueLevel = data?.level ?? 'fresh';
            const hasData = !!data;
            const styleMap: Record<string, { bg: string; text: string; label: string }> = {
              none:       { bg: 'bg-gray-800/40 border-gray-700/30',     text: 'text-gray-600',   label: '' },
              fresh:      { bg: 'bg-green-900/40 border-green-700/30',   text: 'text-green-400',  label: 'Fresco' },
              moderate:   { bg: 'bg-yellow-900/40 border-yellow-700/30', text: 'text-yellow-400', label: 'Activo' },
              fatigued:   { bg: 'bg-orange-900/40 border-orange-700/30', text: 'text-orange-400', label: 'Cargado' },
              overloaded: { bg: 'bg-red-900/40 border-red-700/30',       text: 'text-red-400',    label: 'Agotado' },
            };
            const style = styleMap[hasData ? level : 'none'];
            return (
              <div
                key={muscle}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2 transition-colors ${style.bg}`}
                title={hasData ? `${muscle}: ${style.label} (${Math.round(data!.score)}%)` : `${muscle}: Sin entrenar`}
              >
                <p className={`text-xs font-bold text-center ${hasData ? 'text-white' : 'text-gray-600'}`}>{muscle}</p>
                {hasData && (
                  <p className={`text-[10px] font-semibold ${style.text}`}>{style.label}</p>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 mt-3 flex-wrap text-xs text-gray-500">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-800/40 border border-gray-700/30" /><span>Sin datos</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-900/40 border border-green-700/30" /><span>Fresco</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-yellow-900/40 border border-yellow-700/30" /><span>Activo</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-900/40 border border-orange-700/30" /><span>Cargado</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-900/40 border border-red-700/30" /><span>Agotado</span></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
