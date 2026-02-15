import React, { useState, useMemo } from 'react';
import {
  History as HistoryIcon,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  Zap,
  Dumbbell,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exerciseBlueprints } from '../data/exerciseBlueprints';
import { WorkoutSession } from '../types';
import { cn } from '../lib/utils';
import { formatDuration, formatDateEs } from '../lib/dateUtils';

const exerciseMap = new Map(exerciseBlueprints.map(e => [e.id, e]));

function getExerciseName(exerciseId: string): string {
  return exerciseMap.get(exerciseId)?.name || exerciseId;
}

function calculateSessionVolume(session: WorkoutSession): number {
  return session.exercises.reduce((total, ex) => {
    return total + ex.sets
      .filter(s => s.completed && s.weight > 0)
      .reduce((sum, s) => sum + s.weight * s.reps, 0);
  }, 0);
}

const MUSCLE_COLORS: Record<string, string> = {
  Chest: 'bg-red-500/25 text-red-400 border-red-500/20',
  Back: 'bg-blue-500/25 text-blue-400 border-blue-500/20',
  Quadriceps: 'bg-emerald-500/25 text-emerald-400 border-emerald-500/20',
  Hamstrings: 'bg-teal-500/25 text-teal-400 border-teal-500/20',
  Glutes: 'bg-pink-500/25 text-pink-400 border-pink-500/20',
  Shoulders: 'bg-orange-500/25 text-orange-400 border-orange-500/20',
  Biceps: 'bg-violet-500/25 text-violet-400 border-violet-500/20',
  Triceps: 'bg-indigo-500/25 text-indigo-400 border-indigo-500/20',
  Legs: 'bg-emerald-500/25 text-emerald-400 border-emerald-500/20',
};
const DEFAULT_MUSCLE_COLOR = 'bg-gray-500/25 text-gray-400 border-gray-500/20';

const History: React.FC = () => {
  const { workoutHistory } = useApp();
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Get completed sessions sorted by date desc
  const completedSessions = useMemo(() => {
    return workoutHistory
      .filter(s => s.completed)
      .sort((a, b) => {
        const ta = a.endTime || (a.startTime || 0);
        const tb = b.endTime || (b.startTime || 0);
        return tb - ta;
      });
  }, [workoutHistory]);

  // Extract unique muscle groups
  const allMuscleGroups = useMemo(() => {
    const set = new Set<string>();
    completedSessions.forEach(s => s.muscleFocus?.forEach(m => set.add(m)));
    return Array.from(set).sort();
  }, [completedSessions]);

  // Apply filters
  const filteredSessions = useMemo(() => {
    let result = completedSessions;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q));
    }

    if (muscleFilter) {
      result = result.filter(s => s.muscleFocus?.includes(muscleFilter));
    }

    return result;
  }, [completedSessions, search, muscleFilter]);

  // Stats
  const totalSessions = completedSessions.length;
  const totalVolume = useMemo(
    () => completedSessions.reduce((sum, s) => sum + calculateSessionVolume(s), 0),
    [completedSessions]
  );

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white">Historial de Sesiones</h1>
        </div>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Flame className="w-4 h-4 text-orange-400" />
            <span><span className="font-bold text-white">{totalSessions}</span> sesiones</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Dumbbell className="w-4 h-4 text-primary" />
            <span><span className="font-bold text-white">{(totalVolume / 1000).toFixed(1)}t</span> volumen total</span>
          </div>
        </div>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar sesiones por nombre"
            placeholder="Buscar por nombre..."
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-xl text-sm',
              'bg-background-card border border-gray-800 text-white',
              'placeholder:text-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40',
              'transition-all'
            )}
          />
        </div>

        {/* Muscle filter pills */}
        {allMuscleGroups.length > 0 && (
          <div role="group" aria-label="Filtrar por grupo muscular" className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setMuscleFilter(null)}
              className={cn(
                'shrink-0 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold border transition-all',
                !muscleFilter
                  ? 'bg-primary/15 text-primary border-primary/30'
                  : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:text-white'
              )}
            >
              Todos
            </button>
            {allMuscleGroups.map(muscle => (
              <button
                key={muscle}
                onClick={() => setMuscleFilter(muscleFilter === muscle ? null : muscle)}
                className={cn(
                  'shrink-0 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold border transition-all',
                  muscleFilter === muscle
                    ? 'bg-primary/15 text-primary border-primary/30'
                    : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:text-white'
                )}
              >
                {muscle}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Session list */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-16 h-16 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center">
            <HistoryIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-bold text-gray-400">
            {completedSessions.length === 0
              ? 'Sin sesiones completadas'
              : 'No hay resultados'}
          </p>
          <p className="text-sm text-gray-400">
            {completedSessions.length === 0
              ? 'Completa tu primer entrenamiento para verlo aquí.'
              : 'Intenta con otro filtro o término de búsqueda.'}
          </p>
        </div>
      ) : (
        <div role="list" aria-label="Sesiones de entrenamiento" className="space-y-3">
          {filteredSessions.map(session => {
            const isExpanded = expandedId === session.id;
            const volume = calculateSessionVolume(session);
            const duration = formatDuration(session.startTime, session.endTime);
            const date = formatDateEs(session.date, session.startTime);

            return (
              <div
                key={session.id}
                role="listitem"
                className={cn(
                  'rounded-xl border overflow-hidden transition-all duration-200',
                  isExpanded
                    ? 'bg-background-card border-primary/30'
                    : 'bg-background-card border-gray-800 hover:border-gray-700'
                )}
              >
                {/* Session summary row */}
                <button
                  onClick={() => toggleExpand(session.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`session-detail-${session.id}`}
                  className="w-full text-left px-4 py-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-white truncate">
                        {session.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">{date}</p>

                      {/* Muscle badges */}
                      {session.muscleFocus && session.muscleFocus.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {session.muscleFocus.map(m => (
                            <span
                              key={m}
                              className={cn(
                                'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                                MUSCLE_COLORS[m] || DEFAULT_MUSCLE_COLOR
                              )}
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Quick stats */}
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-400 justify-end">
                          <Clock className="w-3 h-3" />
                          <span>{duration}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 justify-end">
                          <Dumbbell className="w-3 h-3" />
                          <span>{volume.toLocaleString()} kg</span>
                        </div>
                        {session.xpReward > 0 && (
                          <div className="flex items-center gap-1 text-xs text-amber-400 justify-end">
                            <Zap className="w-3 h-3" />
                            <span>+{session.xpReward} XP</span>
                          </div>
                        )}
                      </div>

                      {/* Expand icon */}
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-gray-400" />
                        : <ChevronDown className="w-4 h-4 text-gray-400" />
                      }
                    </div>
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div id={`session-detail-${session.id}`} className="border-t border-gray-800/50 px-4 py-3 space-y-3">
                    {session.exercises.map((ex, exIdx) => {
                      const name = getExerciseName(ex.exerciseId);
                      const completedSets = ex.sets.filter(s => s.completed);

                      return (
                        <div key={exIdx} className="space-y-1.5">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Dumbbell className="w-3.5 h-3.5 text-gray-400" />
                            {name}
                          </h4>
                          {completedSets.length > 0 ? (
                            <div className="ml-5 space-y-1">
                              {completedSets.map((set, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="flex items-center gap-3 text-sm"
                                >
                                  <span className={cn(
                                    'text-[10px] font-bold uppercase px-1.5 py-px rounded border',
                                    set.type === 'warmup'
                                      ? 'text-blue-400 bg-blue-500/25 border-blue-500/20'
                                      : 'text-primary bg-primary/15 border-primary/20'
                                  )}>
                                    {set.type === 'warmup' ? 'W' : 'T'}
                                  </span>
                                  <span className="text-white font-semibold">
                                    {set.weight}kg <span className="text-gray-400 font-normal">x</span> {set.reps}
                                  </span>
                                  {set.rpe !== undefined && set.rpe > 0 && (
                                    <span className={cn(
                                      'text-xs font-bold',
                                      set.rpe >= 9 ? 'text-red-400' : set.rpe >= 7 ? 'text-yellow-400' : 'text-green-400'
                                    )}>
                                      RPE {set.rpe}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="ml-5 text-xs text-gray-400">Sin sets completados</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
