import { WorkoutTemplate, TemplateExercise, ExperienceLevel, Goal, Difficulty, WeeklySchedule, Discipline, RunType } from '../types';
import { Exercise } from '../types';
import { getAvailableExercises } from '../data/exerciseBlueprints';
import { addDays, diffInDays, toISODate } from './schedule';

interface GenerateOptions {
  goal: Goal;
  daysPerWeek: number;
  equipment: string[];
  experienceLevel: ExperienceLevel;
}

interface SplitDay {
  name: string;
  muscleGroups: string[];
}

function getSplitDays(daysPerWeek: number): SplitDay[] {
  if (daysPerWeek <= 3) {
    // Full Body
    const days: SplitDay[] = [];
    const labels = ['A', 'B', 'C'];
    for (let i = 0; i < daysPerWeek; i++) {
      days.push({
        name: `Full Body ${labels[i]}`,
        muscleGroups: ['Chest', 'Back', 'Shoulders', 'Quadriceps', 'Hamstrings', 'Core'],
      });
    }
    return days;
  }

  if (daysPerWeek === 4) {
    // Upper/Lower
    return [
      { name: 'Superior A', muscleGroups: ['Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps'] },
      { name: 'Inferior A', muscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Core'] },
      { name: 'Superior B', muscleGroups: ['Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps'] },
      { name: 'Inferior B', muscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Core'] },
    ];
  }

  // 5-6 days: Push/Pull/Legs
  const ppl: SplitDay[] = [
    { name: 'Empuje A', muscleGroups: ['Chest', 'Shoulders', 'Triceps'] },
    { name: 'Tiron A', muscleGroups: ['Back', 'Biceps', 'Core'] },
    { name: 'Pierna A', muscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'] },
  ];

  if (daysPerWeek >= 5) {
    ppl.push(
      { name: 'Empuje B', muscleGroups: ['Chest', 'Shoulders', 'Triceps'] },
      { name: 'Tiron B', muscleGroups: ['Back', 'Biceps', 'Core'] },
    );
  }
  if (daysPerWeek >= 6) {
    ppl.push(
      { name: 'Pierna B', muscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'] },
    );
  }

  return ppl;
}

function getVolumeConfig(level: ExperienceLevel) {
  switch (level) {
    case 'Beginner': return { sets: 3, rpeMin: 6, rpeMax: 7 };
    case 'Intermediate': return { sets: 4, rpeMin: 7, rpeMax: 8 };
    case 'Advanced': return { sets: 5, rpeMin: 8, rpeMax: 9.5 };
  }
}

function getRestTime(goal: Goal, isCompound: boolean): number {
  if (goal === 'Strength') return isCompound ? 240 : 180;
  if (goal === 'Endurance' || goal === 'Fat Loss') return isCompound ? 60 : 30;
  // Hypertrophy
  return isCompound ? 120 : 90;
}

function getRepsRange(goal: Goal, isCompound: boolean): string {
  if (goal === 'Strength') return isCompound ? '3-5' : '6-8';
  if (goal === 'Endurance' || goal === 'Fat Loss') return isCompound ? '12-15' : '15-20';
  // Hypertrophy
  return isCompound ? '6-10' : '10-15';
}

function pickExercises(
  available: Exercise[],
  targetMuscles: string[],
  count: number,
  usedIds: Set<string>
): Exercise[] {
  const picked: Exercise[] = [];

  // Prioritize compound for first picks, then isolation
  const compounds = available.filter(e => e.type === 'Compound' && !usedIds.has(e.id));
  const isolations = available.filter(e => e.type === 'Isolation' && !usedIds.has(e.id));

  // Score exercises by how many target muscles they hit
  const score = (ex: Exercise) => ex.muscleGroup.filter(m => targetMuscles.includes(m)).length;

  compounds.sort((a, b) => score(b) - score(a));
  isolations.sort((a, b) => score(b) - score(a));

  // Pick compounds first (up to ~60% of count), then isolations
  const compoundCount = Math.ceil(count * 0.6);
  for (const ex of compounds) {
    if (picked.length >= compoundCount) break;
    if (score(ex) > 0) {
      picked.push(ex);
      usedIds.add(ex.id);
    }
  }

  for (const ex of isolations) {
    if (picked.length >= count) break;
    if (score(ex) > 0) {
      picked.push(ex);
      usedIds.add(ex.id);
    }
  }

  // If still need more, pick remaining compounds
  for (const ex of compounds) {
    if (picked.length >= count) break;
    if (!usedIds.has(ex.id) && score(ex) > 0) {
      picked.push(ex);
      usedIds.add(ex.id);
    }
  }

  return picked;
}

function estimateDuration(exerciseCount: number, setsPerExercise: number, avgRest: number): string {
  const totalSets = exerciseCount * setsPerExercise;
  const timePerSet = 1.5; // minutes (including setup)
  const restMinutes = (totalSets - exerciseCount) * (avgRest / 60); // no rest after last set of each exercise
  const totalMinutes = Math.round(totalSets * timePerSet + restMinutes);
  return `${totalMinutes} Mins`;
}

/**
 * Generate workout templates based on user preferences
 */
export function generateTemplates(opts: GenerateOptions): WorkoutTemplate[] {
  const { goal, daysPerWeek, equipment, experienceLevel } = opts;
  const available = getAvailableExercises(equipment, experienceLevel as Difficulty);
  const splitDays = getSplitDays(daysPerWeek);
  const volume = getVolumeConfig(experienceLevel);

  // Full body = fewer exercises per day; split = more per muscle group
  const exercisesPerDay = daysPerWeek <= 3 ? 6 : (daysPerWeek <= 4 ? 5 : 4);

  const templates: WorkoutTemplate[] = [];

  for (const day of splitDays) {
    const usedIds = new Set<string>();
    const exercises = pickExercises(available, day.muscleGroups, exercisesPerDay, usedIds);

    const templateExercises: TemplateExercise[] = exercises.map(ex => {
      const isCompound = ex.type === 'Compound';
      return {
        exerciseId: ex.id,
        sets: isCompound ? volume.sets : Math.max(volume.sets - 1, 2),
        targetReps: getRepsRange(goal, isCompound),
        targetRPE: isCompound ? volume.rpeMax : volume.rpeMin + 1,
        restTimer: getRestTime(goal, isCompound),
      };
    });

    const avgRest = templateExercises.reduce((s, e) => s + e.restTimer, 0) / Math.max(templateExercises.length, 1);
    const muscleFocus = [...new Set(exercises.flatMap(e => e.muscleGroup))].slice(0, 4);

    templates.push({
      id: crypto.randomUUID(),
      name: day.name,
      description: `Rutina generada automaticamente para ${goal.toLowerCase()}`,
      muscleFocus,
      exercises: templateExercises,
      duration: estimateDuration(templateExercises.length, volume.sets, avgRest),
      difficulty: experienceLevel as Difficulty,
    });
  }

  return templates;
}

/** Volumen semanal de partida, en minutos de carrera. */
const WEEKLY_RUN_MINUTES: Record<ExperienceLevel, number> = {
  Beginner: 90,
  Intermediate: 150,
  Advanced: 240,
};

/** La tirada larga se lleva este porcentaje del volumen semanal. */
const LONG_RUN_SHARE = 0.35;

/** Regla del 10%: el volumen semanal no sube mas que esto. */
export const WEEKLY_RUN_PROGRESSION = 0.1;

const roundTo5 = (n: number) => Math.max(15, Math.round(n / 5) * 5);

export interface RunPlanOptions {
  daysPerWeek: number;
  experienceLevel: ExperienceLevel;
}

/**
 * Plan de carrera minimo de la Fase 3: una tirada larga, rodajes suaves y,
 * a partir de intermedio, una sesion de calidad. El volumen sube un 10%
 * semanal como maximo. La Fase 5 lo sustituye por el generador por objetivo
 * (distancia, fecha de carrera, dia de tirada larga).
 */
export function generateRunTemplates(opts: RunPlanOptions): WorkoutTemplate[] {
  const days = Math.min(Math.max(opts.daysPerWeek, 1), 6);
  const weekly = WEEKLY_RUN_MINUTES[opts.experienceLevel];
  const longRun = roundTo5(weekly * LONG_RUN_SHARE);
  const easyDays = Math.max(days - 1, 1);
  const easy = roundTo5((weekly - longRun) / easyDays);

  // Una sola sesion de calidad por semana, y solo si ya hay base.
  const hasQuality = days >= 3 && opts.experienceLevel !== 'Beginner';

  const build = (
    exerciseId: string,
    name: string,
    minutes: number,
    targetRPE: number,
    description: string
  ): WorkoutTemplate => ({
    id: crypto.randomUUID(),
    name,
    description,
    muscleFocus: ['Cardio'],
    exercises: [
      {
        exerciseId,
        sets: 1,
        targetReps: `${minutes} min`,
        targetRPE,
        restTimer: 0,
      },
    ],
    duration: `${minutes} Mins`,
    difficulty: opts.experienceLevel as Difficulty,
  });

  const templates: WorkoutTemplate[] = [
    build(
      'run02',
      'Tirada larga',
      longRun,
      5,
      `Tu sesion mas larga de la semana. Sube el tiempo un ${Math.round(WEEKLY_RUN_PROGRESSION * 100)}% como maximo cada semana.`
    ),
  ];

  if (hasQuality) {
    templates.push(
      build('run03', 'Series', easy, 8, 'Sesion de calidad: bloques rapidos con trote de recuperacion.')
    );
  }

  const softRuns = easyDays - (hasQuality ? 1 : 0);
  for (let i = 1; i <= softRuns; i++) {
    templates.push(
      build(
        'run01',
        softRuns > 1 ? `Rodaje suave ${i}` : 'Rodaje suave',
        easy,
        4,
        'Ritmo conversacional. Es la base sobre la que se construye todo lo demas.'
      )
    );
  }

  return templates;
}

export type RaceDistance = '5k' | '10k' | 'half' | 'marathon';

const RACE_DISTANCE_LABEL: Record<RaceDistance, string> = {
  '5k': '5K', '10k': '10K', half: 'Media maraton', marathon: 'Maraton',
};

/**
 * Tirada larga en el pico del plan, antes del taper. No es la distancia de la
 * carrera: en 5K y 10K conviene superarla un poco; en media y maraton, quedarse
 * por debajo (nadie corre 42km entrenando) [estimado, valores de plan clasico].
 */
const PEAK_LONG_RUN_KM: Record<RaceDistance, number> = {
  '5k': 6, '10k': 9, half: 16, marathon: 32,
};

/** La tirada larga de partida es esta fraccion del pico, segun experiencia. */
const START_LONG_RUN_FACTOR: Record<ExperienceLevel, number> = {
  Beginner: 0.4, Intermediate: 0.55, Advanced: 0.7,
};

const roundToHalf = (km: number) => Math.max(2, Math.round(km * 2) / 2);

export interface RacePlanOptions {
  raceDistance: RaceDistance;
  /** 'YYYY-MM-DD'. */
  raceDate: string;
  /** Dias de carrera a la semana, tirada larga incluida. */
  daysPerWeek: number;
  experienceLevel: ExperienceLevel;
  /** 0=domingo..6=sabado. La tirada larga cae siempre este dia. */
  longRunDay?: number;
}

export interface RacePlanSession {
  /** 'YYYY-MM-DD'. */
  isoDate: string;
  title: string;
  runType: RunType;
}

/**
 * Plan de carrera por objetivo (Fase 5): progresion semanal de la tirada larga
 * con la regla del 10% (`WEEKLY_RUN_PROGRESSION`), mas rodajes suaves el resto de
 * dias, taper las 2 semanas antes de la carrera y la carrera misma como ultima
 * sesion. No genera plantillas: cada sesion es una fecha con un titulo
 * descriptivo (igual que "Descanso" en `addScheduledSession`), porque un plan de
 * carrera no se repite semana a semana como `weeklySchedule` — cada semana tiene
 * una distancia distinta.
 */
export function generateRacePlan(opts: RacePlanOptions): RacePlanSession[] {
  const { raceDistance, raceDate, experienceLevel } = opts;
  const daysPerWeek = Math.min(Math.max(opts.daysPerWeek, 2), 6);
  const longRunDay = opts.longRunDay ?? 0;

  const today = new Date();
  const race = new Date(raceDate);
  const totalWeeks = Math.max(4, Math.ceil(diffInDays(toISODate(race), toISODate(today)) / 7));

  const peak = PEAK_LONG_RUN_KM[raceDistance];
  const start = roundToHalf(peak * START_LONG_RUN_FACTOR[experienceLevel]);
  const taperWeeks = Math.min(2, totalWeeks - 1);

  const sessions: RacePlanSession[] = [];

  // Primer lunes de plan: la semana que contiene "hoy".
  const firstMonday = addDays(today, today.getDay() === 0 ? -6 : 1 - today.getDay());

  for (let week = 0; week < totalWeeks; week++) {
    const weekMonday = addDays(firstMonday, week * 7);
    const weeksToRace = totalWeeks - 1 - week;
    const isRaceWeek = weeksToRace === 0;

    // Progresion del 10% semanal desde el arranque, tope en el pico, taper al final.
    let longRunKm: number;
    if (isRaceWeek) {
      longRunKm = 0; // esa semana la tirada larga es la carrera misma
    } else if (weeksToRace <= taperWeeks) {
      longRunKm = roundToHalf(peak * (weeksToRace === 1 ? 0.5 : 0.7));
    } else {
      longRunKm = roundToHalf(Math.min(peak, start * (1 + WEEKLY_RUN_PROGRESSION) ** week));
    }

    if (longRunKm > 0) {
      const longRunDate = addDays(weekMonday, longRunDay === 0 ? 6 : longRunDay - 1);
      if (diffInDays(toISODate(longRunDate), toISODate(today)) >= 0) {
        sessions.push({
          isoDate: toISODate(longRunDate),
          title: `Tirada larga · ${longRunKm} km`,
          runType: 'long',
        });
      }
    }

    // Rodajes suaves el resto de dias de la semana, repartidos antes de la tirada larga.
    const easyKm = roundToHalf(longRunKm > 0 ? longRunKm * 0.45 : peak * 0.35);
    const easyCount = isRaceWeek ? Math.min(2, daysPerWeek - 1) : daysPerWeek - 1;
    const easyOffsets = [1, 3, 5, 2, 4].slice(0, Math.max(easyCount, 0));
    for (const offset of easyOffsets) {
      const easyDate = addDays(weekMonday, offset - 1);
      if (diffInDays(toISODate(easyDate), toISODate(today)) < 0) continue;
      if (isRaceWeek && diffInDays(toISODate(easyDate), raceDate) >= 0) continue;
      sessions.push({
        isoDate: toISODate(easyDate),
        title: `Rodaje suave · ${easyKm} km`,
        runType: 'easy',
      });
    }
  }

  sessions.push({
    isoDate: raceDate,
    title: `Carrera · ${RACE_DISTANCE_LABEL[raceDistance]}`,
    runType: 'race',
  });

  return sessions.sort((a, b) => a.isoDate.localeCompare(b.isoDate));
}

/**
 * Reparte los dias disponibles entre gimnasio y carrera segun la disciplina.
 */
export function splitDaysByDiscipline(
  discipline: Discipline,
  daysPerWeek: number
): { gymDays: number; runDays: number } {
  if (discipline === 'gym') return { gymDays: daysPerWeek, runDays: 0 };
  if (discipline === 'running') return { gymDays: 0, runDays: daysPerWeek };
  return { gymDays: Math.ceil(daysPerWeek / 2), runDays: Math.floor(daysPerWeek / 2) };
}

/**
 * Suggest a weekly schedule distributing templates across the week.
 * Tries to space out similar muscle groups with rest days between.
 */
export function suggestSchedule(templates: WorkoutTemplate[], daysPerWeek: number): WeeklySchedule {
  const schedule: WeeklySchedule = {};

  if (templates.length === 0 || daysPerWeek === 0) return schedule;

  // Preferred training day patterns (avoid Sunday=0 by default)
  const dayPatterns: Record<number, number[]> = {
    2: [1, 4],             // Mon, Thu
    3: [1, 3, 5],          // Mon, Wed, Fri
    4: [1, 2, 4, 5],       // Mon, Tue, Thu, Fri
    5: [1, 2, 3, 5, 6],    // Mon-Wed, Fri, Sat
    6: [1, 2, 3, 4, 5, 6], // Mon-Sat
  };

  const days = dayPatterns[daysPerWeek] || dayPatterns[4]!;

  for (let i = 0; i < days.length; i++) {
    const templateIdx = i % templates.length;
    schedule[days[i] as keyof WeeklySchedule] = templates[templateIdx].id;
  }

  return schedule;
}
