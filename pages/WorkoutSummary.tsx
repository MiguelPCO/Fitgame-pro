import React, { useEffect, useState } from 'react';
import { Share2, Home, Star, Trophy, Activity, Dumbbell, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exerciseBlueprints as allExercises } from '../data/exerciseBlueprints';
import { shareWorkout } from '../lib/share';

interface Props {
  onHome: () => void;
}

const WorkoutSummary: React.FC<Props> = ({ onHome }) => {
  const { lastCompletedSession, user } = useApp();
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  // Fallback if no session found (direct navigation safety)
  if (!lastCompletedSession || !user) {
    return (
       <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
         <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <Activity className="w-8 h-8" />
         </div>
         <h2 className="text-xl font-bold text-white mb-2">No Workout Found</h2>
         <p className="text-text-muted mb-6">Complete a workout to see your summary here.</p>
         <button onClick={onHome} className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform">Go to Dashboard</button>
       </div>
    );
  }

  // Calculate Real Stats
  const durationSec = lastCompletedSession.endTime && lastCompletedSession.startTime 
    ? Math.floor((lastCompletedSession.endTime - lastCompletedSession.startTime) / 1000) 
    : 0;
  const durationMin = Math.floor(durationSec / 60);

  let totalVolume = 0;
  let totalSets = 0;
  lastCompletedSession.exercises.forEach(ex => {
    ex.sets.forEach(set => {
      if (set.completed) {
        totalVolume += (set.weight * set.reps);
        totalSets++;
      }
    });
  });

  const handleShare = () => {
    shareWorkout(lastCompletedSession, user);
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 px-4 pt-6">
      {/* Confetti / Celebration Background Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
         <div className="absolute top-0 left-1/4 w-2 h-2 bg-red-500 rounded-full animate-[fall_3s_infinite]" style={{ animationDelay: '0.2s' }}></div>
         <div className="absolute top-0 left-3/4 w-2 h-2 bg-blue-500 rounded-full animate-[fall_3.5s_infinite]" style={{ animationDelay: '0.5s' }}></div>
         <div className="absolute top-0 left-1/2 w-3 h-3 bg-yellow-500 rounded-full animate-[fall_2.8s_infinite]" style={{ animationDelay: '1s' }}></div>
         <div className="absolute top-0 left-1/3 w-2 h-2 bg-green-500 rounded-full animate-[fall_4s_infinite]" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      <div className={`transition-all duration-700 transform ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Header Card */}
        <div className="bg-background-card border border-primary/50 rounded-3xl p-8 text-center relative overflow-hidden shadow-[0_0_60px_rgba(220,38,38,0.2)] mb-8">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent"></div>
          
          <div className="relative z-10 flex flex-col items-center">
             <div className="mb-6 relative">
               <div className="absolute inset-0 bg-primary/40 blur-2xl rounded-full"></div>
               <div className="w-24 h-24 bg-gradient-to-br from-primary to-red-800 rounded-2xl flex items-center justify-center relative shadow-xl rotate-3 border border-white/10">
                 <Trophy className="w-12 h-12 text-white" />
               </div>
               <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-background-card rounded-full flex items-center justify-center border border-gray-700 shadow-lg">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
               </div>
             </div>
             
             <h1 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight">WORKOUT CRUSHED!</h1>
             <p className="text-lg text-text-muted mb-6 max-w-md">Outstanding effort, {user.name.split(' ')[0]}. You're building a better version of yourself.</p>
             
             <div className="flex flex-wrap items-center justify-center gap-3">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-background-lighter/50 backdrop-blur-md text-white rounded-full font-bold border border-white/5">
                   <Star className="w-4 h-4 text-yellow-500 fill-current" />
                   <span className="text-yellow-500">+{lastCompletedSession.xpReward} XP</span>
                </div>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-background-lighter/50 backdrop-blur-md text-white rounded-full font-bold border border-white/5">
                   <Calendar className="w-4 h-4 text-primary" />
                   <span>{user.streak} Day Streak</span>
                </div>
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Duration', val: durationMin, unit: 'Minutes', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Volume', val: (totalVolume / 1000).toFixed(1), unit: 'Tonnes', icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
            { label: 'Sets', val: totalSets, unit: 'Completed', icon: Dumbbell, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { label: 'Exercises', val: lastCompletedSession.exercises.length, unit: 'Total', icon: CheckCircle2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map((stat, i) => (
             <div key={i} className="bg-background-card p-5 rounded-2xl border border-gray-800 flex flex-col items-center justify-center text-center hover:border-gray-700 transition-colors">
                <div className={`p-3 rounded-full ${stat.bg} ${stat.color} mb-3`}>
                   <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black text-white tracking-tight">{stat.val}</span>
                <span className="text-xs text-text-muted font-bold uppercase tracking-wider">{stat.unit}</span>
             </div>
          ))}
        </div>

        {/* Exercise Breakdown */}
        <div className="bg-background-card border border-gray-800 rounded-3xl overflow-hidden mb-8 shadow-xl">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-white/5">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" /> Session Summary
            </h3>
            <span className="text-xs font-bold text-text-muted bg-black/20 px-3 py-1 rounded-full">{lastCompletedSession.name}</span>
          </div>
          <div className="divide-y divide-gray-800">
            {lastCompletedSession.exercises.map((ex, i) => {
              const info = allExercises.find(e => e.id === ex.exerciseId);
              const bestSet = ex.sets.reduce((prev, current) => (current.weight > prev.weight && current.completed) ? current : prev, { weight: 0, reps: 0 } as { weight: number; reps: number });
              const setsCompleted = ex.sets.filter(s => s.completed).length;

              return (
                <div key={i} className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors group">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 font-bold group-hover:text-white group-hover:bg-gray-700 transition-colors">
                       {i + 1}
                     </div>
                     <div>
                       <p className="font-bold text-white text-base">{info?.name || 'Unknown'}</p>
                       <p className="text-sm text-text-muted flex items-center gap-2">
                         {setsCompleted} sets 
                         <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                         Top: {bestSet.weight}kg
                       </p>
                     </div>
                   </div>
                   
                   {bestSet.weight > 0 ? (
                     <div className="text-right">
                        <div className="flex items-center gap-1 justify-end text-white font-bold text-lg">
                           {bestSet.weight}<span className="text-sm text-gray-400 font-normal">kg</span>
                           <span className="text-gray-400 mx-1">x</span>
                           {bestSet.reps}
                        </div>
                        <div className="flex justify-end mt-1">
                          <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/20">
                            BEST SET
                          </span>
                        </div>
                     </div>
                   ) : (
                     <span className="text-sm font-bold text-gray-400 bg-gray-800/50 px-3 py-1 rounded-lg">Skipped</span>
                   )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleShare}
            className="flex-1 py-4 bg-background-lighter border border-gray-700 hover:bg-gray-700 hover:border-gray-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all group"
          >
            <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" /> Share Results
          </button>
          <button 
            onClick={onHome} 
            className="flex-1 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all group hover:scale-[1.02]"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" /> Back to Dashboard
          </button>
        </div>

      </div>
      
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default WorkoutSummary;