import { Exercise } from '../types';

/**
 * Expanded exercise database organized by muscle group.
 * Each exercise has equipment tags for filtering.
 */
export const exerciseBlueprints: Exercise[] = [
  // === CHEST ===
  {
    id: 'bp01', name: 'Bench Press', muscleGroup: ['Chest', 'Triceps'], equipment: 'Barbell',
    difficulty: 'Intermediate', type: 'Compound',
    instructions: ['Retract scapula', 'Lower to mid-chest', 'Press explosively'],
    tips: ['Dont flare elbows', 'Leg drive is key'],
  },
  {
    id: 'chest02', name: 'Incline Dumbbell Press', muscleGroup: ['Chest', 'Shoulders'], equipment: 'Dumbbells',
    difficulty: 'Intermediate', type: 'Compound',
    instructions: ['Set bench to 30-45 degrees', 'Press up and slightly together', 'Control descent'],
    tips: ['Dont touch dumbbells at top', 'Full stretch at bottom'],
  },
  {
    id: 'chest03', name: 'Dumbbell Fly', muscleGroup: ['Chest'], equipment: 'Dumbbells',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Slight bend in elbows', 'Open arms wide', 'Squeeze at top'],
    tips: ['Think of hugging a tree', 'Dont go too heavy'],
  },
  {
    id: 'chest04', name: 'Push Up', muscleGroup: ['Chest', 'Triceps', 'Shoulders'], equipment: 'Bodyweight',
    difficulty: 'Beginner', type: 'Compound',
    instructions: ['Hands shoulder width', 'Full range of motion', 'Core tight'],
    tips: ['Elbows at 45 degrees', 'Scale with knees if needed'],
  },
  {
    id: 'chest05', name: 'Cable Crossover', muscleGroup: ['Chest'], equipment: 'Cable',
    difficulty: 'Intermediate', type: 'Isolation',
    instructions: ['Step forward slightly', 'Bring handles together', 'Control return'],
    tips: ['Keep slight elbow bend', 'Squeeze chest at center'],
  },

  // === BACK ===
  {
    id: 'back01', name: 'Barbell Row', muscleGroup: ['Back', 'Biceps'], equipment: 'Barbell',
    difficulty: 'Intermediate', type: 'Compound',
    instructions: ['Hinge forward 45 degrees', 'Pull to lower chest', 'Squeeze shoulder blades'],
    tips: ['Dont round lower back', 'Control the negative'],
  },
  {
    id: 'pu01', name: 'Pull Up', muscleGroup: ['Back', 'Biceps'], equipment: 'Bodyweight',
    difficulty: 'Intermediate', type: 'Compound',
    instructions: ['Grip slightly wider than shoulders', 'Pull chest to bar', 'Lower with control'],
    tips: ['Depress shoulders before pulling', 'Avoid swinging'],
  },
  {
    id: 'back03', name: 'Lat Pulldown', muscleGroup: ['Back', 'Biceps'], equipment: 'Cable',
    difficulty: 'Beginner', type: 'Compound',
    instructions: ['Wide grip', 'Pull to upper chest', 'Lean back slightly'],
    tips: ['Squeeze lats at bottom', 'Dont pull behind neck'],
  },
  {
    id: 'back04', name: 'Dumbbell Row', muscleGroup: ['Back'], equipment: 'Dumbbells',
    difficulty: 'Beginner', type: 'Compound',
    instructions: ['One knee on bench', 'Pull to hip', 'Full stretch at bottom'],
    tips: ['Dont rotate torso', 'Elbow past body'],
  },
  {
    id: 'back05', name: 'Seated Cable Row', muscleGroup: ['Back', 'Biceps'], equipment: 'Cable',
    difficulty: 'Beginner', type: 'Compound',
    instructions: ['Sit upright', 'Pull handle to lower chest', 'Squeeze shoulder blades'],
    tips: ['Dont lean back excessively', 'Full extension on release'],
  },
  {
    id: 'dl01', name: 'Deadlift', muscleGroup: ['Hamstrings', 'Back', 'Glutes'], equipment: 'Barbell',
    difficulty: 'Advanced', type: 'Compound',
    instructions: ['Bar over mid-foot', 'Hinge at hips', 'Pull slack out of bar'],
    tips: ['Neutral spine', 'Engage lats'],
  },

  // === SHOULDERS ===
  {
    id: 'sho01', name: 'Overhead Press', muscleGroup: ['Shoulders', 'Triceps'], equipment: 'Barbell',
    difficulty: 'Intermediate', type: 'Compound',
    instructions: ['Bar at collarbone', 'Press straight up', 'Lock out overhead'],
    tips: ['Brace core', 'Dont lean back excessively'],
  },
  {
    id: 'sho02', name: 'Dumbbell Shoulder Press', muscleGroup: ['Shoulders', 'Triceps'], equipment: 'Dumbbells',
    difficulty: 'Beginner', type: 'Compound',
    instructions: ['Start at ear level', 'Press overhead', 'Lower with control'],
    tips: ['Neutral wrist position', 'Full range of motion'],
  },
  {
    id: 'lr01', name: 'Dumbbell Lateral Raise', muscleGroup: ['Shoulders'], equipment: 'Dumbbells',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Stand with dumbbells at sides', 'Raise to shoulder height', 'Lower slowly'],
    tips: ['Lead with elbows', 'Dont use momentum'],
  },
  {
    id: 'sho04', name: 'Face Pull', muscleGroup: ['Shoulders', 'Back'], equipment: 'Cable',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Rope at face height', 'Pull to ears', 'External rotate at end'],
    tips: ['Squeeze rear delts', 'Keep elbows high'],
  },
  {
    id: 'sho05', name: 'Rear Delt Fly', muscleGroup: ['Shoulders'], equipment: 'Dumbbells',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Bent over at hips', 'Raise arms to sides', 'Squeeze at top'],
    tips: ['Light weight', 'Control throughout'],
  },

  // === LEGS ===
  {
    id: 'sq01', name: 'Barbell Back Squat', muscleGroup: ['Quadriceps', 'Glutes'], equipment: 'Barbell',
    difficulty: 'Intermediate', type: 'Compound',
    instructions: ['Feet shoulder width', 'Brace core', 'Depth below parallel'],
    tips: ['Drive through heels', 'Keep chest up'],
  },
  {
    id: 'leg02', name: 'Romanian Deadlift', muscleGroup: ['Hamstrings', 'Glutes'], equipment: 'Barbell',
    difficulty: 'Intermediate', type: 'Compound',
    instructions: ['Slight knee bend', 'Hinge at hips', 'Feel hamstring stretch'],
    tips: ['Bar stays close to legs', 'Dont round back'],
  },
  {
    id: 'lp01', name: 'Leg Press', muscleGroup: ['Quadriceps', 'Glutes'], equipment: 'Machine',
    difficulty: 'Beginner', type: 'Compound',
    instructions: ['Feet high for glutes, low for quads', 'Control eccentric'],
    tips: ['Dont lock knees', 'Full range of motion'],
  },
  {
    id: 'leg04', name: 'Leg Extension', muscleGroup: ['Quadriceps'], equipment: 'Machine',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Adjust pad to ankle level', 'Extend fully', 'Slow negative'],
    tips: ['Squeeze quads at top', 'Dont use momentum'],
  },
  {
    id: 'leg05', name: 'Leg Curl', muscleGroup: ['Hamstrings'], equipment: 'Machine',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Lie face down', 'Curl weight toward glutes', 'Lower with control'],
    tips: ['Dont lift hips', 'Full range of motion'],
  },
  {
    id: 'leg06', name: 'Bulgarian Split Squat', muscleGroup: ['Quadriceps', 'Glutes'], equipment: 'Dumbbells',
    difficulty: 'Intermediate', type: 'Compound',
    instructions: ['Rear foot on bench', 'Descend until thigh parallel', 'Drive through front heel'],
    tips: ['Stay upright', 'Dont let knee cave'],
  },
  {
    id: 'leg07', name: 'Goblet Squat', muscleGroup: ['Quadriceps', 'Glutes'], equipment: 'Dumbbells',
    difficulty: 'Beginner', type: 'Compound',
    instructions: ['Hold dumbbell at chest', 'Squat between legs', 'Elbows inside knees'],
    tips: ['Great for learning squat pattern', 'Keep torso upright'],
  },
  {
    id: 'leg08', name: 'Calf Raise', muscleGroup: ['Calves'], equipment: 'Machine',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Stand on edge of platform', 'Rise onto toes', 'Lower below platform level'],
    tips: ['Full stretch at bottom', 'Pause at top'],
  },

  // === ARMS ===
  {
    id: 'arm01', name: 'Barbell Curl', muscleGroup: ['Biceps'], equipment: 'Barbell',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Shoulder width grip', 'Curl to shoulders', 'Lower with control'],
    tips: ['Dont swing body', 'Keep elbows pinned'],
  },
  {
    id: 'arm02', name: 'Dumbbell Curl', muscleGroup: ['Biceps'], equipment: 'Dumbbells',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Alternate or both arms', 'Supinate at top', 'Full extension'],
    tips: ['Control the negative', 'Dont use momentum'],
  },
  {
    id: 'tp01', name: 'Cable Tricep Pushdown', muscleGroup: ['Triceps'], equipment: 'Cable',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Attach rope to high pulley', 'Keep elbows tucked', 'Extend fully'],
    tips: ['Squeeze triceps at bottom', 'Stay upright'],
  },
  {
    id: 'arm04', name: 'Overhead Tricep Extension', muscleGroup: ['Triceps'], equipment: 'Dumbbells',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Hold dumbbell overhead', 'Lower behind head', 'Extend upward'],
    tips: ['Keep elbows close to ears', 'Full range of motion'],
  },
  {
    id: 'arm05', name: 'Hammer Curl', muscleGroup: ['Biceps'], equipment: 'Dumbbells',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Neutral grip', 'Curl to shoulder', 'Lower slowly'],
    tips: ['Targets brachialis', 'Good forearm builder'],
  },

  // === CORE ===
  {
    id: 'core01', name: 'Plank', muscleGroup: ['Core'], equipment: 'Bodyweight',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Forearms on floor', 'Body straight line', 'Hold position'],
    tips: ['Dont let hips sag', 'Breathe normally'],
  },
  {
    id: 'core02', name: 'Cable Crunch', muscleGroup: ['Core'], equipment: 'Cable',
    difficulty: 'Intermediate', type: 'Isolation',
    instructions: ['Kneel facing cable', 'Crunch down toward floor', 'Control return'],
    tips: ['Use abs, not arms', 'Exhale on crunch'],
  },
  {
    id: 'core03', name: 'Hanging Leg Raise', muscleGroup: ['Core'], equipment: 'Bodyweight',
    difficulty: 'Intermediate', type: 'Isolation',
    instructions: ['Hang from bar', 'Raise legs to 90 degrees', 'Lower with control'],
    tips: ['Dont swing', 'Bend knees to make easier'],
  },
  {
    id: 'core04', name: 'Ab Wheel Rollout', muscleGroup: ['Core'], equipment: 'Bodyweight',
    difficulty: 'Advanced', type: 'Isolation',
    instructions: ['Start on knees', 'Roll forward slowly', 'Pull back using abs'],
    tips: ['Dont let hips sag', 'Start with short range'],
  },
];

/**
 * Equipment categories that map to what exercises are available
 */
export const EQUIPMENT_MAP: Record<string, string[]> = {
  'Gym Complete': ['Barbell', 'Dumbbells', 'Machine', 'Cable', 'Bodyweight'],
  'Barbell & Rack': ['Barbell', 'Bodyweight'],
  'Dumbbells Only': ['Dumbbells', 'Bodyweight'],
  'Bodyweight': ['Bodyweight'],
  'Resistance Bands': ['Bodyweight'], // bands exercises use bodyweight entries
  'Home Gym': ['Dumbbells', 'Barbell', 'Bodyweight'],
};

/**
 * Get exercises filtered by available equipment and max difficulty
 */
export function getAvailableExercises(
  equipmentList: string[],
  maxDifficulty: 'Beginner' | 'Intermediate' | 'Advanced'
): Exercise[] {
  const allowedEquipment = new Set<string>();
  for (const eq of equipmentList) {
    const mapped = EQUIPMENT_MAP[eq];
    if (mapped) mapped.forEach(e => allowedEquipment.add(e));
  }

  const difficultyOrder = { Beginner: 0, Intermediate: 1, Advanced: 2 };
  const maxLevel = difficultyOrder[maxDifficulty];

  return exerciseBlueprints.filter(
    ex => allowedEquipment.has(ex.equipment) && difficultyOrder[ex.difficulty] <= maxLevel
  );
}
