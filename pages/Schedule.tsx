import React, { useState, useEffect } from 'react';
import { Calendar, Save, X, AlertTriangle, Dumbbell, Coffee } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { WeeklySchedule } from '../types';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'] as const;
const DAY_SHORTS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'] as const;

const DAY_GRADIENTS = [
  'from-rose-500/20 to-red-600/10',
  'from-blue-500/20 to-indigo-600/10',
  'from-emerald-500/20 to-green-600/10',
  'from-purple-500/20 to-violet-600/10',
  'from-amber-500/20 to-yellow-600/10',
  'from-cyan-500/20 to-teal-600/10',
  'from-pink-500/20 to-fuchsia-600/10',
];

const Schedule: React.FC = () => {
  const { templates, weeklySchedule, setWeeklySchedule, user } = useApp();
  const [draft, setDraft] = useState<WeeklySchedule>({ ...weeklySchedule });
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft({ ...weeklySchedule });
  }, [weeklySchedule]);

  const assignedDays = Object.keys(draft).filter(k => draft[Number(k) as keyof WeeklySchedule]).length;
  const daysTarget = user?.daysPerWeek || 4;
  const mismatch = assignedDays !== daysTarget;

  const handleAssign = (day: number, templateId: string | null) => {
    setDraft(prev => {
      const next = { ...prev };
      if (templateId) {
        next[day as keyof WeeklySchedule] = templateId;
      } else {
        delete next[day as keyof WeeklySchedule];
      }
      return next;
    });
    setOpenDropdown(null);
    setSaved(false);
  };

  const handleSave = () => {
    setWeeklySchedule(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(weeklySchedule);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Calendar className="w-7 h-7 text-primary" />
            </div>
            Programa Semanal
          </h1>
          <p className="text-text-muted mt-1">Asigna rutinas a cada dia de la semana</p>
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          leftIcon={saved ? undefined : <Save className="w-4 h-4" />}
          variant={saved ? 'success' : 'primary'}
        >
          {saved ? 'Guardado!' : 'Guardar Programa'}
        </Button>
      </div>

      {/* Warning */}
      {mismatch && (
        <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          <p className="text-sm text-yellow-200">
            Tienes <strong>{assignedDays}</strong> dias asignados pero tu objetivo es <strong>{daysTarget}</strong> dias por semana.
          </p>
        </div>
      )}

      {/* Day Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {[0, 1, 2, 3, 4, 5, 6].map(day => {
          const templateId = draft[day as keyof WeeklySchedule];
          const template = templateId ? templates.find(t => t.id === templateId) : null;
          const isOpen = openDropdown === day;

          return (
            <div key={day} className="relative">
              <Card
                className={`min-h-[180px] flex flex-col transition-all cursor-pointer hover:border-gray-600 ${
                  template ? `bg-gradient-to-b ${DAY_GRADIENTS[day]}` : ''
                }`}
                onClick={() => setOpenDropdown(isOpen ? null : day)}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider hidden lg:block">{DAY_SHORTS[day]}</p>
                    <p className="text-sm font-bold text-white lg:hidden">{DAY_NAMES[day]}</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${template ? 'bg-green-500 shadow-[0_0_6px_#22c55e]' : 'bg-gray-600'}`} />
                </div>

                {/* Content */}
                {template ? (
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <Dumbbell className="w-4 h-4 text-primary" />
                      <p className="text-white font-bold text-sm truncate">{template.name}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {template.muscleFocus.slice(0, 3).map(m => (
                        <span key={m} className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full text-gray-300 font-medium">{m}</span>
                      ))}
                    </div>
                    <button
                      className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1 self-start"
                      onClick={(e) => { e.stopPropagation(); handleAssign(day, null); }}
                    >
                      <X className="w-3 h-3" /> Quitar
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <Coffee className="w-6 h-6 text-gray-600 mb-1" />
                    <p className="text-sm text-gray-500 font-medium">Descanso</p>
                  </div>
                )}
              </Card>

              {/* Dropdown */}
              {isOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                  <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-background-card border border-gray-700 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                    <button
                      className="w-full px-4 py-3 text-left text-sm text-gray-400 hover:bg-gray-800 flex items-center gap-2"
                      onClick={(e) => { e.stopPropagation(); handleAssign(day, null); }}
                    >
                      <Coffee className="w-4 h-4" /> Descanso
                    </button>
                    {templates.map(t => (
                      <button
                        key={t.id}
                        className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-800 flex items-center gap-2 ${
                          templateId === t.id ? 'text-primary bg-primary/5' : 'text-white'
                        }`}
                        onClick={(e) => { e.stopPropagation(); handleAssign(day, t.id); }}
                      >
                        <Dumbbell className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                    {templates.length === 0 && (
                      <p className="px-4 py-3 text-sm text-gray-500">No hay plantillas creadas</p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-3">Resumen</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-black text-primary">{assignedDays}</p>
            <p className="text-xs text-text-muted font-medium">Dias Activos</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-gray-400">{7 - assignedDays}</p>
            <p className="text-xs text-text-muted font-medium">Dias Descanso</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-blue-500">{new Set(Object.values(draft)).size}</p>
            <p className="text-xs text-text-muted font-medium">Rutinas Unicas</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-green-500">{daysTarget}</p>
            <p className="text-xs text-text-muted font-medium">Objetivo/Semana</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Schedule;
