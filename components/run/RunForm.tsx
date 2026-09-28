import React, { useMemo, useState } from 'react';
import { Footprints, Gauge } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatPace } from '../../lib/dateUtils';
import { RunType } from '../../types';
import { Input } from '../ui/Input';
import { Slider } from '../ui/Slider';
import { Button } from '../ui/Button';
import { RUN_TYPE_OPTIONS } from './runTypeOptions';

export interface RunFormValues {
  distanceM: number;
  movingTimeS: number;
  perceivedEffort: number;
  runType: RunType;
}

interface RunFormProps {
  onSubmit: (values: RunFormValues) => void;
  isSubmitting?: boolean;
}

/**
 * Registro manual de una carrera (Fase 5). Solo 3 campos obligatorios + enviar:
 * distancia, duracion, esfuerzo. El ritmo se ve en vivo pero nunca se envia
 * (06-modelo-datos.md SS B: un dato derivado siempre acaba desincronizado de su
 * fuente si se guarda aparte). El tipo de carrera tiene un valor por defecto
 * ('easy'), asi que no cuenta como una interaccion mas para llegar al envio.
 */
export const RunForm: React.FC<RunFormProps> = ({ onSubmit, isSubmitting }) => {
  const [distanceKm, setDistanceKm] = useState('');
  const [minutes, setMinutes] = useState('');
  const [effort, setEffort] = useState(5);
  const [runType, setRunType] = useState<RunType>('easy');

  const distanceM = Math.round((parseFloat(distanceKm) || 0) * 1000);
  const movingTimeS = Math.round((parseFloat(minutes) || 0) * 60);
  const pace = useMemo(() => formatPace(distanceM, movingTimeS), [distanceM, movingTimeS]);
  const canSubmit = distanceM > 0 && movingTimeS > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ distanceM, movingTimeS, perceivedEffort: effort, runType });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1.5 block">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Distancia (km)</span>
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            centered
            placeholder="5.0"
            value={distanceKm}
            onChange={e => setDistanceKm(e.target.value)}
            aria-label="Distancia en kilometros"
          />
        </label>

        <label className="space-y-1.5 block">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Duracion (min)</span>
          <Input
            type="number"
            inputMode="decimal"
            step="1"
            min="0"
            centered
            placeholder="30"
            value={minutes}
            onChange={e => setMinutes(e.target.value)}
            aria-label="Duracion en minutos"
          />
        </label>
      </div>

      <div
        role="status"
        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-cardio/10 border border-cardio/40 text-cardio font-bold"
      >
        <Gauge className="w-4 h-4" aria-hidden="true" />
        Ritmo: {pace}
      </div>

      <Slider
        label="Esfuerzo percibido"
        value={effort}
        onChange={setEffort}
        min={1}
        max={10}
      />

      <div className="space-y-1.5">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Tipo de sesion</span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tipo de sesion de carrera">
          {RUN_TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={runType === opt.value}
              onClick={() => setRunType(opt.value)}
              className={cn(
                'min-h-11 px-3 rounded-xl text-sm font-bold border transition-colors duration-fast',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                runType === opt.value
                  ? 'bg-cardio text-background border-transparent'
                  : 'bg-surface-raised text-text-muted border-divider hover:text-text-main'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        disabled={!canSubmit}
        isLoading={isSubmitting}
        leftIcon={<Footprints className="w-5 h-5" />}
      >
        Registrar carrera
      </Button>
    </form>
  );
};

export default RunForm;
