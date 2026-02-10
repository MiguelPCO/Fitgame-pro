import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Dumbbell,
  Info,
  X,
  CheckCircle2,
  Plus,
  Zap
} from 'lucide-react';
import { exerciseBlueprints as allExercises } from '../data/exerciseBlueprints';
import { useApp } from '../context/AppContext';
import { Exercise } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge, getDifficultyVariant } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';

const ExerciseLibrary: React.FC = () => {
  const { activeWorkout, addExerciseToSession } = useApp();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('All');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [addedIds, setAddedIds] = useState<string[]>([]); // Visual feedback for added items

  // Unique Lists for Filters
  const muscleGroups = ['All', ...Array.from(new Set(allExercises.flatMap(e => e.muscleGroup)))];
  const equipmentTypes = ['All', ...Array.from(new Set(allExercises.map(e => e.equipment)))];

  // Filtering Logic
  const filteredExercises = useMemo(() => {
    return allExercises.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMuscle = selectedMuscle === 'All' || ex.muscleGroup.includes(selectedMuscle);
      const matchesEquipment = selectedEquipment === 'All' || ex.equipment === selectedEquipment;
      return matchesSearch && matchesMuscle && matchesEquipment;
    });
  }, [searchQuery, selectedMuscle, selectedEquipment]);

  // Handlers
  const handleAddToWorkout = (e: React.MouseEvent, exerciseId: string) => {
    e.stopPropagation();
    if (!activeWorkout) return;
    
    addExerciseToSession(exerciseId);
    
    // Visual feedback
    setAddedIds(prev => [...prev, exerciseId]);
    setTimeout(() => {
      setAddedIds(prev => prev.filter(id => id !== exerciseId));
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-20 relative">
      
      {/* Active Workout Banner (if applicable) */}
      {activeWorkout && (
        <div className="sticky top-0 z-30 bg-primary/90 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between mb-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 fill-white" />
            <span className="text-sm font-bold">Workout in Progress</span>
          </div>
          <span className="text-xs opacity-90">Tap '+' to add exercises</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-800 pb-6">
        <div>
           <h1 className="text-3xl font-black text-white">Exercise Library</h1>
           <p className="text-text-muted mt-2 max-w-2xl">
             Explore our scientific database of {allExercises.length}+ exercises. Master your technique.
           </p>
        </div>
        <div className="flex gap-4 text-right">
           <div>
             <p className="text-2xl font-bold text-white">{filteredExercises.length}</p>
             <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Results</p>
           </div>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="sticky top-0 md:static z-20 bg-background/95 backdrop-blur-xl md:bg-transparent py-2 md:py-0 space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by name..."
              leftIcon={<Search className="w-5 h-5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background-card rounded-xl py-3 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 rounded-xl border flex items-center gap-2 transition-colors ${showFilters ? 'bg-primary border-primary text-white' : 'bg-background-card border-gray-700 text-text-muted'}`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Expandable Filters */}
        {(showFilters || window.innerWidth >= 768) && (
          <div className={`flex flex-col md:flex-row gap-4 animate-in fade-in slide-in-from-top-2 ${showFilters ? 'block' : 'hidden md:flex'}`}>
            
            {/* Muscle Filter */}
            <div className="flex-1">
               <label className="text-xs font-bold text-text-muted uppercase mb-1.5 block ml-1">Muscle Group</label>
               <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                 {muscleGroups.map(muscle => (
                   <button
                     key={muscle}
                     onClick={() => setSelectedMuscle(muscle)}
                     className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${selectedMuscle === muscle ? 'bg-white text-black border-white' : 'bg-background-card border-gray-700 text-text-muted hover:border-gray-500'}`}
                   >
                     {muscle}
                   </button>
                 ))}
               </div>
            </div>

            {/* Equipment Filter */}
            <div className="flex-1">
               <label className="text-xs font-bold text-text-muted uppercase mb-1.5 block ml-1">Equipment</label>
               <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                 {equipmentTypes.map(eq => (
                   <button
                     key={eq}
                     onClick={() => setSelectedEquipment(eq)}
                     className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${selectedEquipment === eq ? 'bg-white text-black border-white' : 'bg-background-card border-gray-700 text-text-muted hover:border-gray-500'}`}
                   >
                     {eq}
                   </button>
                 ))}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 min-h-[500px]">
        {filteredExercises.length > 0 ? (
          filteredExercises.map((exercise) => (
            <ExerciseCard 
              key={exercise.id} 
              exercise={exercise} 
              onClick={() => setSelectedExercise(exercise)}
              onAdd={(e) => handleAddToWorkout(e, exercise.id)}
              isActiveSession={!!activeWorkout}
              isAdded={addedIds.includes(exercise.id)}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center text-center py-20 text-text-muted">
             <Dumbbell className="w-16 h-16 opacity-20 mb-4" />
             <p className="text-lg font-medium text-white">No exercises found.</p>
             <p>Try adjusting your search or filters.</p>
             <button 
               onClick={() => {setSelectedMuscle('All'); setSelectedEquipment('All'); setSearchQuery('');}}
               className="mt-4 px-6 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition-colors"
             >
               Clear Filters
             </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal 
          exercise={selectedExercise} 
          onClose={() => setSelectedExercise(null)} 
          onAdd={() => {
             if(activeWorkout) addExerciseToSession(selectedExercise.id);
             setSelectedExercise(null);
          }}
          isActiveSession={!!activeWorkout}
        />
      )}

    </div>
  );
};

// ----------------------------------------------------------------------
// Sub-Components
// ----------------------------------------------------------------------

interface CardProps {
  exercise: Exercise;
  onClick: () => void;
  onAdd: (e: React.MouseEvent) => void;
  isActiveSession: boolean;
  isAdded: boolean;
}

// Memoized to prevent re-renders on unrelated parent state changes
const ExerciseCard: React.FC<CardProps> = React.memo(({ exercise, onClick, onAdd, isActiveSession, isAdded }) => {
  return (
    <div 
      onClick={onClick}
      className="group bg-background-card rounded-2xl border border-gray-800 p-3 transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer hover:border-gray-600 relative overflow-hidden"
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-900 mb-3">
         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10"></div>
         
         <img 
           // Added signature to URL to encourage consistent caching and reduce random flickering
           src={`https://source.unsplash.com/random/400x300/?gym,${exercise.name.replace(/\s/g, ',')}&sig=${exercise.id}`}
           alt={exercise.name}
           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90"
           loading="lazy"
         />

         {/* Tags */}
         <div className="absolute top-2 left-2 z-20 flex flex-wrap gap-1">
           <Badge variant={getDifficultyVariant(exercise.difficulty)} className="backdrop-blur-sm">
             {exercise.difficulty}
           </Badge>
         </div>

         <div className="absolute bottom-2 left-2 z-20">
           <span className="text-xs text-primary font-bold bg-black/50 px-2 py-0.5 rounded backdrop-blur-md">
             {exercise.type}
           </span>
         </div>

         {/* Add Button (Conditional) */}
         {isActiveSession && (
           <button 
             onClick={onAdd}
             className={`absolute bottom-2 right-2 z-30 p-2.5 rounded-full shadow-lg transition-all active:scale-90
               ${isAdded 
                 ? 'bg-green-500 text-white cursor-default' 
                 : 'bg-primary text-white hover:bg-primary-hover hover:scale-110'}
             `}
           >
             {isAdded ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
           </button>
         )}
      </div>

      {/* Info Area */}
      <div className="px-1 space-y-1">
        <h3 className="text-white font-bold text-lg group-hover:text-primary transition-colors truncate leading-tight">
          {exercise.name}
        </h3>
        <p className="text-xs text-text-muted line-clamp-1">
          {exercise.muscleGroup.join(', ')} • {exercise.equipment}
        </p>
      </div>
    </div>
  );
});

interface ModalProps {
  exercise: Exercise;
  onClose: () => void;
  onAdd: () => void;
  isActiveSession: boolean;
}

const ExerciseDetailModal: React.FC<ModalProps> = ({ exercise, onClose, onAdd, isActiveSession }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-background-card w-full max-w-2xl max-h-[90vh] rounded-3xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 text-white hover:bg-white hover:text-black transition-colors backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Image/Video */}
          <div className="h-64 bg-black relative shrink-0">
             <div className="absolute inset-0 bg-gradient-to-t from-background-card to-transparent z-10"></div>
             <img 
               src={`https://source.unsplash.com/random/800x600/?gym,${exercise.name.replace(/\s/g, ',')}`}
               className="w-full h-full object-cover opacity-80" 
               alt={exercise.name}
             />
             <div className="absolute bottom-4 left-6 z-20">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-1 shadow-black drop-shadow-lg">{exercise.name}</h2>
                <div className="flex gap-2">
                   {exercise.muscleGroup.map(m => (
                     <span key={m} className="px-2 py-1 bg-primary/80 text-white text-xs font-bold rounded shadow-lg">{m}</span>
                   ))}
                </div>
             </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
             
             {/* Quick Stats */}
             <div className="grid grid-cols-3 gap-4">
                <div className="bg-background-lighter/50 p-3 rounded-xl border border-gray-700 text-center">
                   <p className="text-[10px] uppercase font-bold text-text-muted">Type</p>
                   <p className="text-sm font-bold text-white">{exercise.type}</p>
                </div>
                <div className="bg-background-lighter/50 p-3 rounded-xl border border-gray-700 text-center">
                   <p className="text-[10px] uppercase font-bold text-text-muted">Equipment</p>
                   <p className="text-sm font-bold text-white">{exercise.equipment}</p>
                </div>
                <div className="bg-background-lighter/50 p-3 rounded-xl border border-gray-700 text-center">
                   <p className="text-[10px] uppercase font-bold text-text-muted">Level</p>
                   <p className={`text-sm font-bold ${exercise.difficulty === 'Advanced' ? 'text-red-400' : 'text-green-400'}`}>
                     {exercise.difficulty}
                   </p>
                </div>
             </div>

             {/* Instructions */}
             <div>
               <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                 <Info className="w-5 h-5 text-primary" /> Instructions
               </h3>
               <ol className="space-y-4 relative border-l border-gray-700 ml-2 pl-6">
                  {exercise.instructions.map((step, i) => (
                    <li key={i} className="relative">
                       <span className="absolute -left-[33px] top-0 w-6 h-6 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-xs font-bold text-gray-400">
                         {i + 1}
                       </span>
                       <p className="text-gray-300 text-sm leading-relaxed">{step}</p>
                    </li>
                  ))}
               </ol>
             </div>

             {/* Pro Tips */}
             <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                <h3 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Pro Tips
                </h3>
                <ul className="space-y-2">
                  {exercise.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
             </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-800 bg-background-card/95 backdrop-blur flex justify-end gap-3">
             <Button variant="ghost" onClick={onClose}>
               Close
             </Button>
             {isActiveSession && (
               <Button
                 onClick={onAdd}
                 size="lg"
                 leftIcon={<Plus className="w-5 h-5" />}
               >
                 Add to Workout
               </Button>
             )}
          </div>
       </div>
    </div>
  );
};

export default ExerciseLibrary;