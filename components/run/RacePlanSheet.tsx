import React, { useState } from 'react';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Slider } from '../ui/Slider';
import { cn } from '../../lib/utils';
import { ExperienceLevel } from '../../types';
import { RaceDistance } from '../../lib/templateGenerator';

const RACE_DISTANCE_OPTIONS: { value: RaceDistance; label: string }[] = [
  { value: '5k', label: '5K' },
  { value: '10k', label: '10K' },
  { value: 'half', label: 'Media maraton' },
  { value: 'marathon', label: 'Maraton' },
];

export interface RacePlanFormValues {
  raceDistance: RaceDistance;
  raceDate: string;
  daysPerWeek: number;
  experienceLevel: ExperienceLevel;
}

interface RacePlanSheetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultExperienceLevel: ExperienceLevel;
  defaultDaysPerWeek: number;
  onGenerate: (values: RacePlanFormValues) => void;
}

const minRaceDate = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 28); // 4 semanas minimo: por debajo no hay progresion que programar
  return d.toISOString().slice(0, 10);
};

/**
 * Genera un plan de carrera por objetivo (Fase 5): distancia, fecha de carrera y
 * dias disponibles. La logica de progresion vive en `generateRacePlan`
 * (lib/templateGenerator.ts); esta hoja solo recoge los datos que esa funcion
 * necesita, igual que WeeklyTemplateSheet en pages/Schedule.tsx.
 */
export const RacePlanSheet: React.FC<RacePlanSheetProps> = ({
  isOpen, onClose, defaultExperienceLevel, defaultDaysPerWeek, onGenerate,
}) => {
  const [raceDistance, setRaceDistance] = useState<RaceDistance>('10k');
  const [raceDate, setRaceDate] = useState(minRaceDate());
  const [daysPerWeek, setDaysPerWeek] = useState(defaultDaysPerWeek || 4);
  const [experienceLevel] = useState<ExperienceLevel>(defaultExperienceLevel);

  const handleGenerate = () => {
    onGenerate({ raceDistance, raceDate, daysPerWeek, experienceLevel });
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Plan de carrera" size="md">
      <div className="p-4 space-y-5">
        <p className="text-sm text-text-muted">
          Genera sesiones en el calendario con progresion semanal (regla del 10%) y
          una tirada larga por semana, hasta el dia de la carrera.
        </p>

        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Distancia</span>
          <div className="grid grid-cols-2 gap-2">
            {RACE_DISTANCE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={raceDistance === opt.value}
                onClick={() => setRaceDistance(opt.value)}
                className={cn(
                  'min-h-11 px-3 rounded-xl text-sm font-bold border transition-colors duration-fast',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  raceDistance === opt.value
                    ? 'bg-cardio text-background border-transparent'
                    : 'bg-surface-raised text-text-muted border-divider hover:text-text-main'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <label className="space-y-1.5 block">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Fecha de la carrera</span>
          <Input
            type="date"
            value={raceDate}
            min={minRaceDate()}
            onChange={e => setRaceDate(e.target.value)}
            aria-label="Fecha de la carrera"
          />
        </label>

        <Slider
          label="Dias de carrera a la semana"
          value={daysPerWeek}
          onChange={setDaysPerWeek}
          min={2}
          max={6}
        />

        <Button fullWidth onClick={handleGenerate} className="min-h-11">
          Generar plan
        </Button>
      </div>
    </Sheet>
  );
};

export default RacePlanSheet;
