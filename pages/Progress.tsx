import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Activity, Trophy, Calendar, Flame, Award } from 'lucide-react';
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

const Progress: React.FC = () => {
  const { workoutHistory, user, personalRecords } = useApp();

  // Helper to calculate total volume for a session
  const calculateSessionVolume = (session: WorkoutSession) => {
    return session.exercises.reduce((acc, ex) => {
      return acc + ex.sets.reduce((sAcc, s) => s.completed ? sAcc + (s.weight * s.reps) : sAcc, 0);
    }, 0);
  };

  // Transform history for charts
  const volumeData = workoutHistory.length > 0
    ? workoutHistory.map(session => ({
        date: new Date(session.endTime || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        volume: calculateSessionVolume(session),
        name: session.name
      })).slice(-7)
    : [
        { date: 'No Data', volume: 0, name: '' }
      ];

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

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-end border-b border-gray-800 pb-6">
        <div>
           <h1 className="text-3xl font-black text-white">Your Progress</h1>
           <p className="text-text-muted mt-1">Analytics based on your {totalWorkouts} completed sessions.</p>
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
             <p className="text-sm text-gray-400">Keep showing up. Consistency is key.</p>
           </div>
        </div>

        {/* Card 2: Volume Chart */}
        <div className="bg-background-card p-6 rounded-2xl border border-gray-800">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-sm font-bold text-text-muted uppercase">Recent Volume (kg)</p>
               <h3 className="text-3xl font-black text-white mt-1">
                 {volumeData.length > 0 && volumeData[0].volume > 0
                   ? (volumeData[volumeData.length-1].volume / 1000).toFixed(1) + 'k'
                   : '0'
                 }
               </h3>
             </div>
             <div className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-bold flex items-center gap-1">
               <Activity className="w-3 h-3" /> Lifted
             </div>
           </div>
           <div className="h-32 mt-4">
             {workoutHistory.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={volumeData}>
                   <Bar dataKey="volume" fill="#DC2626" radius={[4, 4, 0, 0]} />
                   <Tooltip
                     cursor={{fill: 'rgba(255,255,255,0.05)'}}
                     contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                     itemStyle={{ color: '#fff' }}
                   />
                 </BarChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-xs text-gray-400">No workout data yet</div>
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
         <h3 className="text-lg font-bold text-white mb-6">Volume Progression</h3>
         <div className="h-64">
           {workoutHistory.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={volumeData}>
                 <defs>
                   <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                 <XAxis dataKey="date" stroke="#9CA3AF" tick={{fontSize: 12}} />
                 <YAxis stroke="#9CA3AF" tick={{fontSize: 12}} />
                 <Tooltip
                   contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                 />
                 <Area type="monotone" dataKey="volume" stroke="#DC2626" fillOpacity={1} fill="url(#colorVol)" strokeWidth={3} />
               </AreaChart>
             </ResponsiveContainer>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                <Activity className="w-8 h-8 opacity-50" />
                <p>Complete a workout to see your analytics</p>
             </div>
           )}
         </div>
      </div>

      {/* Personal Records */}
      <div className="bg-background-card p-6 rounded-2xl border border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-bold text-white">Personal Records</h3>
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
          <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
            <Trophy className="w-8 h-8 opacity-50" />
            <p className="text-sm">Complete workouts to set your first PR</p>
          </div>
        )}
      </div>

      {/* Consistency Heatmap */}
      <div className="bg-background-card p-6 rounded-2xl border border-gray-800">
         <h3 className="text-lg font-bold text-white mb-4">Consistency Heatmap (Last 60 Days)</h3>
         <div className="grid grid-cols-10 sm:grid-cols-[repeat(20,minmax(0,1fr))] gap-1 sm:gap-2">
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
