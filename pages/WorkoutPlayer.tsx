import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Dumbbell,
  Trophy,
  Zap,
  Target,
} from 'lucide-react';
import { exercises as allExercises } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { useSessionTimer } from '../hooks/useSessionTimer';
import { cn } from '../lib/utils';
import { XP } from '../lib/constants';
import { calculateWorkoutXP, XPBreakdown } from '../services/xp';
import { WorkoutSession } from '../types';
import { Button } from '../components/ui/Button';
import { SessionHeader } from '../components/session/SessionHeader';
import { ExerciseCard } from '../components/session/ExerciseCard';
import { ExerciseSidebar } from '../components/session/ExerciseSidebar';
import { SessionSummary } from '../components/session/SessionSummary';
import { SetInputModal, SetData } from '../components/session/SetInputModal';
import { RestTimerCompact } from '../components/session/RestTimer';
import { AddExerciseModal } from '../components/workout/AddExerciseModal';

interface WorkoutPlayerProps {
  onFinish: () => void;
  onBack: () => void;
}

const WorkoutPlayer: React.FC<WorkoutPlayerProps> = ({ onFinish, onBack }) => {
  const {
    activeWorkout,
    user,
    personalRecords,
    updateSet,
    addSet,
    deleteSet,
    addExerciseToSession,
    removeExerciseFromSession,
    completeSession,
    restTimer,
    startRestTimer,
    stopRestTimer,
  } = useApp();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSetIndex, setSelectedSetIndex] = useState<number | null>(null);
  const [xpPopup, setXpPopup] = useState<{ amount: number; key: number } | null>(null);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const summarySnapshot = useRef<{
    session: WorkoutSession;
    xpBreakdown: XPBreakdown;
    previousRecords: Map<string, { weight: number; reps: number }>;
  } | null>(null);

  const { duration: sessionTime } = useSessionTimer(activeWorkout?.startTime);

  // Bounds check when exercises are removed mid-workout
  useEffect(() => {
    if (activeWorkout?.exercises && currentExerciseIndex >= activeWorkout.exercises.length) {
      setCurrentExerciseIndex(Math.max(0, activeWorkout.exercises.length - 1));
    }
  }, [activeWorkout, currentExerciseIndex]);

  // Reset selected set when navigating exercises
  useEffect(() => {
    setSelectedSetIndex(null);
  }, [currentExerciseIndex]);

  // Auto-dismiss XP popup
  useEffect(() => {
    if (xpPopup) {
      const timer = setTimeout(() => setXpPopup(null), 1800);
      return () => clearTimeout(timer);
    }
  }, [xpPopup]);

  // --- Handlers that don't depend on derived state ---

  const handleFinish = () => {
    if (!activeWorkout || !user) return;

    // Snapshot data before completeSession clears activeWorkout
    const sessionWithEnd: WorkoutSession = {
      ...activeWorkout,
      endTime: Date.now(),
      completed: true,
      status: 'completed',
    };

    const xpBreakdown = calculateWorkoutXP(activeWorkout, user.streak, personalRecords);

    // Snapshot previous PRs for improvement comparison
    const prevRecords = new Map<string, { weight: number; reps: number }>();
    for (const exerciseId of xpBreakdown.prsAchieved) {
      const pr = personalRecords.get(exerciseId);
      if (pr) prevRecords.set(exerciseId, { weight: pr.weight, reps: pr.reps });
    }

    summarySnapshot.current = {
      session: sessionWithEnd,
      xpBreakdown,
      previousRecords: prevRecords,
    };

    // Complete session (saves to state/localStorage, updates XP, syncs Supabase)
    stopRestTimer();
    completeSession();
    setShowSummary(true);
  };

  const handleSummaryClose = () => {
    summarySnapshot.current = null;
    onFinish();
  };

  // Show summary after session completion (MUST be before activeWorkout access)
  if (showSummary && summarySnapshot.current && user) {
    return (
      <SessionSummary
        session={summarySnapshot.current.session}
        xpBreakdown={summarySnapshot.current.xpBreakdown}
        user={user}
        previousRecords={summarySnapshot.current.previousRecords}
        onClose={handleSummaryClose}
      />
    );
  }

  // Guard: if activeWorkout was cleared but summary isn't showing
  if (!activeWorkout) {
    return (
      <div className="flex items-center justify-center h-screen p-8 text-white">
        No hay sesión activa.
      </div>
    );
  }

  // --- Derived state (activeWorkout guaranteed non-null below) ---

  const totalExercises = activeWorkout.exercises.length;
  const activeExerciseData = activeWorkout.exercises[currentExerciseIndex];
  const exerciseInfo = activeExerciseData
    ? allExercises.find(e => e.id === activeExerciseData.exerciseId)
    : null;

  const nextPendingSetIndex = activeExerciseData
    ? activeExerciseData.sets.findIndex(s => !s.completed)
    : 0;

  const allCurrentSetsComplete = activeExerciseData
    ? activeExerciseData.sets.length > 0 && activeExerciseData.sets.every(s => s.completed)
    : false;

  const isLastExercise = currentExerciseIndex === totalExercises - 1;
  const isFirstExercise = currentExerciseIndex === 0;

  const allExercisesComplete = activeWorkout.exercises.every(
    ex => ex.sets.length > 0 && ex.sets.every(s => s.completed)
  );

  // Live XP calculation from all completed sets
  const sessionXP = activeWorkout.exercises.reduce((total, ex) => {
    return total + ex.sets.reduce((setTotal, set) => {
      if (!set.completed) return setTotal;
      let xp = XP.PER_SET;
      if (set.rpe && set.rpe >= 9) xp += XP.BONUS_RPE_9_PLUS;
      return setTotal + xp;
    }, 0);
  }, 0);

  // Next exercise info for mobile preview
  const nextExerciseData = !isLastExercise
    ? activeWorkout.exercises[currentExerciseIndex + 1]
    : null;
  const nextExerciseInfo = nextExerciseData
    ? allExercises.find(e => e.id === nextExerciseData.exerciseId)
    : null;

  // --- Handlers that depend on derived state ---

  const handleSetClick = (setIndex: number) => {
    setSelectedSetIndex(setIndex);
  };

  const handleSaveSet = (data: SetData) => {
    if (selectedSetIndex === null || !activeExerciseData) return;

    updateSet(currentExerciseIndex, selectedSetIndex, 'weight', data.weight);
    updateSet(currentExerciseIndex, selectedSetIndex, 'reps', data.reps);
    updateSet(currentExerciseIndex, selectedSetIndex, 'rpe', data.rpe);
    updateSet(currentExerciseIndex, selectedSetIndex, 'completed', true);

    // Calculate XP for this set and show popup
    const xpGained = XP.PER_SET + (data.rpe >= 9 ? XP.BONUS_RPE_9_PLUS : 0);
    setXpPopup({ amount: xpGained, key: Date.now() });

    // Start rest timer
    const duration = activeExerciseData.restTimer || 90;
    startRestTimer(duration);
  };

  const handlePrev = () => {
    if (!isFirstExercise) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (!isLastExercise) {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  const handleExit = () => {
    stopRestTimer();
    onBack();
  };

  const handleAddExercise = (id: string) => {
    addExerciseToSession(id);
    setShowAddModal(false);
    setTimeout(() => {
      if (activeWorkout) setCurrentExerciseIndex(activeWorkout.exercises.length);
    }, 50);
  };

  // Previous set data for the modal
  const getSelectedSetPrevious = () => {
    if (selectedSetIndex === null || !activeExerciseData) return undefined;
    if (selectedSetIndex === 0) return undefined;
    const prevSet = activeExerciseData.sets[selectedSetIndex - 1];
    if (!prevSet.completed || prevSet.weight === 0) return undefined;
    return { weight: prevSet.weight, reps: prevSet.reps, rpe: prevSet.rpe };
  };

  // Selected set data (for editing completed sets)
  const getSelectedSetData = () => {
    if (selectedSetIndex === null || !activeExerciseData) return undefined;
    const set = activeExerciseData.sets[selectedSetIndex];
    if (!set.completed || set.weight === 0) return undefined;
    return { weight: set.weight, reps: set.reps, rpe: set.rpe };
  };

  // --- Derived data for ExerciseSidebar ---
  const sidebarExercises = activeWorkout.exercises.map(
    ex => allExercises.find(e => e.id === ex.exerciseId)!
  ).filter(Boolean);

  const completedExercises = activeWorkout.exercises.reduce<number[]>((acc, ex, idx) => {
    if (ex.sets.length > 0 && ex.sets.every(s => s.completed)) acc.push(idx);
    return acc;
  }, []);

  const setsProgress = activeWorkout.exercises.map(ex => ({
    completed: ex.sets.filter(s => s.completed).length,
    total: ex.sets.length,
  }));

  // --- Empty session state ---
  if (!activeExerciseData || !exerciseInfo) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-background">
        <SessionHeader
          exerciseIndex={0}
          totalExercises={0}
          sessionTime={sessionTime}
          sessionXP={0}
          onExit={handleExit}
        />
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 px-6">
          <div className="w-16 h-16 bg-background-card border border-gray-700 rounded-full flex items-center justify-center text-gray-500">
            <Dumbbell className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Sesión vacía</h2>
            <p className="text-text-muted mt-1">Agrega un ejercicio para continuar.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowAddModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
              Agregar ejercicio
            </Button>
            <Button variant="secondary" onClick={onBack}>
              Salir
            </Button>
          </div>
        </div>
        {showAddModal && (
          <AddExerciseModal onClose={() => setShowAddModal(false)} onSelect={handleAddExercise} />
        )}
      </div>
    );
  }

  const selectedSet = selectedSetIndex !== null
    ? activeExerciseData.sets[selectedSetIndex]
    : null;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      {/* XP popup animation keyframes */}
      <style>{`
        @keyframes xpFloat {
          0% { opacity: 0; transform: translateY(8px) scale(0.7); }
          15% { opacity: 1; transform: translateY(0) scale(1.15); }
          30% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-40px) scale(0.9); }
        }
      `}</style>

      {/* Fixed top header */}
      <SessionHeader
        exerciseIndex={currentExerciseIndex}
        totalExercises={totalExercises}
        sessionTime={sessionTime}
        sessionXP={sessionXP}
        onExit={handleExit}
      />

      {/* XP popup */}
      <div aria-live="polite" aria-atomic="true" className="fixed top-16 inset-x-0 flex justify-center z-50 pointer-events-none">
        {xpPopup && (
          <div
            key={xpPopup.key}
            style={{ animation: 'xpFloat 1.8s ease-out forwards' }}
          >
            <div className="bg-amber-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg shadow-amber-500/30 flex items-center gap-1.5">
              <Zap className="w-4 h-4 fill-current" />
              +{xpPopup.amount} XP
            </div>
          </div>
        )}
      </div>

      {/* === 2-column layout (sidebar + main) === */}
      <div className="flex-1 flex overflow-hidden">

        {/* --- Desktop Sidebar (lg+) --- */}
        <aside className="hidden lg:flex flex-col w-72 border-r border-gray-800/50 bg-background-card/50 shrink-0">
          {/* Sidebar header */}
          <div className="p-4 border-b border-gray-800/50">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Ejercicios</h2>
            <p className="text-xs text-text-muted mt-0.5">{activeWorkout.name}</p>
          </div>

          {/* Exercise list */}
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            <ExerciseSidebar
              exercises={sidebarExercises}
              currentIndex={currentExerciseIndex}
              completedExercises={completedExercises}
              onSelectExercise={setCurrentExerciseIndex}
              setsProgress={setsProgress}
              onAddExercise={() => setShowAddModal(true)}
            />
          </div>
        </aside>

        {/* --- Main content --- */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-20">
          <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
            {/* Exercise card */}
            <ExerciseCard
              exercise={exerciseInfo}
              sets={activeExerciseData.sets}
              currentSetIndex={nextPendingSetIndex >= 0 ? nextPendingSetIndex : 0}
              onSetClick={handleSetClick}
              isActive
              targetReps={activeExerciseData.sets[0]?.targetReps}
              targetRPE={activeExerciseData.sets[0]?.targetRPE}
            />

            {/* Add set button */}
            <button
              onClick={() => addSet(currentExerciseIndex)}
              className={cn(
                'w-full py-3 border border-dashed border-gray-700 rounded-xl',
                'text-sm font-bold text-text-muted',
                'hover:text-white hover:border-primary/50 hover:bg-primary/5',
                'transition-all flex items-center justify-center gap-2'
              )}
            >
              <Plus className="w-4 h-4" /> Agregar set
            </button>

            {/* Rest timer (when active) */}
            {(restTimer.isActive || restTimer.remaining > 0) && (
              <RestTimerCompact
                remaining={restTimer.remaining}
                duration={restTimer.duration}
                isActive={restTimer.isActive}
                onSkip={stopRestTimer}
              />
            )}

            {/* --- Mobile: exercise dots + upcoming section (hidden on lg+) --- */}
            <div className="lg:hidden space-y-3">
              {/* Dots indicator */}
              <div className="flex items-center justify-center gap-1.5 pt-2">
                {activeWorkout.exercises.map((ex, idx) => {
                  const isDone = ex.sets.length > 0 && ex.sets.every(s => s.completed);
                  const isCurrent = idx === currentExerciseIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentExerciseIndex(idx)}
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        isCurrent ? 'w-8 bg-primary' : 'w-2',
                        !isCurrent && isDone && 'bg-green-500',
                        !isCurrent && !isDone && 'bg-gray-700'
                      )}
                      aria-label={`Ejercicio ${idx + 1}`}
                    />
                  );
                })}
              </div>

              {/* Collapsible upcoming exercises */}
              {totalExercises > 1 && (
                <div className="rounded-xl border border-gray-800 bg-background-card/50 overflow-hidden">
                  <button
                    onClick={() => setShowUpcoming(!showUpcoming)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <span className="text-text-muted font-medium">
                        {nextExerciseInfo
                          ? `Siguiente: ${nextExerciseInfo.name}`
                          : 'Todos los ejercicios'
                        }
                      </span>
                    </div>
                    <ChevronDown className={cn(
                      'w-4 h-4 text-gray-500 transition-transform duration-200',
                      showUpcoming && 'rotate-180'
                    )} />
                  </button>

                  {showUpcoming && (
                    <div className="px-3 pb-3 border-t border-gray-800/50 pt-2">
                      <ExerciseSidebar
                        exercises={sidebarExercises}
                        currentIndex={currentExerciseIndex}
                        completedExercises={completedExercises}
                        onSelectExercise={setCurrentExerciseIndex}
                        setsProgress={setsProgress}
                        onAddExercise={() => setShowAddModal(true)}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Mobile add exercise (when only 1 exercise and collapsible hidden) */}
              {totalExercises <= 1 && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className={cn(
                    'w-full py-3 rounded-xl text-sm font-bold',
                    'bg-gray-800/50 border border-gray-700 text-text-muted',
                    'hover:text-white hover:border-gray-600',
                    'transition-all flex items-center justify-center gap-2'
                  )}
                >
                  <Plus className="w-4 h-4" /> Agregar ejercicio
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Fixed bottom navigation */}
      <nav aria-label="Navegación de ejercicios" className="fixed bottom-0 inset-x-0 z-20 bg-background/95 backdrop-blur-xl border-t border-gray-800/50 px-4 py-3 safe-area-bottom">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          {allExercisesComplete ? (
            <Button
              variant="success"
              size="lg"
              onClick={handleFinish}
              leftIcon={<Trophy className="w-5 h-5" />}
              fullWidth
            >
              Finalizar entrenamiento
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                size="lg"
                onClick={handlePrev}
                disabled={isFirstExercise}
                leftIcon={<ChevronLeft className="w-5 h-5" />}
                className="flex-1"
              >
                Anterior
              </Button>
              <Button
                variant={allCurrentSetsComplete ? 'primary' : 'secondary'}
                size="lg"
                onClick={handleNext}
                disabled={isLastExercise}
                rightIcon={<ChevronRight className="w-5 h-5" />}
                className="flex-1"
              >
                Siguiente
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Set input modal */}
      {selectedSetIndex !== null && selectedSet && (
        <SetInputModal
          isOpen
          onClose={() => setSelectedSetIndex(null)}
          onSave={handleSaveSet}
          exerciseName={exerciseInfo.name}
          setNumber={selectedSetIndex + 1}
          totalSets={activeExerciseData.sets.length}
          previousSet={getSelectedSetData() || getSelectedSetPrevious()}
          recommendedWeight={selectedSet.recommendedWeight}
          targetReps={selectedSet.targetReps}
          targetRPE={selectedSet.targetRPE}
        />
      )}

      {/* Add exercise modal */}
      {showAddModal && (
        <AddExerciseModal
          onClose={() => setShowAddModal(false)}
          onSelect={handleAddExercise}
        />
      )}
    </div>
  );
};

export default WorkoutPlayer;
