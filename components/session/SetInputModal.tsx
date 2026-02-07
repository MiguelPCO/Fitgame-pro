import React, { useState, useEffect } from 'react';
import { Minus, Plus, Check, Dumbbell, Sparkles } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { RPESlider } from './RPESlider';
import { cn } from '../../lib/utils';

export interface SetData {
  weight: number;
  reps: number;
  rpe: number;
}

interface SetInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SetData) => void;
  exerciseName: string;
  setNumber: number;
  totalSets?: number;
  previousSet?: { weight: number; reps: number; rpe?: number };
  recommendedWeight?: number;
  targetReps?: string;
  targetRPE?: number;
}

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  step: number;
  min: number;
  max: number;
  label: string;
  unit: string;
  size?: 'md' | 'lg';
}

function NumberInput({ value, onChange, step, min, max, label, unit, size = 'lg' }: NumberInputProps) {
  const handleDecrement = () => {
    onChange(Math.max(min, value - step));
  };

  const handleIncrement = () => {
    onChange(Math.min(max, value + step));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    onChange(Math.max(min, Math.min(max, newValue)));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-400">{label}</label>
      <div className="flex items-center gap-2">
        {/* Decrement button */}
        <button
          type="button"
          onClick={handleDecrement}
          className={cn(
            'flex items-center justify-center rounded-xl',
            'bg-gray-800 border border-gray-700',
            'text-white hover:bg-gray-700 active:scale-95',
            'transition-all duration-150',
            size === 'lg' ? 'w-14 h-14' : 'w-11 h-11'
          )}
          aria-label={`Decrease ${label}`}
        >
          <Minus className={size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} />
        </button>

        {/* Value input */}
        <div className="flex-1 relative">
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            step={step}
            min={min}
            max={max}
            className={cn(
              'w-full text-center font-black text-white',
              'bg-gray-800/50 border border-gray-700 rounded-xl',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'transition-all duration-150',
              size === 'lg' ? 'h-14 text-3xl' : 'h-11 text-2xl'
            )}
          />
          <span className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2',
            'text-gray-500 font-medium pointer-events-none',
            size === 'lg' ? 'text-sm' : 'text-xs'
          )}>
            {unit}
          </span>
        </div>

        {/* Increment button */}
        <button
          type="button"
          onClick={handleIncrement}
          className={cn(
            'flex items-center justify-center rounded-xl',
            'bg-gray-800 border border-gray-700',
            'text-white hover:bg-gray-700 active:scale-95',
            'transition-all duration-150',
            size === 'lg' ? 'w-14 h-14' : 'w-11 h-11'
          )}
          aria-label={`Increase ${label}`}
        >
          <Plus className={size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} />
        </button>
      </div>

      {/* Quick adjust buttons for weight */}
      {step === 2.5 && (
        <div className="flex gap-2 justify-center pt-1">
          {[-5, -2.5, 2.5, 5].map((delta) => (
            <button
              key={delta}
              type="button"
              onClick={() => onChange(Math.max(min, Math.min(max, value + delta)))}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-bold',
                'bg-gray-800/50 border border-gray-700',
                'text-gray-400 hover:text-white hover:border-gray-600',
                'transition-colors duration-150'
              )}
            >
              {delta > 0 ? '+' : ''}{delta}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SetInputModal({
  isOpen,
  onClose,
  onSave,
  exerciseName,
  setNumber,
  totalSets = 3,
  previousSet,
  recommendedWeight = 0,
  targetReps,
  targetRPE = 8,
}: SetInputModalProps) {
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(0);
  const [rpe, setRpe] = useState(8);

  // Initialize with previous set values when modal opens
  useEffect(() => {
    if (isOpen) {
      if (previousSet) {
        setWeight(previousSet.weight);
        setReps(previousSet.reps);
        setRpe(previousSet.rpe || targetRPE);
      } else {
        setWeight(0);
        setReps(0);
        setRpe(targetRPE);
      }
    }
  }, [isOpen, previousSet, targetRPE]);

  const handleSave = () => {
    onSave({ weight, reps, rpe });
    onClose();
  };

  const isValid = weight > 0 && reps > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      showCloseButton={true}
    >
      {/* Custom Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Set {setNumber} de {totalSets}
            </p>
            <h2 className="text-lg font-bold text-white">{exerciseName}</h2>
          </div>
        </div>

        {/* Target info */}
        {(targetReps || targetRPE) && (
          <div className="mt-3 flex gap-4 text-sm">
            {targetReps && (
              <span className="text-gray-400">
                Target: <span className="text-white font-semibold">{targetReps} reps</span>
              </span>
            )}
            {targetRPE && (
              <span className="text-gray-400">
                RPE: <span className="text-white font-semibold">{targetRPE}</span>
              </span>
            )}
          </div>
        )}

        {/* Previous set info */}
        {previousSet && previousSet.weight > 0 && (
          <div className="mt-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50">
            <p className="text-xs text-gray-500">
              Último set: <span className="text-gray-300 font-semibold">{previousSet.weight}kg × {previousSet.reps} reps</span>
            </p>
          </div>
        )}
      </div>

      <ModalBody className="space-y-6">
        {/* Weight Input */}
        <NumberInput
          value={weight}
          onChange={setWeight}
          step={2.5}
          min={0}
          max={500}
          label="Peso"
          unit="kg"
          size="lg"
        />

        {/* Recommended weight badge */}
        {recommendedWeight > 0 && weight !== recommendedWeight && (
          <button
            type="button"
            onClick={() => setWeight(recommendedWeight)}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg',
              'bg-primary/10 border border-primary/20',
              'text-primary text-sm font-semibold',
              'hover:bg-primary/15 active:scale-[0.98] transition-all duration-150'
            )}
          >
            <Sparkles className="w-4 h-4" />
            Sugerido: {recommendedWeight} kg
          </button>
        )}

        {/* Reps Input */}
        <NumberInput
          value={reps}
          onChange={setReps}
          step={1}
          min={0}
          max={100}
          label="Repeticiones"
          unit="reps"
          size="lg"
        />

        {/* RPE Slider */}
        <div className="pt-2">
          <RPESlider value={rpe} onChange={setRpe} />
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={!isValid}
          leftIcon={<Check className="w-5 h-5" />}
        >
          Guardar y continuar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
