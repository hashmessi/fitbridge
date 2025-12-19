/**
 * Supabase Client for FitBridge
 * Handles authentication, database operations, and real-time subscriptions
 */

import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// ==========================================
// TYPES
// ==========================================

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export interface DbUserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  weight?: number;
  height?: number;
  goal?: string;
  fitness_level?: string;
  date_of_birth?: string;
  gender?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbStreak {
  id: string;
  user_id: string;
  streak_type: 'workout' | 'diet' | 'login' | 'steps';
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  xp_earned: number;
  level: number;
  level_title: string;
}

export interface DbWorkoutLog {
  id?: string;
  user_id: string;
  workout_date: string;
  title: string;
  workout_type?: string;
  duration_minutes: number;
  calories_burned?: number;
  exercises?: any[];
  notes?: string;
  is_ai_generated?: boolean;
}

export interface DbDietLog {
  id?: string;
  user_id: string;
  log_date: string;
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  meal_name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  description?: string;
  is_ai_generated?: boolean;
}

export interface DbAIPlan {
  id?: string;
  user_id: string;
  plan_type: 'workout' | 'diet';
  title: string;
  description?: string;
  plan_data: any;
  duration_weeks?: number;
  difficulty?: string;
  is_active?: boolean;
  generated_by?: string;
  prompt_used?: string;
}

// ==========================================
// AUTHENTICATION
// ==========================================

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });
  
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  
  if (data.session) {
    localStorage.setItem('fitbridge_token', data.user.id);
  }
  
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  localStorage.removeItem('fitbridge_token');
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  if (!isSupabaseConfigured()) return null;
  
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (data.session) {
      localStorage.setItem('fitbridge_token', data.session.user.id);
    }
    
    return data.session;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;
  
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      if (error.message?.includes('Auth session missing')) return null;
      throw error;
    }
    return data.user;
  } catch {
    return null;
  }
}

export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      localStorage.setItem('fitbridge_token', session.user.id);
    } else {
      localStorage.removeItem('fitbridge_token');
    }
    callback(event, session);
  });
}

// ==========================================
// USER PROFILE
// ==========================================

export async function getUserProfile(userId: string): Promise<DbUserProfile | null> {
  if (!isSupabaseConfigured()) return null;
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

export async function createUserProfile(userId: string, profile: Partial<DbUserProfile>): Promise<DbUserProfile> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: profile.email || '',
      name: profile.name || 'User',
      weight: profile.weight,
      height: profile.height,
      goal: profile.goal,
      fitness_level: profile.fitness_level || 'Beginner',
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<DbUserProfile>): Promise<DbUserProfile> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ==========================================
// STREAKS & GAMIFICATION
// ==========================================

export async function getUserStreaks(userId: string): Promise<DbStreak[]> {
  if (!isSupabaseConfigured()) return [];
  
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data || [];
}

export async function updateStreak(
  userId: string, 
  streakType: 'workout' | 'diet' | 'login' | 'steps',
  increment: number = 1,
  xpGained: number = 10
): Promise<DbStreak | null> {
  if (!isSupabaseConfigured()) return null;
  
  // Get current streak
  const { data: current } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('streak_type', streakType)
    .single();
  
  const today = new Date().toISOString().split('T')[0];
  const newStreak = (current?.current_streak || 0) + increment;
  const newXp = (current?.xp_earned || 0) + xpGained;
  const newLevel = Math.floor(newXp / 100) + 1;
  
  const levelTitles = ['Beginner', 'Rising Star', 'Fitness Enthusiast', 'Fitness Pro', 'Elite Athlete'];
  const levelTitle = levelTitles[Math.min(newLevel - 1, levelTitles.length - 1)];
  
  const { data, error } = await supabase
    .from('streaks')
    .upsert({
      user_id: userId,
      streak_type: streakType,
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, current?.longest_streak || 0),
      last_activity_date: today,
      xp_earned: newXp,
      level: newLevel,
      level_title: levelTitle,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getTotalXP(userId: string): Promise<{ xp: number; level: number; title: string }> {
  if (!isSupabaseConfigured()) return { xp: 0, level: 1, title: 'Beginner' };
  
  const streaks = await getUserStreaks(userId);
  const totalXp = streaks.reduce((sum, s) => sum + (s.xp_earned || 0), 0);
  const level = Math.floor(totalXp / 100) + 1;
  
  const levelTitles = ['Beginner', 'Rising Star', 'Fitness Enthusiast', 'Fitness Pro', 'Elite Athlete'];
  const title = levelTitles[Math.min(level - 1, levelTitles.length - 1)];
  
  return { xp: totalXp, level, title };
}

// ==========================================
// WORKOUT LOGS
// ==========================================

export async function logWorkout(workout: DbWorkoutLog): Promise<DbWorkoutLog | null> {
  if (!isSupabaseConfigured()) return null;
  
  const { data, error } = await supabase
    .from('workout_logs')
    .insert({
      user_id: workout.user_id,
      workout_date: workout.workout_date || new Date().toISOString().split('T')[0],
      title: workout.title,
      workout_type: workout.workout_type,
      duration_minutes: workout.duration_minutes,
      calories_burned: workout.calories_burned,
      exercises: workout.exercises,
      notes: workout.notes,
      is_ai_generated: workout.is_ai_generated || false,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Update workout streak
  await updateStreak(workout.user_id, 'workout', 1, 25);
  
  return data;
}

export async function getWorkoutLogs(userId: string, limit: number = 10): Promise<DbWorkoutLog[]> {
  if (!isSupabaseConfigured()) return [];
  
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .order('workout_date', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

export async function getWorkoutStats(userId: string, days: number = 7) {
  if (!isSupabaseConfigured()) return null;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('workout_date', startDate.toISOString().split('T')[0]);
  
  if (error) throw error;
  
  return {
    total_workouts: data?.length || 0,
    total_minutes: data?.reduce((sum, w) => sum + (w.duration_minutes || 0), 0) || 0,
    total_calories: data?.reduce((sum, w) => sum + (w.calories_burned || 0), 0) || 0,
  };
}

// ==========================================
// DIET LOGS
// ==========================================

export async function logMeal(meal: DbDietLog): Promise<DbDietLog | null> {
  if (!isSupabaseConfigured()) return null;
  
  const { data, error } = await supabase
    .from('diet_logs')
    .insert({
      user_id: meal.user_id,
      log_date: meal.log_date || new Date().toISOString().split('T')[0],
      meal_type: meal.meal_type,
      meal_name: meal.meal_name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      description: meal.description,
      is_ai_generated: meal.is_ai_generated || false,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Update diet streak
  await updateStreak(meal.user_id, 'diet', 0, 10);
  
  return data;
}

export async function getDietLogs(userId: string, date?: string, limit: number = 20): Promise<DbDietLog[]> {
  if (!isSupabaseConfigured()) return [];
  
  let query = supabase
    .from('diet_logs')
    .select('*')
    .eq('user_id', userId)
    .order('log_date', { ascending: false })
    .limit(limit);
  
  if (date) {
    query = query.eq('log_date', date);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

export async function getTodayCalories(userId: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  
  const today = new Date().toISOString().split('T')[0];
  const meals = await getDietLogs(userId, today);
  return meals.reduce((sum, m) => sum + (m.calories || 0), 0);
}

// ==========================================
// AI PLANS
// ==========================================

export async function saveAIPlan(plan: DbAIPlan): Promise<DbAIPlan | null> {
  if (!isSupabaseConfigured()) return null;
  
  // Deactivate old plans of same type
  await supabase
    .from('ai_plans')
    .update({ is_active: false })
    .eq('user_id', plan.user_id)
    .eq('plan_type', plan.plan_type);
  
  const { data, error } = await supabase
    .from('ai_plans')
    .insert({
      user_id: plan.user_id,
      plan_type: plan.plan_type,
      title: plan.title,
      description: plan.description,
      plan_data: plan.plan_data,
      duration_weeks: plan.duration_weeks,
      difficulty: plan.difficulty,
      is_active: true,
      generated_by: plan.generated_by || 'deepseek',
      prompt_used: plan.prompt_used,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getActiveAIPlan(userId: string, planType: 'workout' | 'diet'): Promise<DbAIPlan | null> {
  if (!isSupabaseConfigured()) return null;
  
  const { data, error } = await supabase
    .from('ai_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('plan_type', planType)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

// ==========================================
// DAILY LOGS
// ==========================================

export async function updateDailyLog(userId: string, updates: {
  calories_consumed?: number;
  calories_burned?: number;
  steps?: number;
  water_intake?: number;
  workout_completed?: boolean;
}) {
  if (!isSupabaseConfigured()) return null;
  
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('daily_logs')
    .upsert({
      user_id: userId,
      log_date: today,
      ...updates,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getDailyLog(userId: string, date?: string) {
  if (!isSupabaseConfigured()) return null;
  
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', targetDate)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

// ==========================================
// REAL-TIME SUBSCRIPTIONS
// ==========================================

export function subscribeToUserData(
  userId: string,
  table: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
}

// ==========================================
// HELPER
// ==========================================

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

