import { WorkoutTemplate, TemplateExercise, ExperienceLevel, Goal, Difficulty, WeeklySchedule } from '../types';
import { Exercise } from '../types';
import { getAvailableExercises } from '../data/exerciseBlueprints';

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
