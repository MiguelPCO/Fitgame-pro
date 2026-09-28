import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, ChevronLeft, Dumbbell, Activity, Calendar, Target, Sparkles, CalendarDays, Rocket, Coffee, X, Footprints, HeartPulse, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserProfile, WorkoutTemplate, WeeklySchedule, Discipline, Goal, ExperienceLevel } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { generateTemplates, generateRunTemplates, splitDaysByDiscipline, suggestSchedule } from '../lib/templateGenerator';

interface OnboardingProps {
  onComplete: () => void;
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'] as const;

/** Zonas que el usuario puede marcar. Se guardan, no filtran el plan. */
const INJURY_AREAS = ['Hombro', 'Codo', 'Muneca', 'Espalda', 'Cadera', 'Rodilla', 'Tobillo'] as const;

type StepId =
  | 'discipline'
  | 'goal'
  | 'availability'
  | 'equipment'
  | 'experience'
  | 'injuries'
  | 'plan'
  | 'schedule'
  | 'summary';

/** El paso de equipamiento no tiene sentido si solo se corre. */
const stepsFor = (discipline: Discipline): StepId[] =>
  discipline === 'running'
    ? ['discipline', 'goal', 'availability', 'experience', 'injuries', 'plan', 'schedule', 'summary']
    : ['discipline', 'goal', 'availability', 'equipment', 'experience', 'injuries', 'plan', 'schedule', 'summary'];

const DISCIPLINES: { value: Discipline; label: string; desc: string; icon: typeof Dumbbell }[] = [
  { value: 'gym', label: 'Gimnasio', desc: 'Fuerza e hipertrofia', icon: Dumbbell },
  { value: 'running', label: 'Carrera', desc: 'Salir a correr', icon: Footprints },
  { value: 'both', label: 'Las dos', desc: 'Fuerza y carrera en la misma semana', icon: HeartPulse },
];

/** Micro-reacciones: una linea que responde a lo que acabas de elegir. */
const DISCIPLINE_REACTION: Record<Discipline, string> = {
  gym: 'Perfecto. Tu plan girara en torno a la progresion de cargas.',
  running: 'Hecho. Nada de pesas: rodajes, una tirada larga y progresion del 10% semanal.',
  both: 'Buena combinacion. Repartiremos los dias entre pesas y asfalto.',
};

const GOAL_REACTION: Record<Goal, string> = {
  Hypertrophy: 'Volumen alto y rangos medios de repeticiones.',
  Strength: 'Pocas repeticiones, cargas altas y descansos largos.',
  'Fat Loss': 'Descansos cortos para mantener el pulso arriba.',
  Endurance: 'Series largas y poco descanso.',
};

const LEVEL_REACTION: Record<ExperienceLevel, string> = {
  Beginner: 'Empezaremos conservador. La tecnica primero, la carga despues.',
  Intermediate: 'Volumen medio con progresion estructurada.',
  Advanced: 'Volumen e intensidad altos. Vigila la recuperacion.',
};

const daysReaction = (days: number): string => {
  if (days <= 2) return 'Con 2 dias se mantiene, no se progresa rapido. Es un punto de partida honesto.';
  if (days <= 4) return 'Es el punto dulce: suficiente estimulo y tiempo de sobra para recuperar.';
  return 'Mucho volumen. Funciona si duermes y comes bien; si no, acabaras lesionado.';
};

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { updateUser, saveTemplate, setWeeklySchedule } = useApp();
  const [stepIndex, setStepIndex] = useState(0);

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    discipline: 'gym',
    goal: 'Hypertrophy',
    daysPerWeek: 4,
    minutesPerSession: 60,
    equipment: ['Gym Complete'],
    experienceLevel: 'Intermediate',
    injuries: [],
    limitations: '',
  });

  const [generatedTemplates, setGeneratedTemplates] = useState<WorkoutTemplate[]>([]);
  const [schedule, setSchedule] = useState<WeeklySchedule>({});
  const [isFinishing, setIsFinishing] = useState(false);

  const discipline = formData.discipline || 'gym';
  const steps = stepsFor(discipline);
  const totalSteps = steps.length;
  const step = steps[Math.min(stepIndex, totalSteps - 1)];
  const stepNumber = stepIndex + 1;
  const isLastStep = stepIndex === totalSteps - 1;

  const buildPlan = () => {
    const daysPerWeek = formData.daysPerWeek || 4;
    const experienceLevel = formData.experienceLevel || 'Intermediate';
    const { gymDays, runDays } = splitDaysByDiscipline(discipline, daysPerWeek);

    const templates: WorkoutTemplate[] = [];

    if (gymDays > 0) {
      templates.push(
        ...generateTemplates({
          goal: formData.goal || 'Hypertrophy',
          daysPerWeek: gymDays,
          equipment: formData.equipment || ['Gym Complete'],
          experienceLevel,
        })
      );
    }

    if (runDays > 0) {
      templates.push(...generateRunTemplates({ daysPerWeek: runDays, experienceLevel }));
    }

    setGeneratedTemplates(templates);
    setSchedule(suggestSchedule(templates, daysPerWeek));
  };

  const handleNext = () => {
    // El plan se genera justo antes de enseñarlo.
    if (steps[stepIndex + 1] === 'plan') buildPlan();

    if (!isLastStep) {
      setStepIndex((prev) => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex((prev) => prev - 1);
  };

  const finishOnboarding = async () => {
    setIsFinishing(true);
    try {
      for (const template of generatedTemplates) {
        await saveTemplate(template);
      }

      await setWeeklySchedule(schedule);

      await updateUser({
        ...formData,
        onboardingCompleted: true,
      });

      onComplete();
    } finally {
      setIsFinishing(false);
    }
  };

  const updateData = (key: keyof UserProfile, value: UserProfile[keyof UserProfile]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleEquipment = (item: string) => {
    const current = formData.equipment || [];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    updateData('equipment', updated);
  };

  const toggleInjury = (area: string) => {
    const current = formData.injuries || [];
    const updated = current.includes(area)
      ? current.filter(i => i !== area)
      : [...current, area];
    updateData('injuries', updated);
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
  const injuries = formData.injuries || [];

  // Correr no se entrena para "ganar masa": solo se ofrece lo que aplica.
  const goalOptions: Goal[] =
    discipline === 'running'
      ? ['Endurance', 'Fat Loss']
      : ['Hypertrophy', 'Strength', 'Fat Loss', 'Endurance'];

  const Reaction: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="mt-4 text-sm text-primary flex items-start gap-2" role="status">
      <Sparkles className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">
          <span>Paso {stepNumber} de {totalSteps}</span>
          <span>{Math.round((stepNumber / totalSteps) * 100)}%</span>
        </div>
        <div
          className="w-full h-2 bg-gray-800 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={stepNumber}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label="Progreso del onboarding"
        >
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      <Card padding="lg" className="rounded-3xl min-h-[500px] flex flex-col">

        {/* STEP: DISCIPLINE */}
        {step === 'discipline' && (
          <div className="animate-fade-in-up flex-1">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
              <Footprints className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Que entrenas?</h2>
            <p className="text-text-muted mb-8">Esto decide todo lo demas, asi que va primero.</p>

            <div className="grid grid-cols-1 gap-4">
              {DISCIPLINES.map((item) => (
                <label key={item.value} className="cursor-pointer group block">
                  <input
                    type="radio"
                    name="discipline"
                    className="peer sr-only"
                    checked={discipline === item.value}
                    onChange={() => updateData('discipline', item.value)}
                  />
                  <div className="min-h-11 p-5 rounded-2xl border border-divider bg-background/50 hover:bg-background hover:border-gray-500 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-1 peer-checked:ring-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary transition-all flex items-center gap-4">
                    <item.icon className="w-6 h-6 text-primary shrink-0" aria-hidden="true" />
                    <span>
                      <span className="block font-bold text-lg text-white">{item.label}</span>
                      <span className="block text-sm text-text-muted">{item.desc}</span>
                    </span>
                  </div>
                </label>
              ))}
            </div>

            <Reaction>{DISCIPLINE_REACTION[discipline]}</Reaction>
          </div>
        )}

        {/* STEP: GOAL */}
        {step === 'goal' && (
          <div className="animate-fade-in-up flex-1">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Cual es tu objetivo?</h2>
            <p className="text-text-muted mb-8">Adaptaremos volumen e intensidad en base a esto.</p>

            <div className="grid grid-cols-1 gap-4">
              {goalOptions.map((goal) => (
                <label key={goal} className="cursor-pointer group">
                  <input
                    type="radio"
                    name="goal"
                    className="peer sr-only"
                    checked={formData.goal === goal}
                    onChange={() => updateData('goal', goal)}
                  />
                  <div className="min-h-11 p-5 rounded-2xl border border-divider bg-background/50 hover:bg-background hover:border-gray-500 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-1 peer-checked:ring-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary transition-all flex items-center justify-between">
                    <span className="font-bold text-lg text-white group-hover:text-primary transition-colors">{goal}</span>
                    <div className="w-5 h-5 rounded-full border border-gray-600 peer-checked:border-primary peer-checked:bg-primary"></div>
                  </div>
                </label>
              ))}
            </div>

            {formData.goal && <Reaction>{GOAL_REACTION[formData.goal]}</Reaction>}
          </div>
        )}

        {/* STEP: AVAILABILITY */}
        {step === 'availability' && (
          <div className="animate-fade-in-up flex-1">
            <div className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center text-info mb-6">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Disponibilidad</h2>
            <p className="text-text-muted mb-8">Se realista. La consistencia gana a la intensidad.</p>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label htmlFor="days-per-week" className="text-white font-bold text-lg">Dias por semana</label>
                  <span className="text-4xl font-black text-primary">{formData.daysPerWeek}</span>
                </div>
                <input
                  id="days-per-week"
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
                  <label htmlFor="minutes-per-session" className="text-white font-bold text-lg">Minutos por sesion</label>
                  <span className="text-4xl font-black text-info">{formData.minutesPerSession}</span>
                </div>
                <input
                  id="minutes-per-session"
                  type="range"
                  min="30"
                  max="120"
                  step="15"
                  value={formData.minutesPerSession}
                  onChange={(e) => updateData('minutesPerSession', parseInt(e.target.value))}
                  className="w-full accent-info h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-text-muted font-bold">
                  <span>30 Min</span>
                  <span>120 Min</span>
                </div>
              </div>
            </div>

            <Reaction>{daysReaction(formData.daysPerWeek || 4)}</Reaction>
          </div>
        )}

        {/* STEP: EQUIPMENT */}
        {step === 'equipment' && (
          <div className="animate-fade-in-up flex-1">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center text-success mb-6">
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
                  <div className="min-h-11 flex items-center p-4 rounded-xl border border-divider bg-background/50 hover:bg-background hover:border-success peer-checked:border-success peer-checked:bg-success/10 peer-checked:ring-1 peer-checked:ring-success peer-focus-visible:ring-2 peer-focus-visible:ring-primary transition-all">
                    <span className="font-bold text-white group-hover:text-success transition-colors">{item}</span>
                  </div>
                </label>
              ))}
            </div>

            <Reaction>
              {(formData.equipment?.length || 0) > 1
                ? 'Con varias fuentes de carga podemos variar los estimulos cada semana.'
                : 'Suficiente para empezar. Se puede cambiar despues en Ajustes.'}
            </Reaction>
          </div>
        )}

        {/* STEP: EXPERIENCE */}
        {step === 'experience' && (
          <div className="animate-fade-in-up flex-1">
            <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center text-warning mb-6">
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
                  <div className="min-h-11 p-5 rounded-2xl border border-divider bg-background/50 hover:bg-background hover:border-warning peer-checked:border-warning peer-checked:bg-warning/5 peer-checked:ring-1 peer-checked:ring-warning peer-focus-visible:ring-2 peer-focus-visible:ring-primary transition-all">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-lg text-white group-hover:text-warning transition-colors">{item.label}</span>
                    </div>
                    <p className="text-sm text-text-muted">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {formData.experienceLevel && <Reaction>{LEVEL_REACTION[formData.experienceLevel]}</Reaction>}
          </div>
        )}

        {/* STEP: INJURIES */}
        {step === 'injuries' && (
          <div className="animate-fade-in-up flex-1">
            <div className="w-12 h-12 bg-danger/10 rounded-xl flex items-center justify-center text-danger mb-6">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Alguna lesion?</h2>
            <p className="text-text-muted mb-8">
              Marca las zonas con molestias. Si no tienes ninguna, sigue sin marcar nada.
            </p>

            <fieldset>
              <legend className="sr-only">Zonas con molestias o lesion</legend>
              <div className="flex flex-wrap gap-3">
                {INJURY_AREAS.map((area) => {
                  const selected = injuries.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleInjury(area)}
                      aria-pressed={selected}
                      className={`min-h-11 px-5 rounded-full border font-bold transition-colors duration-fast ${
                        selected
                          ? 'border-danger bg-danger/10 text-danger'
                          : 'border-divider bg-background/50 text-text-secondary hover:border-border-input'
                      }`}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-8">
              <label htmlFor="limitations" className="block text-sm font-bold text-white mb-2">
                Algo mas que debamos saber? (opcional)
              </label>
              <textarea
                id="limitations"
                rows={3}
                maxLength={500}
                value={formData.limitations || ''}
                onChange={(e) => updateData('limitations', e.target.value)}
                placeholder="Ej: operado de menisco en 2024, evito sentadilla profunda"
                className="w-full min-h-11 p-3 text-base rounded-xl bg-background border border-border-input text-text-main placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary outline-none transition-colors duration-fast"
              />
            </div>

            <Reaction>
              {injuries.length > 0
                ? `Lo anotamos. Veras el aviso de ${injuries.join(', ').toLowerCase()} junto a tu plan.`
                : 'Perfecto. Puedes anadirlo mas adelante desde Ajustes si aparece algo.'}
            </Reaction>
          </div>
        )}

        {/* STEP: GENERATED PLAN PREVIEW */}
        {step === 'plan' && (
          <div className="animate-fade-in-up flex-1">
            <div className="w-12 h-12 bg-mobility/10 rounded-xl flex items-center justify-center text-mobility mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Tu Plan de Entrenamiento</h2>
            <p className="text-text-muted mb-6">
              Hemos generado {generatedTemplates.length} rutinas basadas en tus preferencias.
            </p>

            {(injuries.length > 0 || formData.limitations) && (
              <div className="mb-6 p-4 rounded-xl border border-danger/30 bg-danger/5">
                <p className="text-xs uppercase tracking-wider font-bold text-danger mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" aria-hidden="true" />
                  Lo que nos has contado
                </p>
                {injuries.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {injuries.map(area => (
                      <span key={area} className="text-xs px-3 py-1 rounded-full bg-danger/10 text-danger font-bold">{area}</span>
                    ))}
                  </div>
                )}
                {formData.limitations && (
                  <p className="text-sm text-text-secondary">{formData.limitations}</p>
                )}
                <p className="text-sm text-text-muted mt-2">
                  Revisa los ejercicios que carguen estas zonas y cambialos si te molestan.
                </p>
              </div>
            )}

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
              {generatedTemplates.map((template) => {
                const isRun = template.muscleFocus.includes('Cardio');
                return (
                  <div
                    key={template.id}
                    className="p-4 rounded-xl border border-divider bg-background/50 hover:border-mobility/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <h3 className="text-white font-bold flex items-center gap-2">
                        {isRun
                          ? <Footprints className="w-4 h-4 text-cardio" aria-hidden="true" />
                          : <Dumbbell className="w-4 h-4 text-strength" aria-hidden="true" />}
                        {template.name}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-mobility/10 text-mobility rounded-full font-bold shrink-0">
                        {isRun ? 'Carrera' : `${template.exercises.length} ejercicios`}
                      </span>
                    </div>
                    {template.description && (
                      <p className="text-sm text-text-muted mb-2">{template.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-text-muted">
                      <span>{template.duration}</span>
                      <span>{template.difficulty}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP: SCHEDULE */}
        {step === 'schedule' && (
          <div className="animate-fade-in-up flex-1">
            <div className="w-12 h-12 bg-cardio/10 rounded-xl flex items-center justify-center text-cardio mb-6">
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
                const isRun = !!template?.muscleFocus.includes('Cardio');

                return (
                  <div key={day} className="text-center">
                    <p className="text-xs font-bold text-text-muted mb-2">{DAY_NAMES[day]}</p>
                    <div className={`p-2 rounded-xl border min-h-[80px] flex flex-col items-center justify-center transition-all ${
                      template ? 'border-cardio/30 bg-cardio/5' : 'border-divider bg-background/30'
                    }`}>
                      {template ? (
                        <>
                          {isRun
                            ? <Footprints className="w-4 h-4 text-cardio mb-1" aria-hidden="true" />
                            : <Dumbbell className="w-4 h-4 text-strength mb-1" aria-hidden="true" />}
                          <p className="text-2xs text-white font-bold leading-tight text-center">{template.name}</p>
                          <button
                            className="mt-1 min-w-11 min-h-11 flex items-center justify-center text-danger hover:text-danger/80"
                            aria-label={`Quitar ${template.name} del ${DAY_NAMES[day]}`}
                            onClick={() => toggleScheduleDay(day, null)}
                          >
                            <X className="w-3 h-3" aria-hidden="true" />
                          </button>
                        </>
                      ) : (
                        <>
                          <Coffee className="w-4 h-4 text-text-muted mb-1" aria-hidden="true" />
                          <p className="text-2xs text-text-muted">Rest</p>
                        </>
                      )}
                    </div>
                    {/* Dropdown to assign */}
                    <label className="sr-only" htmlFor={`day-${day}`}>Sesion del {DAY_NAMES[day]}</label>
                    <select
                      id={`day-${day}`}
                      className="mt-1 w-full min-h-11 text-2xs bg-background-card border border-border-input rounded text-text-secondary p-1"
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

        {/* STEP: SUMMARY / CONFIRMATION */}
        {step === 'summary' && (
          <div className="animate-fade-in-up flex-1">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center text-success mb-6">
              <Rocket className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Todo Listo!</h2>
            <p className="text-text-muted mb-6">Revisa tu plan antes de comenzar.</p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-background/50 border border-divider">
                <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-2">Disciplina</p>
                <p className="text-white font-bold text-lg">
                  {DISCIPLINES.find(d => d.value === discipline)?.label}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-background/50 border border-divider">
                <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-2">Objetivo</p>
                <p className="text-white font-bold text-lg">{formData.goal}</p>
              </div>

              <div className="p-4 rounded-xl bg-background/50 border border-divider">
                <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-2">Disponibilidad</p>
                <p className="text-white font-bold">{formData.daysPerWeek} dias/semana · {formData.minutesPerSession} min/sesion</p>
              </div>

              {(injuries.length > 0 || formData.limitations) && (
                <div className="p-4 rounded-xl bg-background/50 border border-divider">
                  <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-2">Lesiones</p>
                  <div className="flex flex-wrap gap-2">
                    {injuries.map(area => (
                      <span key={area} className="text-xs px-3 py-1 bg-danger/10 text-danger rounded-full font-bold">{area}</span>
                    ))}
                  </div>
                  {formData.limitations && (
                    <p className="text-sm text-text-secondary mt-2">{formData.limitations}</p>
                  )}
                </div>
              )}

              <div className="p-4 rounded-xl bg-background/50 border border-divider">
                <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-2">Rutinas Generadas</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {generatedTemplates.map(t => (
                    <span key={t.id} className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-bold">{t.name}</span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-background/50 border border-divider">
                <p className="text-xs text-text-muted uppercase tracking-wider font-bold mb-2">Programa Semanal</p>
                <div className="flex gap-2 mt-1">
                  {[0, 1, 2, 3, 4, 5, 6].map(day => {
                    const hasTemplate = !!schedule[day as keyof WeeklySchedule];
                    return (
                      <div key={day} className={`text-center flex-1 p-2 rounded-lg ${hasTemplate ? 'bg-success/10 border border-success/30' : 'bg-surface-raised'}`}>
                        <p className="text-2xs font-bold text-text-muted">{DAY_NAMES[day]}</p>
                        <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${hasTemplate ? 'bg-success' : 'bg-border-input'}`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-8 mt-auto border-t border-divider/50 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handleBack}
            leftIcon={<ChevronLeft className="w-5 h-5" />}
            className={stepIndex === 0 ? 'invisible' : ''}
          >
            Atras
          </Button>

          <Button
            onClick={handleNext}
            size="lg"
            isLoading={isFinishing}
            rightIcon={isLastStep ? <CheckCircle2 className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          >
            {isLastStep ? 'Comenzar!' : 'Siguiente'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;
