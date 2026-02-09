import React from 'react';
import { Plus, Play, Edit2, Trash2, Clock, Dumbbell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge, getDifficultyVariant } from '../components/ui/Badge';

interface TemplatesProps {
  onCreate: () => void;
  onEdit: (id: string) => void;
  onStart: () => void;
}

const Templates: React.FC<TemplatesProps> = ({ onCreate, onEdit, onStart }) => {
  const { templates, startSessionFromTemplate, deleteTemplate } = useApp();
  const { toast } = useToast();

  const handleStart = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      startSessionFromTemplate(template);
      toast('Sesion iniciada', 'success');
      onStart();
    }
  };

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    toast('Template eliminado', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white">Workout Templates</h1>
          <p className="text-text-muted mt-1">Save your favorite routines and reuse them anytime.</p>
        </div>
        <Button onClick={onCreate} leftIcon={<Plus className="w-5 h-5" />}>
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-background-card rounded-2xl border border-dashed border-gray-800">
             <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
               <ClipboardIcon className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">No templates found</h3>
             <p className="text-text-muted mb-6">Create your first custom routine to get started.</p>
             <button 
                onClick={onCreate}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all"
             >
               Create New
             </button>
          </div>
        ) : (
          templates.map(template => (
            <Card key={template.id} hover className="group flex flex-col h-full">
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={getDifficultyVariant(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(template.id)}
                      className="p-2 text-text-muted hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this template?')) {
                          handleDelete(template.id);
                        }
                      }}
                      className="p-2 text-text-muted hover:text-red-500 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{template.name}</h3>
                <p className="text-sm text-text-muted line-clamp-2 min-h-[40px]">
                  {template.description || "No description provided."}
                </p>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{template.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  <span>{template.exercises.length} Exercises</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                   {template.muscleFocus.slice(0, 3).map(muscle => (
                     <span key={muscle} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700">
                       {muscle}
                     </span>
                   ))}
                   {template.muscleFocus.length > 3 && (
                     <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700">
                       +{template.muscleFocus.length - 3}
                     </span>
                   )}
                </div>
              </div>

              <Button
                onClick={() => handleStart(template.id)}
                variant="ghost"
                fullWidth
                leftIcon={<Play className="w-4 h-4 fill-current" />}
                className="bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 hover:border-primary"
              >
                Start Workout
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

const ClipboardIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/></svg>
);

export default Templates;