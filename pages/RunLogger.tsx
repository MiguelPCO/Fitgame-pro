import React, { useState } from 'react';
import { Footprints } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import { RunForm, RunFormValues } from '../components/run/RunForm';
import { RUN_TYPE_OPTIONS } from '../components/run/runTypeOptions';
import { WorkoutSession } from '../types';

interface Props {
  onDone: () => void;
}

/**
 * Registro manual de una carrera (Fase 5, criterio: en <=4 interacciones).
 * No pasa por el reproductor de fuerza (pages/WorkoutPlayer.tsx): una carrera se
 * registra retrospectivamente, no se "juega" set a set. El XP nunca se calcula
 * aqui: `completeSession` construye una sesion con exercises: [] (0 XP por
 * fuerza) y el servidor la corrige via complete_workout, que sabe leer
 * activity_type = 'run'.
 */
const RunLogger: React.FC<Props> = ({ onDone }) => {
  const { completeSession } = useApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: RunFormValues) => {
    setIsSubmitting(true);
    const label = RUN_TYPE_OPTIONS.find(o => o.value === values.runType)?.label ?? 'Carrera';
    const now = Date.now();

    const session: WorkoutSession = {
      id: crypto.randomUUID(),
      name: `Carrera · ${label}`,
      duration: `${Math.round(values.movingTimeS / 60)} Mins`,
      muscleFocus: ['Cardio'],
      exercises: [],
      completed: false,
      xpReward: 0,
      status: 'active',
      startTime: now,
      activityType: 'run',
      distanceM: values.distanceM,
      movingTimeS: values.movingTimeS,
      elapsedTimeS: values.movingTimeS,
      perceivedEffort: values.perceivedEffort,
      runType: values.runType,
    };

    await completeSession(session);
    toast('Carrera registrada', 'success');
    setIsSubmitting(false);
    onDone();
  };

  return (
    <div className="max-w-lg mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-text-main flex items-center gap-2">
          <Footprints className="w-6 h-6 md:w-7 md:h-7 text-cardio" aria-hidden="true" />
          Registrar carrera
        </h1>
        <p className="text-sm text-text-muted mt-1">Distancia, duracion y esfuerzo. Nada mas.</p>
      </div>

      <RunForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};

export default RunLogger;
