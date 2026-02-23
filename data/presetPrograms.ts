import { Difficulty, Goal } from '../types';

export interface ProgramExercise {
  exerciseId: string;
  sets: number;
  targetReps: string;
  targetRPE: number;
  restTimer: number;
}

export interface ProgramDay {
  name: string;
  muscleFocus: string[];
  exercises: ProgramExercise[];
}

export interface PresetProgram {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  level: Difficulty;
  goal: Goal;
  daysPerWeek: number;
  recommendedWeeks: number;
  icon: string;
  accentFrom: string;
  accentTo: string;
  days: ProgramDay[];
}

// ─── Weekday assignment per days-per-week ────────────────────────────────────
export const PROGRAM_WEEKDAY_MAP: Record<number, number[]> = {
  3: [1, 3, 5],           // Mon · Wed · Fri
  4: [1, 2, 4, 5],        // Mon · Tue · Thu · Fri
  5: [1, 2, 3, 4, 5],     // Mon → Fri
  6: [1, 2, 3, 4, 5, 6],  // Mon → Sat
};

// ─── Program definitions ─────────────────────────────────────────────────────

export const PRESET_PROGRAMS: PresetProgram[] = [

  // ── 1. Push / Pull / Legs ────────────────────────────────────────────────
  {
    id: 'ppl',
    name: 'Push / Pull / Legs',
    shortName: 'PPL',
    tagline: 'El split más popular para hipertrofia máxima',
    description:
      'Entrena cada grupo muscular dos veces por semana alternando sesiones de empuje, tirón y piernas. Ideal para ganar masa y volumen de forma equilibrada.',
    level: 'Intermediate',
    goal: 'Hypertrophy',
    daysPerWeek: 6,
    recommendedWeeks: 12,
    icon: '💪',
    accentFrom: 'from-red-600',
    accentTo: 'to-red-900',
    days: [
      {
        name: 'Push A',
        muscleFocus: ['Chest', 'Shoulders', 'Arms'],
        exercises: [
          { exerciseId: 'bp01',    sets: 4, targetReps: '6-10',  targetRPE: 8, restTimer: 180 },
          { exerciseId: 'chest02', sets: 4, targetReps: '8-12',  targetRPE: 8, restTimer: 120 },
          { exerciseId: 'sho01',   sets: 3, targetReps: '8-12',  targetRPE: 8, restTimer: 120 },
          { exerciseId: 'lr01',    sets: 3, targetReps: '12-15', targetRPE: 7, restTimer: 90  },
          { exerciseId: 'tp01',    sets: 3, targetReps: '10-15', targetRPE: 7, restTimer: 90  },
        ],
      },
      {
        name: 'Pull A',
        muscleFocus: ['Back', 'Arms'],
        exercises: [
          { exerciseId: 'back03', sets: 4, targetReps: '8-12',  targetRPE: 8, restTimer: 120 },
          { exerciseId: 'back01', sets: 4, targetReps: '6-10',  targetRPE: 8, restTimer: 120 },
          { exerciseId: 'back05', sets: 3, targetReps: '10-12', targetRPE: 8, restTimer: 90  },
          { exerciseId: 'sho04', sets: 3, targetReps: '12-15', targetRPE: 7, restTimer: 60  },
          { exerciseId: 'arm01', sets: 3, targetReps: '10-12', targetRPE: 7, restTimer: 90  },
          { exerciseId: 'arm05', sets: 3, targetReps: '10-12', targetRPE: 7, restTimer: 90  },
        ],
      },
      {
        name: 'Legs A',
        muscleFocus: ['Legs', 'Glutes'],
        exercises: [
          { exerciseId: 'sq01',   sets: 4, targetReps: '6-10',  targetRPE: 8, restTimer: 180 },
          { exerciseId: 'leg02',  sets: 4, targetReps: '8-12',  targetRPE: 8, restTimer: 120 },
          { exerciseId: 'lp01',   sets: 3, targetReps: '10-15', targetRPE: 8, restTimer: 120 },
          { exerciseId: 'leg05',  sets: 3, targetReps: '10-12', targetRPE: 7, restTimer: 90  },
          { exerciseId: 'leg08',  sets: 4, targetReps: '15-20', targetRPE: 7, restTimer: 60  },
        ],
      },
      {
        name: 'Push B',
        muscleFocus: ['Chest', 'Shoulders', 'Arms'],
        exercises: [
          { exerciseId: 'chest02', sets: 4, targetReps: '8-12',  targetRPE: 8, restTimer: 120 },
          { exerciseId: 'chest05', sets: 3, targetReps: '12-15', targetRPE: 7, restTimer: 90  },
          { exerciseId: 'sho02',   sets: 4, targetReps: '8-12',  targetRPE: 8, restTimer: 120 },
          { exerciseId: 'sho07',   sets: 3, targetReps: '15-20', targetRPE: 7, restTimer: 60  },
          { exerciseId: 'arm04',   sets: 3, targetReps: '12-15', targetRPE: 7, restTimer: 90  },
        ],
      },
      {
        name: 'Pull B',
        muscleFocus: ['Back', 'Arms'],
        exercises: [
          { exerciseId: 'dl01',   sets: 3, targetReps: '5',     targetRPE: 8, restTimer: 240 },
          { exerciseId: 'pu01',   sets: 4, targetReps: '6-10',  targetRPE: 8, restTimer: 120 },
          { exerciseId: 'back04', sets: 3, targetReps: '10-12', targetRPE: 8, restTimer: 90  },
          { exerciseId: 'arm06',  sets: 3, targetReps: '10-12', targetRPE: 7, restTimer: 90  },
          { exerciseId: 'arm05',  sets: 2, targetReps: '12-15', targetRPE: 7, restTimer: 60  },
        ],
      },
      {
        name: 'Legs B',
        muscleFocus: ['Legs', 'Glutes'],
        exercises: [
          { exerciseId: 'lp01',   sets: 4, targetReps: '10-15', targetRPE: 8, restTimer: 120 },
          { exerciseId: 'leg11',  sets: 3, targetReps: '10-12', targetRPE: 7, restTimer: 90  },
          { exerciseId: 'leg10',  sets: 3, targetReps: '8-12',  targetRPE: 8, restTimer: 120 },
          { exerciseId: 'leg12',  sets: 3, targetReps: '10-12', targetRPE: 8, restTimer: 90  },
          { exerciseId: 'leg08',  sets: 4, targetReps: '15-20', targetRPE: 7, restTimer: 60  },
        ],
      },
    ],
  },

  // ── 2. Upper / Lower ─────────────────────────────────────────────────────
  {
    id: 'upper-lower',
    name: 'Upper / Lower Split',
    shortName: 'U/L',
    tagline: 'El equilibrio perfecto entre fuerza e hipertrofia',
    description:
      'Cuatro días por semana alternando trabajo de tren superior e inferior. Los días A priorizan la fuerza (5-8 reps) y los días B el volumen (8-12 reps).',
    level: 'Intermediate',
    goal: 'Strength',
    daysPerWeek: 4,
    recommendedWeeks: 12,
    icon: '⚡',
    accentFrom: 'from-blue-600',
    accentTo: 'to-blue-900',
    days: [
      {
        name: 'Upper A — Fuerza',
        muscleFocus: ['Chest', 'Back', 'Shoulders'],
        exercises: [
          { exerciseId: 'bp01',   sets: 4, targetReps: '5',     targetRPE: 8, restTimer: 180 },
          { exerciseId: 'back01', sets: 4, targetReps: '5',     targetRPE: 8, restTimer: 180 },
          { exerciseId: 'sho01',  sets: 3, targetReps: '5',     targetRPE: 8, restTimer: 180 },
          { exerciseId: 'back03', sets: 3, targetReps: '8-10',  targetRPE: 7, restTimer: 120 },
        ],
      },
      {
        name: 'Lower A — Fuerza',
        muscleFocus: ['Legs', 'Glutes'],
        exercises: [
          { exerciseId: 'sq01',  sets: 4, targetReps: '5',     targetRPE: 8, restTimer: 240 },
          { exerciseId: 'leg02', sets: 3, targetReps: '8-10',  targetRPE: 7, restTimer: 120 },
          { exerciseId: 'leg05', sets: 3, targetReps: '10-12', targetRPE: 7, restTimer: 90  },
          { exerciseId: 'leg12', sets: 3, targetReps: '10-12', targetRPE: 7, restTimer: 90  },
        ],
      },
      {
        name: 'Upper B — Volumen',
        muscleFocus: ['Chest', 'Back', 'Arms'],
        exercises: [
          { exerciseId: 'chest02', sets: 4, targetReps: '8-12',  targetRPE: 8, restTimer: 120 },
          { exerciseId: 'pu01',    sets: 4, targetReps: '6-10',  targetRPE: 8, restTimer: 120 },
          { exerciseId: 'back04',  sets: 3, targetReps: '10-12', targetRPE: 7, restTimer: 90  },
          { exerciseId: 'arm01',   sets: 3, targetReps: '10-12', targetRPE: 7, restTimer: 90  },
          { exerciseId: 'tp01',    sets: 3, targetReps: '10-15', targetRPE: 7, restTimer: 90  },
          { exerciseId: 'lr01',    sets: 3, targetReps: '12-15', targetRPE: 7, restTimer: 60  },
        ],
      },
      {
        name: 'Lower B — Volumen',
        muscleFocus: ['Legs', 'Glutes'],
        exercises: [
          { exerciseId: 'dl01',   sets: 3, targetReps: '5',     targetRPE: 8, restTimer: 240 },
          { exerciseId: 'lp01',   sets: 4, targetReps: '10-15', targetRPE: 8, restTimer: 120 },
          { exerciseId: 'leg11',  sets: 3, targetReps: '10-12', targetRPE: 7, restTimer: 90  },
          { exerciseId: 'leg08',  sets: 4, targetReps: '15-20', targetRPE: 7, restTimer: 60  },
        ],
      },
    ],
  },

  // ── 3. Full Body 3x ───────────────────────────────────────────────────────
  {
    id: 'fullbody-3x',
    name: 'Full Body 3×',
    shortName: '3×FB',
    tagline: 'Máxima frecuencia con mínimo tiempo. Ideal para principiantes',
    description:
      'Tres sesiones de cuerpo completo por semana. Cada sesión trabaja todos los grupos musculares con los movimientos fundamentales, permitiendo alta frecuencia y recuperación óptima.',
    level: 'Beginner',
    goal: 'Hypertrophy',
    daysPerWeek: 3,
    recommendedWeeks: 8,
    icon: '🌟',
    accentFrom: 'from-green-600',
    accentTo: 'to-green-900',
    days: [
      {
        name: 'Full Body A',
        muscleFocus: ['Legs', 'Chest', 'Back', 'Core'],
        exercises: [
          { exerciseId: 'sq01',   sets: 3, targetReps: '8-10',  targetRPE: 7, restTimer: 120 },
          { exerciseId: 'bp01',   sets: 3, targetReps: '8-10',  targetRPE: 7, restTimer: 120 },
          { exerciseId: 'back01', sets: 3, targetReps: '8-10',  targetRPE: 7, restTimer: 120 },
          { exerciseId: 'core01', sets: 3, targetReps: '30-60s', targetRPE: 6, restTimer: 60 },
        ],
      },
      {
        name: 'Full Body B',
        muscleFocus: ['Legs', 'Shoulders', 'Back', 'Core'],
        exercises: [
          { exerciseId: 'dl01',   sets: 3, targetReps: '5',     targetRPE: 7, restTimer: 180 },
          { exerciseId: 'sho01',  sets: 3, targetReps: '8-10',  targetRPE: 7, restTimer: 120 },
          { exerciseId: 'back03', sets: 3, targetReps: '8-10',  targetRPE: 7, restTimer: 120 },
          { exerciseId: 'leg08',  sets: 3, targetReps: '15-20', targetRPE: 6, restTimer: 60  },
        ],
      },
      {
        name: 'Full Body C',
        muscleFocus: ['Legs', 'Chest', 'Back', 'Core'],
        exercises: [
          { exerciseId: 'lp01',   sets: 3, targetReps: '10-12', targetRPE: 7, restTimer: 120 },
          { exerciseId: 'chest02',sets: 3, targetReps: '10-12', targetRPE: 7, restTimer: 120 },
          { exerciseId: 'back05', sets: 3, targetReps: '10-12', targetRPE: 7, restTimer: 90  },
          { exerciseId: 'core03', sets: 3, targetReps: '10-15', targetRPE: 7, restTimer: 60  },
        ],
      },
    ],
  },

  // ── 4. 5/3/1 Wendler ──────────────────────────────────────────────────────
  {
    id: '531',
    name: '5/3/1 Wendler',
    shortName: '5/3/1',
    tagline: 'El programa de fuerza más probado del mundo',
    description:
      'Basado en los 4 movimientos básicos: press, peso muerto, press banca y sentadilla. Progresión semanal con ondulación de intensidad (5/3/1 reps) y trabajo de asistencia en alto volumen.',
    level: 'Advanced',
    goal: 'Strength',
    daysPerWeek: 4,
    recommendedWeeks: 16,
    icon: '🏋️',
    accentFrom: 'from-orange-600',
    accentTo: 'to-orange-900',
    days: [
      {
        name: 'Press Hombro',
        muscleFocus: ['Shoulders', 'Arms'],
        exercises: [
          { exerciseId: 'sho01',  sets: 3, targetReps: '5',     targetRPE: 9, restTimer: 240 },
          { exerciseId: 'chest04',sets: 5, targetReps: '10-15', targetRPE: 7, restTimer: 90  },
          { exerciseId: 'back03', sets: 5, targetReps: '10',    targetRPE: 7, restTimer: 90  },
          { exerciseId: 'lr01',   sets: 3, targetReps: '15',    targetRPE: 6, restTimer: 60  },
        ],
      },
      {
        name: 'Peso Muerto',
        muscleFocus: ['Back', 'Legs', 'Glutes'],
        exercises: [
          { exerciseId: 'dl01',   sets: 3, targetReps: '5',  targetRPE: 9, restTimer: 300 },
          { exerciseId: 'sq01',   sets: 5, targetReps: '10', targetRPE: 7, restTimer: 120 },
          { exerciseId: 'leg05',  sets: 3, targetReps: '10', targetRPE: 7, restTimer: 90  },
          { exerciseId: 'core01', sets: 3, targetReps: '30-60s', targetRPE: 6, restTimer: 60 },
        ],
      },
      {
        name: 'Press Banca',
        muscleFocus: ['Chest', 'Arms'],
        exercises: [
          { exerciseId: 'bp01',   sets: 3, targetReps: '5',     targetRPE: 9, restTimer: 300 },
          { exerciseId: 'back01', sets: 5, targetReps: '10',    targetRPE: 7, restTimer: 120 },
          { exerciseId: 'tp01',   sets: 3, targetReps: '15',    targetRPE: 6, restTimer: 60  },
          { exerciseId: 'arm01',  sets: 3, targetReps: '10',    targetRPE: 6, restTimer: 60  },
        ],
      },
      {
        name: 'Sentadilla',
        muscleFocus: ['Legs', 'Glutes'],
        exercises: [
          { exerciseId: 'sq01',   sets: 3, targetReps: '5',     targetRPE: 9, restTimer: 300 },
          { exerciseId: 'leg02',  sets: 5, targetReps: '10',    targetRPE: 7, restTimer: 120 },
          { exerciseId: 'leg12',  sets: 3, targetReps: '10',    targetRPE: 7, restTimer: 90  },
          { exerciseId: 'core02', sets: 3, targetReps: '15',    targetRPE: 6, restTimer: 60  },
        ],
      },
    ],
  },

  // ── 5. Bro Split ──────────────────────────────────────────────────────────
  {
    id: 'bro-split',
    name: 'Bro Split',
    shortName: 'Bro',
    tagline: 'Un grupo muscular por día. Máximo foco e intensidad',
    description:
      'El clásico split de bodybuilding. Cada día dedicas toda la energía a un grupo muscular para maximizar el volumen y la congestión. Ideal para experiencia intermedia con buen volumen de entrenamiento.',
    level: 'Intermediate',
    goal: 'Hypertrophy',
    daysPerWeek: 5,
    recommendedWeeks: 10,
    icon: '🔥',
    accentFrom: 'from-purple-600',
    accentTo: 'to-purple-900',
    days: [
      {
        name: 'Pecho',
        muscleFocus: ['Chest'],
        exercises: [
          { exerciseId: 'bp01',    sets: 4, targetReps: '8-12',  targetRPE: 8, restTimer: 120 },
          { exerciseId: 'chest02', sets: 4, targetReps: '8-12',  targetRPE: 8, restTimer: 120 },
          { exerciseId: 'chest05', sets: 3, targetReps: '12-15', targetRPE: 7, restTimer: 90  },
          { exerciseId: 'chest03', sets: 3, targetReps: '12-15', targetRPE: 7, restTimer: 90  },
          { exerciseId: 'chest09', sets: 3, targetReps: '8-12',  targetRPE: 8, restTimer: 90  },
        ],
      },
      {
        name: 'Espalda',
        muscleFocus: ['Back'],
        exercises: [
          { exerciseId: 'dl01',   sets: 3, targetReps: '5',     targetRPE: 8, restTimer: 240 },
          { exerciseId: 'back01', sets: 4, targetReps: '8-12',  targetRPE: 8, restTimer: 120 },
          { exerciseId: 'pu01',   sets: 4, targetReps: '6-10',  targetRPE: 8, restTimer: 120 },
          { exerciseId: 'back03', sets: 3, targetReps: '10-12', targetRPE: 7, restTimer: 90  },
          { exerciseId: 'back05', sets: 3, targetReps: '10-12', targetRPE: 7, restTimer: 90  },
        ],
      },
      {
        name: 'Hombros',
        muscleFocus: ['Shoulders'],
        exercises: [
          { exerciseId: 'sho01', sets: 4, targetReps: '8-12',  targetRPE: 8, restTimer: 120 },
          { exerciseId: 'lr01',  sets: 4, targetReps: '12-15', targetRPE: 7, restTimer: 60  },
          { exerciseId: 'sho04', sets: 3, targetReps: '15-20', targetRPE: 6, restTimer: 60  },
          { exerciseId: 'sho05', sets: 3, targetReps: '12-15', targetRPE: 7, restTimer: 60  },
          { exerciseId: 'sho02', sets: 3, targetReps: '10-12', targetRPE: 8, restTimer: 90  },
        ],
      },
      {
        name: 'Brazos',
        muscleFocus: ['Arms'],
        exercises: [
          { exerciseId: 'arm01', sets: 4, targetReps: '8-12',  targetRPE: 7, restTimer: 90 },
          { exerciseId: 'arm06', sets: 3, targetReps: '10-12', targetRPE: 7, restTimer: 90 },
          { exerciseId: 'arm05', sets: 3, targetReps: '12-15', targetRPE: 6, restTimer: 60 },
          { exerciseId: 'arm09', sets: 4, targetReps: '8-12',  targetRPE: 7, restTimer: 90 },
          { exerciseId: 'tp01',  sets: 3, targetReps: '12-15', targetRPE: 7, restTimer: 90 },
          { exerciseId: 'arm04', sets: 3, targetReps: '12-15', targetRPE: 7, restTimer: 90 },
        ],
      },
      {
        name: 'Piernas',
        muscleFocus: ['Legs', 'Glutes'],
        exercises: [
          { exerciseId: 'sq01',  sets: 4, targetReps: '8-12',  targetRPE: 8, restTimer: 180 },
          { exerciseId: 'leg02', sets: 4, targetReps: '8-12',  targetRPE: 7, restTimer: 120 },
          { exerciseId: 'lp01',  sets: 4, targetReps: '10-15', targetRPE: 8, restTimer: 120 },
          { exerciseId: 'leg05', sets: 3, targetReps: '10-12', targetRPE: 7, restTimer: 90  },
          { exerciseId: 'leg12', sets: 3, targetReps: '10-12', targetRPE: 8, restTimer: 90  },
          { exerciseId: 'leg08', sets: 4, targetReps: '15-20', targetRPE: 6, restTimer: 60  },
        ],
      },
    ],
  },
];
