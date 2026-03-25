import React, { useState } from 'react';
import {
  Calendar, Dumbbell, Target, Clock, X, CheckCircle,
  ChevronRight, Zap, BarChart3, BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import { exerciseBlueprints } from '../data/exerciseBlueprints';
import { PRESET_PROGRAMS, PROGRAM_WEEKDAY_MAP, PresetProgram } from '../data/presetPrograms';
import { WorkoutTemplate } from '../types';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const LEVEL_COLOR: Record<string, string> = {
  Beginner:     'bg-green-500/15 text-green-400 border-green-500/30',
  Intermediate: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  Advanced:     'bg-red-500/15 text-red-400 border-red-500/30',
};

const LEVEL_LABEL: Record<string, string> = {
  Beginner:     'Principiante',
  Intermediate: 'Intermedio',
  Advanced:     'Avanzado',
};

const GOAL_COLOR: Record<string, string> = {
  Strength:    'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Hypertrophy: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'Fat Loss':  'bg-orange-500/15 text-orange-400 border-orange-500/30',
  Endurance:   'bg-teal-500/15 text-teal-400 border-teal-500/30',
};

const GOAL_LABEL: Record<string, string> = {
  Strength:    'Fuerza',
  Hypertrophy: 'Hipertrofia',
  'Fat Loss':  'Pérdida de grasa',
  Endurance:   'Resistencia',
};

function getExerciseName(id: string): string {
  return exerciseBlueprints.find(e => e.id === id)?.name ?? id;
}

// ─── Program Card ─────────────────────────────────────────────────────────────

interface ProgramCardProps {
  program: PresetProgram;
  onSelect: () => void;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program, onSelect }) => (
  <button
    onClick={onSelect}
    className="group relative text-left bg-background-card border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
  >
    {/* Gradient header */}
    <div className={`bg-gradient-to-br ${program.accentFrom} ${program.accentTo} p-6`}>
      <div className="flex items-start justify-between">
        <span className="text-4xl">{program.icon}</span>
        <span className="text-xs font-black text-white/60 uppercase tracking-widest">
          {program.shortName}
        </span>
      </div>
      <h3 className="text-xl font-black text-white mt-3 leading-tight">{program.name}</h3>
      <p className="text-white/70 text-sm mt-1">{program.tagline}</p>
    </div>

    {/* Stats */}
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-gray-300">{program.daysPerWeek} días/semana</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-gray-300">{program.recommendedWeeks} semanas</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${LEVEL_COLOR[program.level]}`}>
          {LEVEL_LABEL[program.level]}
        </span>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${GOAL_COLOR[program.goal]}`}>
          {GOAL_LABEL[program.goal]}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-gray-500">{program.days.length} sesiones</span>
        <span className="flex items-center gap-1 text-primary text-sm font-bold group-hover:gap-2 transition-all">
          Ver programa <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  </button>
);

// ─── Program Detail Modal ──────────────────────────────────────────────────────

interface ProgramDetailProps {
  program: PresetProgram;
  onClose: () => void;
}

const ProgramDetail: React.FC<ProgramDetailProps> = ({ program, onClose }) => {
  const { saveTemplate, setWeeklySchedule } = useApp();
  const { showToast } = useToast();
  const [adopting, setAdopting] = useState(false);
  const [adopted, setAdopted] = useState(false);

  const handleAdopt = async () => {
    setAdopting(true);
    try {
      const weekdays = PROGRAM_WEEKDAY_MAP[program.daysPerWeek] ?? [1];
      const newSchedule: Record<number, string> = {};

      for (let i = 0; i < program.days.length; i++) {
        const day = program.days[i];
        const weekday = weekdays[i % weekdays.length];

        const template: WorkoutTemplate = {
          id: crypto.randomUUID(),
          name: `${program.shortName} — ${day.name}`,
          description: `${program.name} · Día ${i + 1}`,
          muscleFocus: day.muscleFocus,
          exercises: day.exercises.map(ex => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets,
            targetReps: ex.targetReps,
            targetRPE: ex.targetRPE,
            restTimer: ex.restTimer,
          })),
          duration: `${Math.round(day.exercises.reduce((acc, e) => acc + e.sets * (e.restTimer + 60), 0) / 60)} min`,
          difficulty: program.level,
        };

        saveTemplate(template);
        newSchedule[weekday] = template.id;
      }

      setWeeklySchedule(newSchedule);
      setAdopted(true);
      showToast(`✅ ${program.name} adoptado. Tu agenda ha sido actualizada.`, 'success');
    } catch {
      showToast('Error al adoptar el programa', 'error');
    } finally {
      setAdopting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-2xl bg-background-card border border-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className={`bg-gradient-to-br ${program.accentFrom} ${program.accentTo} p-6 shrink-0`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{program.icon}</span>
              <div>
                <h2 className="text-2xl font-black text-white leading-tight">{program.name}</h2>
                <p className="text-white/70 text-sm mt-0.5">{program.tagline}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/20 text-white/70 hover:text-white hover:bg-black/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {[
              { icon: Calendar, label: 'Días/sem', value: String(program.daysPerWeek) },
              { icon: Clock,    label: 'Semanas',  value: String(program.recommendedWeeks) },
              { icon: BarChart3,label: 'Nivel',    value: LEVEL_LABEL[program.level] },
              { icon: Target,   label: 'Objetivo', value: GOAL_LABEL[program.goal] },
            ].map(stat => (
              <div key={stat.label} className="bg-black/20 rounded-xl p-3 text-center">
                <stat.icon className="w-4 h-4 text-white/60 mx-auto mb-1" />
                <p className="text-white font-black text-xs leading-tight">{stat.value}</p>
                <p className="text-white/50 text-[10px] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Description */}
          <div className="flex gap-3">
            <BookOpen className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
            <p className="text-gray-300 text-sm leading-relaxed">{program.description}</p>
          </div>

          {/* Schedule preview */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Asignación de días
            </p>
            <div className="flex gap-2 flex-wrap">
              {(PROGRAM_WEEKDAY_MAP[program.daysPerWeek] ?? [1]).map((wd, i) => (
                <div
                  key={i}
                  className="bg-gray-800/60 border border-gray-700/50 rounded-xl px-3 py-2 text-center min-w-[56px]"
                >
                  <p className="text-white text-xs font-bold">{DAY_NAMES[wd]}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5 truncate max-w-[64px]">
                    {program.days[i]?.name ?? '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Day-by-day exercise list */}
          <div className="space-y-4">
            {program.days.map((day, di) => (
              <div key={di} className="bg-gray-900/40 border border-gray-800/50 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/40">
                  <Dumbbell className="w-4 h-4 text-gray-400" />
                  <h4 className="text-white font-bold text-sm">{day.name}</h4>
                  <div className="flex gap-1.5 ml-auto">
                    {day.muscleFocus.map(m => (
                      <span key={m} className="text-[10px] text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded-full">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <ul className="divide-y divide-gray-800/50">
                  {day.exercises.map((ex, ei) => (
                    <li key={ei} className="flex items-center justify-between px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-gray-800 text-gray-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {ei + 1}
                        </span>
                        <span className="text-gray-200 text-sm">{getExerciseName(ex.exerciseId)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="font-bold text-gray-400">{ex.sets}×{ex.targetReps}</span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" /> RPE {ex.targetRPE}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Adopt button */}
        <div className="p-5 border-t border-gray-800 shrink-0">
          {adopted ? (
            <div className="flex items-center justify-center gap-2 py-3 text-green-400 font-bold">
              <CheckCircle className="w-5 h-5" />
              Programa adoptado con éxito
            </div>
          ) : (
            <button
              onClick={handleAdopt}
              disabled={adopting}
              className={`w-full py-4 rounded-2xl font-black text-white text-base transition-all
                bg-gradient-to-r ${program.accentFrom} ${program.accentTo}
                hover:opacity-90 active:scale-[0.98] disabled:opacity-50`}
            >
              {adopting ? 'Aplicando programa…' : `Adoptar ${program.name}`}
            </button>
          )}
          <p className="text-center text-xs text-gray-600 mt-2">
            Esto creará las plantillas y actualizará tu agenda semanal
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Programs Page ────────────────────────────────────────────────────────────

const Programs: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<PresetProgram | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">Programas</h1>
        <p className="text-gray-400 mt-1">
          Programas preconfigurados listos para empezar. Selecciona uno y se asignará
          automáticamente a tu agenda semanal.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-3">
        <BookOpen className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-300 text-sm font-bold">¿Cómo funciona?</p>
          <p className="text-blue-400/70 text-xs mt-1">
            Al adoptar un programa se crean automáticamente las plantillas de entrenamiento
            y se asignan a los días de la semana recomendados. Puedes editarlas después desde Plantillas.
          </p>
        </div>
      </div>

      {/* Program grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {PRESET_PROGRAMS.map(program => (
          <ProgramCard
            key={program.id}
            program={program}
            onSelect={() => setSelectedProgram(program)}
          />
        ))}
      </div>

      {/* Detail Modal */}
      {selectedProgram && (
        <ProgramDetail
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
        />
      )}
    </div>
  );
};

export default Programs;
