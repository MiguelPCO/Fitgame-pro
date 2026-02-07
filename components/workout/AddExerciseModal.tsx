import React, { useState } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { exercises as allExercises } from '../../data/mockData';

export interface AddExerciseModalProps {
  onClose: () => void;
  onSelect: (id: string) => void;
}

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({ onClose, onSelect }) => {
  const [query, setQuery] = useState('');
  const filtered = allExercises.filter(e => e.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-background-card border border-gray-700 rounded-2xl w-full max-w-lg flex flex-col max-h-[80vh] shadow-2xl">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="font-bold text-white">Add Exercise</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg text-text-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 border-b border-gray-700 bg-background-lighter/30">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input
               autoFocus
               type="text"
               placeholder="Search..."
               className="w-full bg-background border border-gray-600 rounded-lg pl-9 pr-4 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
               value={query}
               onChange={e => setQuery(e.target.value)}
             />
           </div>
        </div>
        <div className="overflow-y-auto p-2 space-y-1">
          {filtered.map(ex => (
            <button
              key={ex.id}
              onClick={() => onSelect(ex.id)}
              className="w-full text-left p-3 hover:bg-primary/10 rounded-xl flex justify-between items-center group transition-colors"
            >
               <div>
                 <p className="font-bold text-white group-hover:text-primary transition-colors">{ex.name}</p>
                 <p className="text-xs text-text-muted">{ex.muscleGroup.join(', ')}</p>
               </div>
               <Plus className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-text-muted">No exercises found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddExerciseModal;
