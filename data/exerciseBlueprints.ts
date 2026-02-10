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

  // === CHEST (expanded) ===
  {
    id: 'chest06', name: 'Decline Bench Press', muscleGroup: ['Chest', 'Triceps'], equipment: 'Barbell',
    difficulty: 'Intermediate', type: 'Compound',
    instructions: ['Set bench to decline', 'Lower bar to lower chest', 'Press up explosively'],
    tips: ['Use a spotter', 'Dont bounce off chest'],
  },
  {
    id: 'chest07', name: 'Dumbbell Bench Press', muscleGroup: ['Chest', 'Triceps'], equipment: 'Dumbbells',
    difficulty: 'Beginner', type: 'Compound',
    instructions: ['Lie flat on bench', 'Press dumbbells up', 'Lower with control'],
    tips: ['Greater range of motion than barbell', 'Keep wrists neutral'],
  },
  {
    id: 'chest08', name: 'Machine Chest Press', muscleGroup: ['Chest', 'Triceps'], equipment: 'Machine',
    difficulty: 'Beginner', type: 'Compound',
    instructions: ['Adjust seat height', 'Push handles forward', 'Return slowly'],
    tips: ['Great for beginners', 'Focus on chest squeeze'],
  },
  {
    id: 'chest09', name: 'Chest Dip', muscleGroup: ['Chest', 'Triceps', 'Shoulders'], equipment: 'Bodyweight',
    difficulty: 'Intermediate', type: 'Compound',
    instructions: ['Lean forward slightly', 'Lower until shoulders below elbows', 'Push back up'],
    tips: ['Forward lean targets chest', 'Dont go too deep initially'],
  },
  {
    id: 'chest10', name: 'Pec Deck', muscleGroup: ['Chest'], equipment: 'Machine',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Adjust arm pads to chest level', 'Bring pads together', 'Control return'],
    tips: ['Squeeze chest at center', 'Keep back flat against pad'],
  },

  // === BACK (expanded) ===
  {
    id: 'back06', name: 'T-Bar Row', muscleGroup: ['Back', 'Biceps'], equipment: 'Barbell',
    difficulty: 'Intermediate', type: 'Compound',
    instructions: ['Straddle the bar', 'Grip handle close', 'Pull to chest'],
    tips: ['Keep chest up', 'Squeeze at top'],
  },
  {
    id: 'back07', name: 'Chest Supported Row', muscleGroup: ['Back'], equipment: 'Dumbbells',
    difficulty: 'Beginner', type: 'Compound',
    instructions: ['Lie chest on incline bench', 'Row dumbbells up', 'Lower with control'],
    tips: ['Eliminates momentum', 'Great for strict form'],
  },
  {
    id: 'back08', name: 'Chin Up', muscleGroup: ['Back', 'Biceps'], equipment: 'Bodyweight',
    difficulty: 'Intermediate', type: 'Compound',
    instructions: ['Underhand grip shoulder width', 'Pull chin over bar', 'Lower with control'],
    tips: ['More bicep emphasis than pull up', 'Full dead hang at bottom'],
  },
  {
    id: 'back09', name: 'Straight Arm Pulldown', muscleGroup: ['Back'], equipment: 'Cable',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Stand facing cable', 'Keep arms straight', 'Pull bar to thighs'],
    tips: ['Focus on lat contraction', 'Slight forward lean'],
  },
  {
    id: 'back10', name: 'Cable Pullover', muscleGroup: ['Back'], equipment: 'Cable',
    difficulty: 'Intermediate', type: 'Isolation',
    instructions: ['Face away from cable', 'Pull handle overhead to hips', 'Control return'],
    tips: ['Keep slight elbow bend', 'Feel the stretch at top'],
  },
  {
    id: 'back11', name: 'Rack Pull', muscleGroup: ['Back', 'Hamstrings'], equipment: 'Barbell',
    difficulty: 'Advanced', type: 'Compound',
    instructions: ['Set bar at knee height', 'Pull to lockout', 'Lower with control'],
    tips: ['Great for upper back strength', 'Keep lats engaged'],
  },

  // === SHOULDERS (expanded) ===
  {
    id: 'sho06', name: 'Arnold Press', muscleGroup: ['Shoulders', 'Triceps'], equipment: 'Dumbbells',
    difficulty: 'Intermediate', type: 'Compound',
    instructions: ['Start with palms facing you', 'Rotate as you press up', 'Reverse on descent'],
    tips: ['Smooth rotation throughout', 'Full range of motion'],
  },
  {
    id: 'sho07', name: 'Cable Lateral Raise', muscleGroup: ['Shoulders'], equipment: 'Cable',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Stand sideways to cable', 'Raise arm to shoulder height', 'Lower slowly'],
    tips: ['Constant tension from cable', 'Dont shrug shoulders'],
  },
  {
    id: 'sho08', name: 'Machine Shoulder Press', muscleGroup: ['Shoulders', 'Triceps'], equipment: 'Machine',
    difficulty: 'Beginner', type: 'Compound',
    instructions: ['Adjust seat height', 'Press handles overhead', 'Lower with control'],
    tips: ['Keep back flat against pad', 'Dont lock elbows'],
  },
  {
    id: 'sho09', name: 'Upright Row', muscleGroup: ['Shoulders', 'Back'], equipment: 'Barbell',
    difficulty: 'Intermediate', type: 'Compound',
    instructions: ['Narrow grip on bar', 'Pull to chin level', 'Lead with elbows'],
    tips: ['Dont go too narrow', 'Stop if shoulder discomfort'],
  },
  {
    id: 'sho10', name: 'Reverse Pec Deck', muscleGroup: ['Shoulders'], equipment: 'Machine',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Face the machine', 'Open arms to sides', 'Squeeze rear delts'],
    tips: ['Keep slight elbow bend', 'Control the return'],
  },

  // === LEGS (expanded) ===
  {
    id: 'leg09', name: 'Front Squat', muscleGroup: ['Quadriceps', 'Core'], equipment: 'Barbell',
    difficulty: 'Advanced', type: 'Compound',
    instructions: ['Bar on front delts', 'Elbows high', 'Squat to depth'],
    tips: ['More quad dominant than back squat', 'Keep torso upright'],
  },
  {
    id: 'leg10', name: 'Hack Squat', muscleGroup: ['Quadriceps', 'Glutes'], equipment: 'Machine',
    difficulty: 'Intermediate', type: 'Compound',
    instructions: ['Shoulders under pads', 'Feet shoulder width on platform', 'Squat to depth'],
    tips: ['Keep back flat against pad', 'Dont lock knees at top'],
  },
  {
    id: 'leg11', name: 'Walking Lunge', muscleGroup: ['Quadriceps', 'Glutes'], equipment: 'Dumbbells',
    difficulty: 'Beginner', type: 'Compound',
    instructions: ['Step forward into lunge', 'Lower back knee toward floor', 'Alternate legs'],
    tips: ['Keep torso upright', 'Dont let knee pass toes'],
  },
  {
    id: 'leg12', name: 'Hip Thrust', muscleGroup: ['Glutes', 'Hamstrings'], equipment: 'Barbell',
    difficulty: 'Intermediate', type: 'Compound',
    instructions: ['Upper back on bench', 'Bar over hips', 'Drive hips to full extension'],
    tips: ['Squeeze glutes at top', 'Chin tucked throughout'],
  },
  {
    id: 'leg13', name: 'Sumo Deadlift', muscleGroup: ['Glutes', 'Hamstrings', 'Quadriceps'], equipment: 'Barbell',
    difficulty: 'Advanced', type: 'Compound',
    instructions: ['Wide stance, toes out', 'Grip inside knees', 'Pull to lockout'],
    tips: ['Push knees out', 'Keep chest up'],
  },
  {
    id: 'leg14', name: 'Seated Calf Raise', muscleGroup: ['Calves'], equipment: 'Machine',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Sit with knees under pad', 'Rise onto toes', 'Lower for full stretch'],
    tips: ['Targets soleus muscle', 'Pause at top and bottom'],
  },
  {
    id: 'leg15', name: 'Step Up', muscleGroup: ['Quadriceps', 'Glutes'], equipment: 'Dumbbells',
    difficulty: 'Beginner', type: 'Compound',
    instructions: ['Place foot on box', 'Drive up to standing', 'Lower with control'],
    tips: ['Dont push off back leg', 'Keep box at knee height'],
  },

  // === ARMS (expanded) ===
  {
    id: 'arm06', name: 'Preacher Curl', muscleGroup: ['Biceps'], equipment: 'Barbell',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Arms on preacher pad', 'Curl bar to shoulders', 'Lower with control'],
    tips: ['Eliminates cheating', 'Full extension at bottom'],
  },
  {
    id: 'arm07', name: 'Concentration Curl', muscleGroup: ['Biceps'], equipment: 'Dumbbells',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Sit with elbow on inner thigh', 'Curl to shoulder', 'Squeeze at top'],
    tips: ['Isolates the bicep', 'Slow and controlled'],
  },
  {
    id: 'arm08', name: 'Incline Dumbbell Curl', muscleGroup: ['Biceps'], equipment: 'Dumbbells',
    difficulty: 'Intermediate', type: 'Isolation',
    instructions: ['Sit on incline bench', 'Arms hang straight down', 'Curl to shoulders'],
    tips: ['Greater stretch on bicep', 'Dont swing'],
  },
  {
    id: 'arm09', name: 'Skull Crusher', muscleGroup: ['Triceps'], equipment: 'Barbell',
    difficulty: 'Intermediate', type: 'Isolation',
    instructions: ['Lie flat, bar overhead', 'Lower to forehead', 'Extend back up'],
    tips: ['Keep elbows pointing up', 'Use EZ bar for wrist comfort'],
  },
  {
    id: 'arm10', name: 'Tricep Dip', muscleGroup: ['Triceps', 'Chest'], equipment: 'Bodyweight',
    difficulty: 'Intermediate', type: 'Compound',
    instructions: ['Grip parallel bars', 'Lower until elbows at 90 degrees', 'Push back up'],
    tips: ['Upright torso targets triceps', 'Dont go too deep'],
  },
  {
    id: 'arm11', name: 'Cable Curl', muscleGroup: ['Biceps'], equipment: 'Cable',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Stand facing low pulley', 'Curl handle to shoulders', 'Lower slowly'],
    tips: ['Constant tension throughout', 'Keep elbows pinned'],
  },
  {
    id: 'arm12', name: 'Close Grip Bench Press', muscleGroup: ['Triceps', 'Chest'], equipment: 'Barbell',
    difficulty: 'Intermediate', type: 'Compound',
    instructions: ['Hands shoulder width apart', 'Lower to lower chest', 'Press up explosively'],
    tips: ['Keep elbows tucked', 'Great for tricep mass'],
  },

  // === CORE (expanded) ===
  {
    id: 'core05', name: 'Russian Twist', muscleGroup: ['Core'], equipment: 'Dumbbells',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Sit with knees bent', 'Lean back slightly', 'Rotate side to side with weight'],
    tips: ['Keep feet off floor for extra challenge', 'Control the rotation'],
  },
  {
    id: 'core06', name: 'Dead Bug', muscleGroup: ['Core'], equipment: 'Bodyweight',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Lie on back, arms up', 'Extend opposite arm and leg', 'Return and alternate'],
    tips: ['Keep lower back pressed to floor', 'Slow and controlled'],
  },
  {
    id: 'core07', name: 'Pallof Press', muscleGroup: ['Core'], equipment: 'Cable',
    difficulty: 'Intermediate', type: 'Isolation',
    instructions: ['Stand sideways to cable', 'Hold handle at chest', 'Press straight out and hold'],
    tips: ['Resist rotation', 'Great anti-rotation exercise'],
  },
  {
    id: 'core08', name: 'Bicycle Crunch', muscleGroup: ['Core'], equipment: 'Bodyweight',
    difficulty: 'Beginner', type: 'Isolation',
    instructions: ['Lie on back, hands behind head', 'Bring elbow to opposite knee', 'Alternate sides'],
    tips: ['Dont pull on neck', 'Slow controlled movement'],
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
