import React, { useMemo, useState } from 'react';
import { Activity, Trophy, Calendar, Flame, Award, Target, Zap, TrendingUp, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WorkoutSession } from '../types';
import { exerciseBlueprints as exerciseDB } from '../data/exerciseBlueprints';

// Helper to format date as 'YYYY-MM-DD'
const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Lightweight SVG Chart Components ---

interface BarChartData {
  label: string;
  value: number;
}

const MiniBarChart: React.FC<{ data: BarChartData[] }> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barCount = data.length;
  const gap = 4;
  const barWidth = Math.max(8, (100 - gap * (barCount - 1)) / barCount);

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox={`0 0 ${barCount * (barWidth + gap) - gap} 100`}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {data.map((d, i) => {
          const h = (d.value / maxVal) * 90;
          const x = i * (barWidth + gap);
          return (
            <rect
              key={i}
              x={x}
              y={100 - h}
              width={barWidth}
              height={h}
              rx={3}
              fill={hoveredIdx === i ? '#EF4444' : '#DC2626'}
              opacity={hoveredIdx !== null && hoveredIdx !== i ? 0.5 : 1}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="transition-opacity"
            />
          );
        })}
      </svg>
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-600 rounded-lg px-2 py-1 text-xs text-white pointer-events-none z-10">
          <span className="font-bold">{data[hoveredIdx].label}</span>: {data[hoveredIdx].value.toLocaleString()} kg
        </div>
      )}
    </div>
  );
};

interface AreaChartData {
  label: string;
  value: number;
}

const VolumeAreaChart: React.FC<{ data: AreaChartData[] }> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const padding = { top: 20, right: 10, bottom: 30, left: 50 };
  const w = 500;
  const h = 200;
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const points = data.map((d, i) => ({
    x: padding.left + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2),
    y: padding.top + chartH - (d.value / maxVal) * chartH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${padding.top + chartH} L${points[0].x},${padding.top + chartH} Z`;

  // Y-axis ticks (4 steps)
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((maxVal / 4) * i));

  // Horizontal grid lines
  const gridLines = yTicks.map(v => padding.top + chartH - (v / maxVal) * chartH);

  return (
    <div className="relative w-full h-full">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DC2626" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#DC2626" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map((y, i) => (
          <line key={i} x1={padding.left} y1={y} x2={w - padding.right} y2={y} stroke="#374151" strokeDasharray="3 3" />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((v, i) => (
          <text key={i} x={padding.left - 8} y={gridLines[i] + 4} fill="#9CA3AF" fontSize={10} textAnchor="end">
            {v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          </text>
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={points[i].x}
            y={h - 5}
            fill="#9CA3AF"
            fontSize={10}
            textAnchor="middle"
          >
            {d.label}
          </text>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#DC2626" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hoveredIdx === i ? 6 : 4}
            fill={hoveredIdx === i ? '#EF4444' : '#DC2626'}
            stroke="#1F2937"
            strokeWidth={2}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            className="cursor-pointer"
          />
        ))}
      </svg>
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div
          className="absolute bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-xs text-white pointer-events-none z-10"
          style={{
            left: `${(points[hoveredIdx].x / w) * 100}%`,
            top: `${(points[hoveredIdx].y / h) * 100 - 15}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-bold">{data[hoveredIdx].label}</div>
          <div>Volume: {data[hoveredIdx].value.toLocaleString()} kg</div>
        </div>
      )}
    </div>
  );
};

// --- Main Progress Page ---

const Progress: React.FC = () => {
  const { workoutHistory, user, personalRecords } = useApp();

  // Helper to calculate total volume for a session
  const calculateSessionVolume = (session: WorkoutSession) => {
    return session.exercises.reduce((acc, ex) => {
      return acc + ex.sets.reduce((sAcc, s) => s.completed ? sAcc + (s.weight * s.reps) : sAcc, 0);
    }, 0);
  };

  // Transform history for charts
  const volumeData = useMemo(() => {
    if (workoutHistory.length === 0) return [];
    return workoutHistory.map(session => ({
      label: new Date(session.endTime || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: calculateSessionVolume(session),
      name: session.name,
    })).slice(-7);
  }, [workoutHistory]);

  const totalLifetimeVolume = workoutHistory.reduce((acc, s) => acc + calculateSessionVolume(s), 0);
  const totalWorkouts = workoutHistory.length;

  // Build Set of dates with completed workouts for heatmap
  const completedDates = useMemo(() => {
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

  // Build 60-day grid from today backwards
  const heatmapDays = useMemo(() => {
    const days: { date: string; hasWorkout: boolean }[] = [];
    const today = new Date();
    for (let i = 59; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = formatDateString(d);
      days.push({ date: dateStr, hasWorkout: completedDates.has(dateStr) });
    }
    return days;
  }, [completedDates]);

  // PR list from personalRecords Map
  const prList = useMemo(() => {
    const list: { exerciseId: string; name: string; weight: number; reps: number; date: string }[] = [];
    personalRecords.forEach((record, exerciseId) => {
      const ex = exerciseDB.find(e => e.id === exerciseId);
      list.push({
        exerciseId,
        name: ex?.name || exerciseId,
        weight: record.weight,
        reps: record.reps,
        date: record.date,
      });
    });
    // Sort by most recent
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [personalRecords]);

  // PR history by exercise — top weight per session over time
  const [selectedPRExercise, setSelectedPRExercise] = useState<string>('');

  const exercisesWithHistory = useMemo(() => {
    const ids = new Set<string>();
    for (const session of workoutHistory) {
      for (const ex of session.exercises) {
        const hasCompletedSet = ex.sets.some(s => s.completed && s.weight > 0);
        if (hasCompletedSet) ids.add(ex.exerciseId);
      }
    }
    return Array.from(ids).map(id => ({
      id,
      name: exerciseDB.find(e => e.id === id)?.name || id,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [workoutHistory]);

  // Auto-select first exercise
  const activePRExercise = selectedPRExercise || exercisesWithHistory[0]?.id || '';

  const prHistoryData = useMemo(() => {
    if (!activePRExercise) return [];
    const points: { label: string; value: number }[] = [];
    const sorted = [...workoutHistory].sort((a, b) =>
      (a.endTime || 0) - (b.endTime || 0)
    );
    for (const session of sorted) {
      const ex = session.exercises.find(e => e.exerciseId === activePRExercise);
      if (!ex) continue;
      const best = ex.sets
        .filter(s => s.completed && s.weight > 0)
        .reduce((max, s) => s.weight > max ? s.weight : max, 0);
      if (best > 0) {
        points.push({
          label: new Date(session.endTime || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: best,
        });
      }
    }
    return points;
  }, [workoutHistory, activePRExercise]);

  // Volume by muscle group
  const muscleVolumeData = useMemo(() => {
    const volumeMap: Record<string, number> = {};
    for (const session of workoutHistory) {
      for (const ex of session.exercises) {
        const blueprint = exerciseDB.find(e => e.id === ex.exerciseId);
        if (!blueprint) continue;
        const exVolume = ex.sets.reduce((acc, s) => s.completed ? acc + s.weight * s.reps : acc, 0);
        for (const muscle of blueprint.muscleGroup) {
          volumeMap[muscle] = (volumeMap[muscle] || 0) + exVolume;
        }
      }
    }
    return Object.entries(volumeMap)
      .map(([muscle, volume]) => ({ muscle, volume }))
      .sort((a, b) => b.volume - a.volume);
  }, [workoutHistory]);

  // XP per session over time
  const xpPerSession = useMemo(() => {
    if (workoutHistory.length === 0) return [];
    return workoutHistory
      .filter(s => s.completed)
      .map(s => ({
        label: new Date(s.endTime || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: s.xpReward || 0,
      }))
      .slice(-10);
  }, [workoutHistory]);

  // Weekly frequency (last 8 weeks)
  const weeklyFrequency = useMemo(() => {
    const weeks: { label: string; count: number }[] = [];
    const now = new Date();
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (w * 7 + now.getDay()));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      const count = workoutHistory.filter(s => {
        const d = new Date(s.endTime || s.date || 0);
        return d >= weekStart && d < weekEnd;
      }).length;
      weeks.push({
        label: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      });
    }
    return weeks;
  }, [workoutHistory]);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-end border-b border-gray-800 pb-6">
        <div>
           <h1 className="text-3xl font-black text-white">Tu Progreso</h1>
           <p className="text-text-muted mt-1">Estadisticas basadas en tus {totalWorkouts} sesiones completadas.</p>
        </div>
      </div>

      {/* Streak Card + KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Streak Card */}
        <div className="bg-gradient-to-br from-orange-600 to-red-700 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-black/20 rounded-xl backdrop-blur-sm">
                <Flame className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <p className="text-white/80 text-xs font-bold uppercase tracking-wider">Streak</p>
            </div>
            <h3 className="text-4xl font-black text-white">{user?.streak || 0}</h3>
            <p className="text-white/70 text-sm mt-1">days in a row</p>
          </div>
        </div>

        {/* Card 1: Workouts Completed */}
        <div className="bg-background-card p-6 rounded-2xl border border-gray-800">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-sm font-bold text-text-muted uppercase">Total Sessions</p>
               <h3 className="text-3xl font-black text-white mt-1">{totalWorkouts}</h3>
             </div>
             <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
               <Calendar className="w-5 h-5" />
             </div>
           </div>
           <div className="mt-4 pt-4 border-t border-gray-700/50">
             <p className="text-sm text-gray-400">Sigue apareciendo. La constancia es clave.</p>
           </div>
        </div>

        {/* Card 2: Volume Chart */}
        <div className="bg-background-card p-6 rounded-2xl border border-gray-800">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-sm font-bold text-text-muted uppercase">Recent Volume (kg)</p>
               <h3 className="text-3xl font-black text-white mt-1">
                 {volumeData.length > 0 && volumeData[0].value > 0
                   ? (volumeData[volumeData.length-1].value / 1000).toFixed(1) + 'k'
                   : '0'
                 }
               </h3>
             </div>
             <div className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-bold flex items-center gap-1">
               <Activity className="w-3 h-3" /> Lifted
             </div>
           </div>
           <div className="h-32 mt-4">
             {volumeData.length > 0 ? (
               <MiniBarChart data={volumeData} />
             ) : (
               <div className="h-full flex items-center justify-center text-xs text-gray-400">Sin datos de entrenamiento</div>
             )}
           </div>
        </div>

        {/* Card 3: Gamification */}
        <div className="bg-background-card p-6 rounded-2xl border border-gray-800 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
             <Trophy className="w-32 h-32" />
           </div>
           <div>
             <p className="text-sm font-bold text-text-muted uppercase">Lifetime Volume</p>
             <h3 className="text-3xl font-black text-white mt-1">{(totalLifetimeVolume/1000).toFixed(0)}k <span className="text-base text-gray-400 font-medium">kg</span></h3>
             <p className="text-sm text-primary mt-2 font-bold">Level {user?.level} {user?.tier}</p>
           </div>
           <div className="w-full bg-gray-800 h-2 rounded-full mt-4 overflow-hidden">
             <div className="bg-primary h-full" style={{ width: `${(user ? (user.xp / user.xpToNextLevel) * 100 : 0)}%` }}></div>
           </div>
        </div>
      </div>

      {/* Detailed Chart */}
      <div className="bg-background-card p-6 rounded-2xl border border-gray-800">
         <h3 className="text-lg font-bold text-white mb-6">Progresion de Volumen</h3>
         <div className="h-64">
           {volumeData.length > 0 ? (
             <VolumeAreaChart data={volumeData} />
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <Activity className="w-8 h-8 opacity-50" />
                <p className="text-sm">Completa un entrenamiento para ver tu progreso</p>
             </div>
           )}
         </div>
      </div>

      {/* Analytics: Volume by Muscle Group + XP per Session */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Volume by Muscle Group */}
        <div className="bg-background-card p-6 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold text-white">Volumen por Grupo Muscular</h3>
          </div>
          {muscleVolumeData.length > 0 ? (
            <div className="space-y-3">
              {muscleVolumeData.map(({ muscle, volume }) => {
                const maxVol = muscleVolumeData[0].volume;
                const pct = (volume / maxVol) * 100;
                return (
                  <div key={muscle} className="flex items-center gap-3">
                    <span className="text-sm text-gray-300 w-24 truncate">{muscle}</span>
                    <div className="flex-1 h-6 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-16 text-right">
                      {volume >= 1000 ? `${(volume / 1000).toFixed(1)}k` : volume} kg
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Target className="w-8 h-8 opacity-50" />
              <p className="text-sm">Sin datos de volumen</p>
            </div>
          )}
        </div>

        {/* XP per Session */}
        <div className="bg-background-card p-6 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-bold text-white">XP por Sesion</h3>
          </div>
          {xpPerSession.length > 0 ? (
            <div className="h-48">
              <VolumeAreaChart data={xpPerSession} />
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Zap className="w-8 h-8 opacity-50" />
              <p className="text-sm">Completa sesiones para ver tu XP</p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Frequency */}
      <div className="bg-background-card p-6 rounded-2xl border border-gray-800">
        <h3 className="text-lg font-bold text-white mb-6">Frecuencia Semanal (Ultimas 8 Semanas)</h3>
        {workoutHistory.length > 0 ? (
          <div className="flex items-end gap-2 h-32">
            {weeklyFrequency.map((w, i) => {
              const maxCount = Math.max(...weeklyFrequency.map(wk => wk.count), 1);
              const h = (w.count / maxCount) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-white font-bold">{w.count}</span>
                  <div className="w-full bg-gray-800 rounded-t-md relative" style={{ height: '80px' }}>
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-red-400 rounded-t-md transition-all"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 truncate w-full text-center">{w.label}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center text-gray-400 gap-2">
            <Calendar className="w-8 h-8 opacity-50" />
            <p className="text-sm">Sin datos de frecuencia</p>
          </div>
        )}
      </div>

      {/* Personal Records */}
      <div className="bg-background-card p-6 rounded-2xl border border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-bold text-white">Records Personales</h3>
        </div>

        {prList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {prList.map(pr => (
              <div
                key={pr.exerciseId}
                className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 flex flex-col gap-1"
              >
                <p className="text-white font-bold text-sm truncate">{pr.name}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-primary">{pr.weight}</span>
                  <span className="text-sm text-gray-400">kg x {pr.reps}</span>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {new Date(pr.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-3">
            <div className="w-14 h-14 bg-gray-800/50 rounded-full flex items-center justify-center">
              <Trophy className="w-7 h-7 opacity-50" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white">Sin records personales</p>
              <p className="text-xs text-gray-400 mt-1">Completa entrenamientos para establecer tus primeros PRs</p>
            </div>
          </div>
        )}
      </div>

      {/* PR History Chart */}
      {exercisesWithHistory.length > 0 && (
        <div className="bg-background-card p-6 rounded-2xl border border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-bold text-white">Progresion de Peso por Ejercicio</h3>
            </div>
            <div className="relative">
              <select
                value={activePRExercise}
                onChange={e => setSelectedPRExercise(e.target.value)}
                className="appearance-none bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-4 py-2 pr-8 focus:outline-none focus:border-primary cursor-pointer"
                aria-label="Seleccionar ejercicio"
              >
                {exercisesWithHistory.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {prHistoryData.length >= 2 ? (
            <div className="h-56">
              <VolumeAreaChart data={prHistoryData} />
            </div>
          ) : prHistoryData.length === 1 ? (
            <div className="h-56 flex flex-col items-center justify-center text-gray-400 gap-2">
              <p className="text-sm">Solo 1 sesion registrada. Entrena mas para ver la progresion.</p>
              <div className="mt-2 text-center">
                <span className="text-3xl font-black text-white">{prHistoryData[0].value}</span>
                <span className="text-gray-400 ml-1">kg</span>
                <p className="text-xs text-gray-500 mt-1">{prHistoryData[0].label}</p>
              </div>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-gray-400 gap-2">
              <TrendingUp className="w-8 h-8 opacity-50" />
              <p className="text-sm">Sin datos para este ejercicio</p>
            </div>
          )}

          {prHistoryData.length >= 2 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50 text-xs text-gray-400">
              <span>Inicio: <span className="text-white font-bold">{prHistoryData[0].value} kg</span></span>
              <span className="text-green-400 font-bold">
                {prHistoryData[prHistoryData.length - 1].value > prHistoryData[0].value
                  ? `+${(prHistoryData[prHistoryData.length - 1].value - prHistoryData[0].value).toFixed(1)} kg`
                  : `${(prHistoryData[prHistoryData.length - 1].value - prHistoryData[0].value).toFixed(1)} kg`
                }
              </span>
              <span>Actual: <span className="text-white font-bold">{prHistoryData[prHistoryData.length - 1].value} kg</span></span>
            </div>
          )}
        </div>
      )}

      {/* Consistency Heatmap */}
      <div className="bg-background-card p-6 rounded-2xl border border-gray-800">
         <h3 className="text-lg font-bold text-white mb-4">Mapa de Consistencia (Ultimos 60 Dias)</h3>
         <div role="img" aria-label="Mapa de consistencia de los ultimos 60 dias" className="grid grid-cols-10 sm:grid-cols-[repeat(20,minmax(0,1fr))] gap-1 sm:gap-2">
            {heatmapDays.map((day, i) => (
              <div
                key={i}
                className="aspect-square rounded-sm transition-all"
                style={{
                  backgroundColor: day.hasWorkout ? 'rgba(220, 38, 38, 0.8)' : 'rgba(55, 65, 81, 0.3)'
                }}
                title={day.hasWorkout ? `Workout: ${day.date}` : day.date}
              ></div>
            ))}
         </div>
         <div className="flex justify-end items-center gap-2 mt-4 text-xs text-text-muted font-medium">
            <span>Rest</span>
            <div className="w-3 h-3 bg-gray-700/30 rounded-sm"></div>
            <div className="w-3 h-3 bg-primary rounded-sm"></div>
            <span>Workout</span>
         </div>
      </div>
    </div>
  );
};

export default Progress;
