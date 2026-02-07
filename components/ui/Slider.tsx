import React from 'react';
import { cn } from '../../lib/utils';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  className,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className={cn('w-full space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">{label}</label>
          <span className="text-sm font-bold text-primary">{value}</span>
        </div>
      )}

      <div className="relative">
        {/* Track background */}
        <div className="absolute inset-0 h-2 top-1/2 -translate-y-1/2 bg-gray-800 rounded-full" />

        {/* Filled track */}
        <div
          className="absolute h-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-red-400 rounded-full pointer-events-none"
          style={{ width: `${percentage}%` }}
        />

        {/* Native input */}
        <input
          type="range"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          className={cn(
            'relative w-full h-6 appearance-none bg-transparent cursor-pointer z-10',
            // Thumb styles (Webkit - Chrome, Safari, Edge)
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-5',
            '[&::-webkit-slider-thumb]:h-5',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-white',
            '[&::-webkit-slider-thumb]:shadow-lg',
            '[&::-webkit-slider-thumb]:shadow-primary/30',
            '[&::-webkit-slider-thumb]:border-2',
            '[&::-webkit-slider-thumb]:border-primary',
            '[&::-webkit-slider-thumb]:transition-transform',
            '[&::-webkit-slider-thumb]:hover:scale-110',
            '[&::-webkit-slider-thumb]:active:scale-95',
            // Thumb styles (Firefox)
            '[&::-moz-range-thumb]:appearance-none',
            '[&::-moz-range-thumb]:w-5',
            '[&::-moz-range-thumb]:h-5',
            '[&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-white',
            '[&::-moz-range-thumb]:shadow-lg',
            '[&::-moz-range-thumb]:border-2',
            '[&::-moz-range-thumb]:border-primary',
            '[&::-moz-range-thumb]:transition-transform',
            '[&::-moz-range-thumb]:hover:scale-110',
            // Track styles (Firefox)
            '[&::-moz-range-track]:bg-transparent',
            '[&::-moz-range-track]:h-2'
          )}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-text-muted">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
