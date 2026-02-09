import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Dumbbell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { exercises as allExercises } from '../data/mockData';
import { WorkoutTemplate, TemplateExercise } from '../types';

interface TemplateEditorProps {
  editId: string | null;
  onClose: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ editId, onClose }) => {
  const { templates, saveTemplate } = useApp();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('60 Mins');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [templateExercises, setTemplateExercises] = useState<TemplateExercise[]>([]);
  
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  useEffect(() => {
    if (editId) {
      const existing = templates.find(t => t.id === editId);
      if (existing) {
        setName(existing.name);
        setDescription(existing.description || '');
        setDuration(existing.duration);
        setDifficulty(existing.difficulty);
        setTemplateExercises(existing.exercises);
      }
    }
  }, [editId, templates]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name) return alert("Please enter a template name");
    if (templateExercises.length === 0) return alert("Please add at least one exercise");

    setIsSaving(true);
    try {
      const newTemplate: WorkoutTemplate = {
        id: editId || crypto.randomUUID(),
        name,
        description,
        duration,
        difficulty,
        exercises: templateExercises,
        muscleFocus: Array.from(new Set(
          templateExercises.flatMap(te => {
            const ex = allExercises.find(e => e.id === te.exerciseId);
            return ex ? ex.muscleGroup : [];
          })
        ))
      };

      await saveTemplate(newTemplate);
      toast(editId ? 'Template actualizado' : 'Template creado', 'success');
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const addExercise = (exerciseId: string) => {
    setTemplateExercises(prev => [
      ...prev,
      {
        exerciseId,
        sets: 3,
        targetReps: "8-12",
        targetRPE: 8,
        restTimer: 120
      }
    ]);
    setShowExercisePicker(false);
  };

  const removeExercise = (index: number) => {
    setTemplateExercises(prev => prev.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof TemplateExercise, value: any) => {
    setTemplateExercises(prev => prev.map((ex, i) => i === index ? { ...ex, [field]: value } : ex));
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onClose} className="flex items-center gap-2 text-text-muted hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <h1 className="text-2xl font-bold text-white">
          {editId ? 'Edit Template' : 'Create Template'}
        </h1>
        <Button
          onClick={handleSave}
          isLoading={isSaving}
          leftIcon={<Save className="w-5 h-5" />}
        >
          Save
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Settings Column */}
        <div className="space-y-6">
          <div className="bg-background-card rounded-2xl border border-gray-800 p-6 space-y-4">
             <div>
               <label className="block text-xs font-bold text-text-muted uppercase mb-1">Template Name</label>
               <input 
                 type="text" 
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 className="w-full bg-background border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
                 placeholder="e.g., Heavy Chest Day"
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-text-muted uppercase mb-1">Description</label>
               <textarea 
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 className="w-full bg-background border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none h-24 resize-none"
                 placeholder="Briefly describe the goal..."
               />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-text-muted uppercase mb-1">Duration</label>
                   <select 
                      value={duration} 
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-background border border-gray-700 rounded-lg px-2 py-2 text-white text-sm"
                   >
                     <option>30 Mins</option>
                     <option>45 Mins</option>
                     <option>60 Mins</option>
                     <option>75 Mins</option>
                     <option>90 Mins</option>
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-text-muted uppercase mb-1">Difficulty</label>
                   <select 
                      value={difficulty} 
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full bg-background border border-gray-700 rounded-lg px-2 py-2 text-white text-sm"
                   >
                     <option>Beginner</option>
                     <option>Intermediate</option>
                     <option>Advanced</option>
                   </select>
                </div>
             </div>
          </div>
        </div>

        {/* Exercises Column */}
        <div className="md:col-span-2 space-y-6">
           <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Exercises</h2>
              <button 
                onClick={() => setShowExercisePicker(!showExercisePicker)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Exercise
              </button>
           </div>
           
           {/* Simple Exercise Picker Dropdown */}
           {showExercisePicker && (
             <div className="bg-background-card border border-gray-700 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 mb-4">
               <input type="text" placeholder="Search exercises..." className="w-full bg-black/20 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white mb-3" />
               <div className="max-h-48 overflow-y-auto space-y-1">
                 {allExercises.map(ex => (
                   <button 
                      key={ex.id}
                      onClick={() => addExercise(ex.id)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded-lg text-sm text-gray-300 hover:text-white flex items-center justify-between group"
                   >
                     <span>{ex.name}</span>
                     <span className="text-xs text-text-muted group-hover:text-primary">{ex.muscleGroup[0]}</span>
                   </button>
                 ))}
               </div>
             </div>
           )}

           <div className="space-y-4">
             {templateExercises.length === 0 && !showExercisePicker && (
               <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-2xl">
                 <Dumbbell className="w-10 h-10 text-gray-700 mx-auto mb-2" />
                 <p className="text-text-muted">No exercises added yet.</p>
               </div>
             )}

             {templateExercises.map((te, idx) => {
               const exerciseInfo = allExercises.find(e => e.id === te.exerciseId);
               return (
                 <div key={idx} className="bg-background-card border border-gray-800 rounded-xl p-4 relative group hover:border-gray-600 transition-colors">
                    <button 
                      onClick={() => removeExercise(idx)}
                      className="absolute top-4 right-4 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center font-bold text-gray-500 text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{exerciseInfo?.name || 'Unknown Exercise'}</h3>
                        <p className="text-xs text-text-muted">{exerciseInfo?.muscleGroup.join(', ')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                       <div>
                          <label className="text-[10px] text-text-muted uppercase font-bold">Sets</label>
                          <input 
                            type="number" 
                            value={te.sets}
                            onChange={(e) => updateExercise(idx, 'sets', parseInt(e.target.value))}
                            className="w-full bg-black/20 border border-gray-700 rounded-lg px-2 py-1 text-white text-center font-bold"
                          />
                       </div>
                       <div>
                          <label className="text-[10px] text-text-muted uppercase font-bold">Target Reps</label>
                          <input 
                            type="text" 
                            value={te.targetReps}
                            onChange={(e) => updateExercise(idx, 'targetReps', e.target.value)}
                            className="w-full bg-black/20 border border-gray-700 rounded-lg px-2 py-1 text-white text-center font-bold"
                          />
                       </div>
                       <div>
                          <label className="text-[10px] text-text-muted uppercase font-bold">RPE</label>
                          <input 
                            type="number" 
                            step="0.5"
                            value={te.targetRPE}
                            onChange={(e) => updateExercise(idx, 'targetRPE', parseFloat(e.target.value))}
                            className="w-full bg-black/20 border border-gray-700 rounded-lg px-2 py-1 text-white text-center font-bold"
                          />
                       </div>
                       <div>
                          <label className="text-[10px] text-text-muted uppercase font-bold">Rest (s)</label>
                          <input 
                            type="number" 
                            step="30"
                            value={te.restTimer}
                            onChange={(e) => updateExercise(idx, 'restTimer', parseInt(e.target.value))}
                            className="w-full bg-black/20 border border-gray-700 rounded-lg px-2 py-1 text-white text-center font-bold"
                          />
                       </div>
                    </div>
                 </div>
               );
             })}
           </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;