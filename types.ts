
export interface UserProfile {
  name: string;
  weight: number;
  height: number;
  goal: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  streak: number;
  xp: number;
  levelTitle: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  notes?: string;
  description?: string;
}

export interface WorkoutDay {
  dayTitle: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  title: string;
  duration: string;
  difficulty: string;
  schedule: WorkoutDay[];
}

export interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  description: string;
}

export interface DietPlan {
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snack?: Meal;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export enum AppTab {
  DASHBOARD = 'Dashboard',
  WORKOUT = 'Workout',
  DIET = 'Diet',
  ACTIVITY = 'Activity',
  CHAT = 'Chat',
  PROFILE = 'Profile',
}
