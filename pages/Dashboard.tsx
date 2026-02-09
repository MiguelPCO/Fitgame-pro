import React, { useMemo } from 'react';
import { Flame, ChevronRight, TrendingUp, Dumbbell, Clock, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import DateSelector from '../components/DateSelector';
import { Card } from '../components/ui/Card';
import { WorkoutDayCard } from '../components/home/WorkoutDayCard';
import { LevelBadge } from '../components/progress/LevelBadge';
import { XPBar } from '../components/progress/XPBar';
import { WorkoutSession } from '../types';
import { DEFAULT_SET_CONFIG } from '../lib/constants';
import { isSameDay, isPastDay, getTimeAgo } from '../lib/dateUtils';

interface DashboardProps {
  onStartWorkout: () => void;
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
const templateToPreviewSession = (template: { id: string; name: string; duration: string; muscleFocus: string[]; exercises: any[] }): WorkoutSession => ({
  id: `preview-${template.id}`,
  name: template.name,
  duration: template.duration,
  muscleFocus: template.muscleFocus,
  completed: false,
  xpReward: 0,
  exercises: template.exercises.map((ex: any) => ({
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

const Dashboard: React.FC<DashboardProps> = ({ onStartWorkout }) => {
  const { user, selectedDate, setSelectedDate, startSessionFromTemplate, workoutHistory, getScheduledTemplate, weeklySchedule } = useApp();

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

  const levelName = getTierName(user?.level || 1);
  const daysTarget = user?.daysPerWeek || 5;

  const formatVolume = (v: number): string => {
    if (v >= 1000) return (v / 1000).toFixed(1) + 'k';
    return String(v);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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

          {/* Right: Streak Badge */}
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
        </div>
      </div>

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
              <ChevronRight className="w-5 h-5 text-text-muted hover:text-white cursor-pointer transition-colors" />
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
    </div>
  );
};

export default Dashboard;
