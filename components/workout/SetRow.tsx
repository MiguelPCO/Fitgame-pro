import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Trash2,
  MoreVertical,
  AlertTriangle,
  ThumbsDown,
  MessageSquare,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { WorkoutSet } from '../../types';

export interface SetRowProps {
  set: WorkoutSet;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (field: keyof WorkoutSet, val: any) => void;
  onComplete: () => void;
  onDelete: () => void;
}

export const SetRow: React.FC<SetRowProps> = ({
  set,
  index,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onComplete,
  onDelete
}) => {
  // Visual indicators for edge cases
  const isFailed = set.isFailed;
  const isPain = set.isPain;

  // Weight Logic
  const weight = set.weight;
  const recommended = set.recommendedWeight || 0;
  const weightDiff = weight - recommended;
  const showWeightIndicator = recommended > 0 && Math.abs(weightDiff) >= 2.5;
  const weightColor = weightDiff > 0 ? 'text-green-500' : 'text-red-500';
  const WeightIcon = weightDiff > 0 ? TrendingUp : TrendingDown;

  // Local state for inputs to allow decimals
  const [localWeight, setLocalWeight] = useState(weight.toString());

  // Sync local state when prop changes externally
  useEffect(() => {
    if (Math.abs(parseFloat(localWeight || '0') - weight) > 0.01) {
      setLocalWeight(weight === 0 ? '' : weight.toString());
    }
  }, [weight]);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalWeight(val);

    const num = parseFloat(val);
    if (!isNaN(num)) {
      onUpdate('weight', num);
    } else if (val === '') {
      onUpdate('weight', 0);
    }
  };

  // Status Styling
  let rowBg = 'bg-background-lighter/50';
  let borderColor = 'border-gray-700/50';

  if (set.completed) {
     rowBg = 'bg-primary/10';
     borderColor = 'border-primary/30';
  }
  if (isFailed) {
    rowBg = 'bg-red-500/10';
    borderColor = 'border-red-500/30';
  }
  if (isPain) {
    rowBg = 'bg-yellow-500/10';
    borderColor = 'border-yellow-500/30';
  }

  return (
    <div className="flex flex-col gap-2">
      <div className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border transition-all duration-200 ${rowBg} ${borderColor} hover:border-gray-600`}>
        {/* Index */}
        <div className="col-span-1 flex justify-center">
          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${set.completed ? 'bg-primary text-white shadow-[0_0_5px_rgba(220,38,38,0.5)]' : 'bg-gray-800 text-gray-500'}`}>
            {index + 1}
          </span>
        </div>

        {/* Prev (Mocked) */}
        <div className="col-span-3 text-center text-xs text-text-muted font-mono leading-tight">
          <span className="block text-white opacity-60">{recommended > 0 ? `${recommended}kg` : '-'}</span>
          <span className="block opacity-40">x {set.targetReps}</span>
        </div>

        {/* Weight Input with Indicators */}
        <div className="col-span-3 relative">
           <input
            type="number"
            inputMode="decimal"
            value={localWeight}
            onChange={handleWeightChange}
            placeholder={recommended > 0 ? String(recommended) : '0'}
            className={`w-full bg-background border ${recommended > 0 && weight > 0 && weight !== recommended ? 'border-yellow-500/50 text-yellow-500' : 'border-gray-700 text-white'} rounded-lg text-center font-bold py-2 focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all`}
          />
          {showWeightIndicator && (
            <div className={`absolute -top-1 -right-1 bg-background rounded-full p-0.5 border border-gray-700 ${weightColor} shadow-sm`}>
               <WeightIcon className="w-2 h-2" />
            </div>
          )}
        </div>

        {/* Reps Input */}
        <div className="col-span-2">
          <input
            type="number"
            inputMode="decimal"
            value={set.reps || ''}
            onChange={(e) => onUpdate('reps', parseFloat(e.target.value) || 0)}
            className="w-full bg-background border border-gray-700 rounded-lg text-center text-white font-bold py-2 focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all"
            placeholder="0"
          />
        </div>

        {/* Check Button */}
        <div className="col-span-2 flex justify-center">
          <button onClick={onComplete} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all active:scale-95 ${set.completed ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
            <CheckCircle2 className="w-6 h-6" />
          </button>
        </div>

        {/* More Options */}
        <div className="col-span-1 flex justify-center">
          <button
            onClick={onToggleExpand}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isExpanded || isFailed || isPain ? 'text-white bg-gray-700' : 'text-gray-500 hover:bg-gray-700/50'}`}
          >
             <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Menu for Edge Cases */}
      {isExpanded && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-200 bg-black/20 rounded-xl border border-gray-700/50 p-3 flex flex-col gap-3 mb-2 ml-2 mr-2">
           <div className="flex gap-2">
             <button
               onClick={() => onUpdate('isFailed', !isFailed)}
               className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all border ${isFailed ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-background border-gray-700 text-gray-400 hover:text-white'}`}
             >
               <ThumbsDown className="w-3 h-3" /> {isFailed ? 'Marked Failed' : 'Mark Failure'}
             </button>

             <button
               onClick={() => onUpdate('isPain', !isPain)}
               className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all border ${isPain ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-background border-gray-700 text-gray-400 hover:text-white'}`}
             >
               <AlertTriangle className="w-3 h-3" /> {isPain ? 'Pain Reported' : 'Report Pain'}
             </button>

             <button
               onClick={onDelete}
               className="px-3 py-2 rounded-lg bg-background border border-gray-700 text-gray-400 hover:text-red-500 hover:border-red-500/50 transition-colors"
             >
               <Trash2 className="w-4 h-4" />
             </button>
           </div>

           <div className="relative">
             <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
             <input
               type="text"
               value={set.notes || ''}
               onChange={(e) => onUpdate('notes', e.target.value)}
               placeholder="Add notes (e.g., knee felt weird...)"
               className="w-full bg-background border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:border-primary focus:outline-none"
             />
           </div>
        </div>
      )}
    </div>
  );
};

export default SetRow;
