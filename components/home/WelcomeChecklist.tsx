import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles, X } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  action?: string;
}

interface WelcomeChecklistProps {
  items: ChecklistItem[];
  onDismiss: () => void;
  onAction?: (itemId: string) => void;
}

export const WelcomeChecklist: React.FC<WelcomeChecklistProps> = ({ items, onDismiss, onAction }) => {
  const [expanded, setExpanded] = useState(true);
  const completedCount = items.filter(i => i.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  if (completedCount === items.length) return null;

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 rounded-2xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-xl">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Primeros Pasos</h3>
            <p className="text-xs text-gray-400">{completedCount}/{items.length} completados</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onDismiss(); }}
            className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Cerrar checklist"
          >
            <X className="w-4 h-4" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-3">
        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-red-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      {expanded && (
        <div className="px-5 pb-5 space-y-2">
          {items.map(item => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                item.completed ? 'bg-green-500/5' : 'bg-gray-800/50 hover:bg-gray-800'
              }`}
            >
              {item.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                  {item.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              </div>
              {!item.completed && item.action && onAction && (
                <button
                  onClick={() => onAction(item.id)}
                  className="text-xs text-primary font-bold hover:text-red-400 transition-colors shrink-0"
                >
                  {item.action}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
