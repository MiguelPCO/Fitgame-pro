import React, { useState, useMemo } from 'react';
import { CheckCircle2, ChevronRight, ChevronLeft, Dumbbell, Activity, Calendar, Target, Sparkles, CalendarDays, Rocket, Coffee, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfile, WorkoutTemplate, WeeklySchedule } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { generateTemplates, suggestSchedule } from '../lib/templateGenerator';

interface OnboardingProps {
  onComplete: () => void;
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'] as const;

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { updateUser, saveTemplate, setWeeklySchedule } = useApp();
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    goal: 'Hypertrophy',
    daysPerWeek: 4,
    minutesPerSession: 60,
    equipment: ['Gym Complete'],
    experienceLevel: 'Intermediate',
  });

  const [generatedTemplates, setGeneratedTemplates] = useState<WorkoutTemplate[]>([]);
  const [schedule, setSchedule] = useState<WeeklySchedule>({});
  const [isFinishing, setIsFinishing] = useState(false);

  const handleNext = () => {
    if (step === 4) {
      // Generate templates on transition from step 4 to 5
      const templates = generateTemplates({
        goal: formData.goal || 'Hypertrophy',
        daysPerWeek: formData.daysPerWeek || 4,
        equipment: formData.equipment || ['Gym Complete'],
        experienceLevel: formData.experienceLevel || 'Intermediate',
      });
      setGeneratedTemplates(templates);
      const suggested = suggestSchedule(templates, formData.daysPerWeek || 4);
      setSchedule(suggested);
    }

    if (step < totalSteps) {
      setStep(prev => prev + 1);
    } else {
      // Final step: save everything
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const finishOnboarding = async () => {
    setIsFinishing(true);
    try {
      // Save all generated templates
      for (const template of generatedTemplates) {
        await saveTemplate(template);
      }

      // Save schedule
      await setWeeklySchedule(schedule);

      // Save user preferences + mark onboarding complete
      await updateUser({
        ...formData,
        onboardingCompleted: true,
      });

      onComplete();
    } finally {
      setIsFinishing(false);
    }
  };

  const updateData = (key: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleEquipment = (item: string) => {
    const current = formData.equipment || [];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    updateData('equipment', updated);
  };

  const toggleScheduleDay = (day: number, templateId: string | null) => {
    setSchedule(prev => {
      const next = { ...prev };
      if (templateId) {
        next[day as keyof WeeklySchedule] = templateId;
      } else {
        delete next[day as keyof WeeklySchedule];
      }
      return next;
    });
  };

  const assignedDays = Object.keys(schedule).filter(k => schedule[Number(k) as keyof WeeklySchedule]).length;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">
          <span>Paso {step} de {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      <Card padding="lg" className="rounded-3xl min-h-[500px] flex flex-col">

        {/* STEP 1: GOAL */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300 flex-1">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Cual es tu objetivo?</h2>
            <p className="text-text-muted mb-8">Adaptaremos volumen e intensidad en base a esto.</p>

            <div className="grid grid-cols-1 gap-4">
              {(['Hypertrophy', 'Strength', 'Fat Loss', 'Endurance'] as const).map((goal) => (
                <label key={goal} className="cursor-pointer group">
                  <input
                    type="radio"
                    name="goal"
                    className="peer sr-only"
                    checked={formData.goal === goal}
                    onChange={() => updateData('goal', goal)}
                  />
                  <div className="p-5 rounded-2xl border border-gray-700 bg-background/50 hover:bg-background hover:border-gray-500 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-1 peer-checked:ring-primary transition-all flex items-center justify-between">
                    <span className="font-bold text-lg text-white group-hover:text-primary transition-colors">{goal}</span>
                    <div className="w-5 h-5 rounded-full border border-gray-600 peer-checked:border-primary peer-checked:bg-primary"></div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: AVAILABILITY */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300 flex-1">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-6">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Disponibilidad</h2>
            <p className="text-text-muted mb-8">Se realista. La consistencia gana a la intensidad.</p>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-white font-bold text-lg">Dias por semana</span>
                  <span className="text-4xl font-black text-primary">{formData.daysPerWeek}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="6"
                  value={formData.daysPerWeek}
                  onChange={(e) => updateData('daysPerWeek', parseInt(e.target.value))}
                  className="w-full accent-primary h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-text-muted font-bold">
                  <span>2 Dias</span>
                  <span>6 Dias</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-white font-bold text-lg">Minutos por sesion</span>
                  <span className="text-4xl font-black text-blue-500">{formData.minutesPerSession}</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="15"
                  value={formData.minutesPerSession}
                  onChange={(e) => updateData('minutesPerSession', parseInt(e.target.value))}
                  className="w-full accent-blue-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-text-muted font-bold">
                  <span>30 Min</span>
                  <span>120 Min</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: EQUIPMENT */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300 flex-1">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 mb-6">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Equipamiento</h2>
            <p className="text-text-muted mb-8">Selecciona todo lo que aplique.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Gym Complete', 'Dumbbells Only', 'Barbell & Rack', 'Bodyweight', 'Resistance Bands', 'Home Gym'].map((item) => (
                <label key={item} className="cursor-pointer group">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={formData.equipment?.includes(item)}
                    onChange={() => toggleEquipment(item)}
                  />
                  <div className="p-4 rounded-xl border border-gray-700 bg-background/50 hover:bg-background hover:border-green-500 peer-checked:border-green-500 peer-checked:bg-green-500/10 peer-checked:ring-1 peer-checked:ring-green-500 transition-all">
                    <span className="font-bold text-white group-hover:text-green-500 transition-colors">{item}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: EXPERIENCE */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300 flex-1">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 mb-6">
              <Activity className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Nivel de Experiencia</h2>
            <p className="text-text-muted mb-8">Esto determina tu volumen y complejidad inicial.</p>

            <div className="space-y-4">
              {[
                { label: 'Principiante', desc: '0-12 meses. Aprendiendo tecnica.', level: 'Beginner' as const },
                { label: 'Intermedio', desc: '1-3 anos. Necesita progresion estructurada.', level: 'Intermediate' as const },
                { label: 'Avanzado', desc: '3+ anos. Programacion de elite necesaria.', level: 'Advanced' as const }
              ].map((item) => (
                <label key={item.label} className="cursor-pointer group block">
                  <input
                    type="radio"
                    name="experience"
                    className="peer sr-only"
                    checked={formData.experienceLevel === item.level}
                    onChange={() => updateData('experienceLevel', item.level)}
                  />
                  <div className="p-5 rounded-2xl border border-gray-700 bg-background/50 hover:bg-background hover:border-yellow-500 peer-checked:border-yellow-500 peer-checked:bg-yellow-500/5 peer-checked:ring-1 peer-checked:ring-yellow-500 transition-all">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-lg text-white group-hover:text-yellow-500 transition-colors">{item.label}</span>
                    </div>
                    <p className="text-sm text-text-muted">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: GENERATED PLAN PREVIEW */}
        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300 flex-1">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Tu Plan de Entrenamiento</h2>
            <p className="text-text-muted mb-6">
              Hemos generado {generatedTemplates.length} rutinas basadas en tus preferencias.
            </p>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
              {generatedTemplates.map((template, idx) => (
                <div
                  key={template.id}
                  className="p-4 rounded-xl border border-gray-700 bg-background/50 hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-bold">{template.name}</h3>
                    <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-400 rounded-full font-bold">
                      {template.exercises.length} ejercicios
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {template.muscleFocus.map(m => (
                      <span key={m} className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full text-gray-300 font-medium">{m}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                    <span>{template.duration}</span>
                    <span>{template.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: SCHEDULE */}
        {step === 6 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300 flex-1">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-500 mb-6">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Programa Semanal</h2>
            <p className="text-text-muted mb-6">
              Hemos sugerido un horario. Puedes ajustarlo como quieras.
            </p>

            <div className="grid grid-cols-7 gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map(day => {
                const templateId = schedule[day as keyof WeeklySchedule];
                const template = templateId ? generatedTemplates.find(t => t.id === templateId) : null;

                return (
                  <div key={day} className="text-center">
                    <p className="text-xs font-bold text-text-muted mb-2">{DAY_NAMES[day]}</p>
                    <div className={`p-2 rounded-xl border min-h-[80px] flex flex-col items-center justify-center transition-all ${
                      template ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-gray-700 bg-background/30'
                    }`}>
                      {template ? (
                        <>
                          <Dumbbell className="w-4 h-4 text-cyan-500 mb-1" />
                          <p className="text-[10px] text-white font-bold leading-tight text-center">{template.name}</p>
                          <button
                            className="mt-1 text-[10px] text-red-400 hover:text-red-300"
                            onClick={() => toggleScheduleDay(day, null)}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <>
                          <Coffee className="w-4 h-4 text-gray-600 mb-1" />
                          <p className="text-[10px] text-gray-500">Rest</p>
                        </>
                      )}
                    </div>
                    {/* Dropdown to assign */}
                    <select
                      className="mt-1 w-full text-[10px] bg-background-card border border-gray-700 rounded text-gray-300 p-1"
                      value={templateId || ''}
                      onChange={(e) => toggleScheduleDay(day, e.target.value || null)}
                    >
                      <option value="">Descanso</option>
                      {generatedTemplates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            <p className="text-sm text-text-muted mt-4 text-center">
              {assignedDays} dias activos / {7 - assignedDays} dias de descanso
            </p>
          </div>
        )}

        {/* STEP 7: SUMMARY / CONFIRMATION */}
        {step === 7 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300 flex-1">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 mb-6">
              <Rocket className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Todo Listo!</h2>
            <p className="text-text-muted mb-6">Revisa tu plan antes de comenzar.</p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-background/50 border border-gray-700">
                <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-2">Objetivo</p>
                <p className="text-white font-bold text-lg">{formData.goal}</p>
              </div>

              <div className="p-4 rounded-xl bg-background/50 border border-gray-700">
                <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-2">Disponibilidad</p>
                <p className="text-white font-bold">{formData.daysPerWeek} dias/semana · {formData.minutesPerSession} min/sesion</p>
              </div>

              <div className="p-4 rounded-xl bg-background/50 border border-gray-700">
                <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-2">Rutinas Generadas</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {generatedTemplates.map(t => (
                    <span key={t.id} className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-bold">{t.name}</span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-background/50 border border-gray-700">
                <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-2">Programa Semanal</p>
                <div className="flex gap-2 mt-1">
                  {[0, 1, 2, 3, 4, 5, 6].map(day => {
                    const hasTemplate = !!schedule[day as keyof WeeklySchedule];
                    return (
                      <div key={day} className={`text-center flex-1 p-2 rounded-lg ${hasTemplate ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-800/50'}`}>
                        <p className="text-[10px] font-bold text-text-muted">{DAY_NAMES[day]}</p>
                        <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${hasTemplate ? 'bg-green-500' : 'bg-gray-600'}`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-8 mt-auto border-t border-gray-800/50 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handleBack}
            leftIcon={<ChevronLeft className="w-5 h-5" />}
            className={step === 1 ? 'invisible' : ''}
          >
            Atras
          </Button>

          <Button
            onClick={handleNext}
            size="lg"
            isLoading={isFinishing}
            rightIcon={step === totalSteps ? <CheckCircle2 className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          >
            {step === totalSteps ? 'Comenzar!' : 'Siguiente'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;
