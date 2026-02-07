import { Exercise, WorkoutSession, UserProfile, WorkoutTemplate } from '../types';

export const currentUser: UserProfile = {
  name: "Alex Johnson",
  level: 12,
  xp: 2450,
  xpToNextLevel: 3000,
  streak: 24,
  avatarUrl: "https://picsum.photos/100/100",
  tier: 'Advanced'
};

export const exercises: Exercise[] = [
  {
    id: "sq01",
    name: "Barbell Back Squat",
    muscleGroup: ["Quadriceps", "Glutes"],
    equipment: "Barbell",
    difficulty: "Advanced",
    type: "Compound",
    instructions: ["Feet shoulder width", "Brace core", "Depth below parallel"],
    tips: ["Drive through heels", "Keep chest up"]
  },
  {
    id: "bp01",
    name: "Bench Press",
    muscleGroup: ["Chest", "Triceps"],
    equipment: "Barbell",
    difficulty: "Intermediate",
    type: "Compound",
    instructions: ["Retract scapula", "Lower to mid-chest", "Press explosively"],
    tips: ["Don't flare elbows", "Leg drive is key"]
  },
  {
    id: "dl01",
    name: "Deadlift",
    muscleGroup: ["Hamstrings", "Back"],
    equipment: "Barbell",
    difficulty: "Advanced",
    type: "Compound",
    instructions: ["Bar over mid-foot", "Hinge at hips", "Pull slack out of bar"],
    tips: ["Neutral spine", "Engage lats"]
  },
  {
    id: "lp01",
    name: "Leg Press",
    muscleGroup: ["Quadriceps"],
    equipment: "Machine",
    difficulty: "Beginner",
    type: "Isolation",
    instructions: ["Feet high for glutes, low for quads", "Control eccentric"],
    tips: ["Don't lock knees", "Full range of motion"]
  },
  {
    id: "pu01",
    name: "Pull Up",
    muscleGroup: ["Back", "Biceps"],
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    type: "Compound",
    instructions: ["Grip bar slightly wider than shoulders", "Pull chest towards the bar", "Lower yourself with control"],
    tips: ["Depress shoulders before pulling", "Avoid swinging"]
  },
  {
    id: "lr01",
    name: "Dumbbell Lateral Raise",
    muscleGroup: ["Shoulders"],
    equipment: "Dumbbells",
    difficulty: "Intermediate",
    type: "Isolation",
    instructions: ["Stand with dumbbells at sides", "Raise arms out to the side until shoulder height", "Lower slowly"],
    tips: ["Lead with your elbows", "Don't use momentum to swing weights up"]
  },
  {
    id: "tp01",
    name: "Cable Tricep Pushdown",
    muscleGroup: ["Triceps"],
    equipment: "Cable",
    difficulty: "Beginner",
    type: "Isolation",
    instructions: ["Attach rope or bar to high pulley", "Keep elbows tucked at your sides", "Extend arms fully downward"],
    tips: ["Squeeze triceps at the bottom", "Keep posture upright"]
  }
];

export const mockTemplates: WorkoutTemplate[] = [
  {
    id: "tpl_upper_power",
    name: "Upper Body Power",
    description: "Focus on heavy compound movements for chest and back.",
    muscleFocus: ["Chest", "Back", "Shoulders"],
    duration: "60 Mins",
    difficulty: "Intermediate",
    exercises: [
      { exerciseId: "bp01", sets: 4, targetReps: "5-8", targetRPE: 8.5, restTimer: 180 }
    ]
  },
  {
    id: "tpl_leg_destruction",
    name: "Leg Day Destruction",
    description: "High volume leg workout. Prepare to not walk tomorrow.",
    muscleFocus: ["Legs"],
    duration: "75 Mins",
    difficulty: "Advanced",
    exercises: [
      { exerciseId: "sq01", sets: 5, targetReps: "5-8", targetRPE: 9, restTimer: 240 },
      { exerciseId: "lp01", sets: 4, targetReps: "12-15", targetRPE: 9.5, restTimer: 120 }
    ]
  }
];

export const todayWorkout: WorkoutSession = {
  id: "w-legs-hypertrophy",
  name: "Legs - Hypertrophy",
  duration: "60 Mins",
  muscleFocus: ["Legs", "Abs"],
  completed: false,
  xpReward: 350,
  exercises: [
    {
      exerciseId: "sq01",
      restTimer: 180,
      sets: [
        { id: "s1", type: "warmup", weight: 60, reps: 10, completed: true, targetReps: "12", targetRPE: 6 },
        { id: "s2", type: "top", weight: 100, reps: 8, completed: false, targetReps: "6-8", targetRPE: 8 },
        { id: "s3", type: "top", weight: 100, reps: 8, completed: false, targetReps: "6-8", targetRPE: 8.5 },
        { id: "s4", type: "backoff", weight: 90, reps: 10, completed: false, targetReps: "10-12", targetRPE: 8 }
      ]
    },
    {
      exerciseId: "lp01",
      restTimer: 120,
      sets: [
        { id: "s1", type: "top", weight: 200, reps: 12, completed: false, targetReps: "12-15", targetRPE: 9 },
        { id: "s2", type: "top", weight: 200, reps: 11, completed: false, targetReps: "12-15", targetRPE: 9.5 },
        { id: "s3", type: "backoff", weight: 180, reps: 15, completed: false, targetReps: "15-20", targetRPE: 10 }
      ]
    }
  ]
};