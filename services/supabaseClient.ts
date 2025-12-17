/**
 * Supabase Client for FitBridge
 * Handles authentication and real-time subscriptions
 */

import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Configuration - Replace with your Supabase project details
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
// AUTHENTICATION
// ==========================================

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

/**
 * Sign up with email and password
 */
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

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  
  // Store token for API calls
  if (data.session) {
    localStorage.setItem('fitbridge_token', data.user.id);
  }
  
  return data;
}

/**
 * Sign in with Google OAuth
 */
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

/**
 * Sign out
 */
export async function signOut() {
  localStorage.removeItem('fitbridge_token');
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) throw error;
  
  if (data.session) {
    localStorage.setItem('fitbridge_token', data.session.user.id);
  }
  
  return data.session;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

/**
 * Listen for auth state changes
 */
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
// USER PROFILE (Direct Supabase queries)
// ==========================================

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, updates: any) {
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
// STREAKS (Direct Supabase queries)
// ==========================================

export async function getUserStreaks(userId: string) {
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
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
// HELPER: Check if Supabase is configured
// ==========================================

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
