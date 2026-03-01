
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Flame, Utensils, Play, MessageSquare, Zap, Shield, TrendingUp,
  CheckCircle2, Circle, ChevronRight, Star, Droplets, Moon, Dumbbell
} from 'lucide-react';
import { UserProfile, AppTab } from '../types';

interface DashboardProps {
  user: UserProfile;
  onNavigate: (tab: AppTab) => void;
}

// ── Types ──────────────────────────────────────────────────────────────────
interface WorkoutEntry {
  id: string;
  activity?: string;
  title?: string;
  calories?: number;
  timestamp: number;
  calories_burned?: number;
  workout_date?: string;
}

interface MealEntry {
  id: string;
  calories?: number;
  protein?: number;
  timestamp: number;
}

interface StreakRecord {
  streak_type: string;
  current_streak?: number;
  last_activity_date?: string;
}

interface XPRecord {
  xp: number;
}

// ── XP Levels ─────────────────────────────────────────────────────────────
const XP_LEVELS = [
  { level: 'Rookie',    minXP: 0,    maxXP: 500,   color: '#6b7280', emoji: '🌱' },
  { level: 'Athlete',  minXP: 500,  maxXP: 1500,  color: '#3b82f6', emoji: '💪' },
  { level: 'Warrior',  minXP: 1500, maxXP: 3000,  color: '#8b5cf6', emoji: '⚔️' },
  { level: 'Elite',    minXP: 3000, maxXP: 5000,  color: '#f59e0b', emoji: '🏆' },
  { level: 'Legend',   minXP: 5000, maxXP: 10000, color: '#ef4444', emoji: '👑' },
];

const MOTIVATIONAL_QUOTES = [
  "Progress is built day by day.",
  "The only bad workout is the one that didn't happen.",
  "Fuel your ambition. Guard your streak.",
  "Every rep counts. Every meal matters.",
  "Strong body, stronger mind.",
];

// ── Count-up hook ──────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 900): number {
  const [val, setVal] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (ref.current) clearInterval(ref.current);
    if (target === 0) { setVal(0); return; }
    let current = 0;
    const steps = 30;
    const increment = Math.ceil(target / steps);
    ref.current = setInterval(() => {
      current += increment;
      if (current >= target) { setVal(target); clearInterval(ref.current!); }
      else setVal(current);
    }, duration / steps);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [target, duration]);
  return val;
}

// ── Ring Progress ──────────────────────────────────────────────────────────
interface RingProps {
  size?: number;
  strokeWidth?: number;
  progress?: number;
  color?: string;
  bg?: string;
  children?: React.ReactNode;
}
const RingProgress: React.FC<RingProps> = ({
  size = 64, strokeWidth = 6, progress = 0,
  color = '#22c55e', bg = '#1c1c1e', children
}) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(progress / 100, 1);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
};

// ── Streak Day Dot ─────────────────────────────────────────────────────────
interface StreakDayProps { label: string; active: boolean; isToday: boolean; }
const StreakDay: React.FC<StreakDayProps> = ({ label, active, isToday }) => (
  <div className="flex flex-col items-center gap-1.5">
    <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: isToday ? '#f97316' : 'transparent' }}>
      {isToday ? 'Today' : '.'}
    </span>
    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
      active
        ? 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.5)]'
        : isToday
        ? 'border-2 border-orange-500/40 border-dashed'
        : ''
    }`}
      style={{ background: active ? undefined : isToday ? 'rgba(249,115,22,0.06)' : '#111' }}
    >
      {active
        ? <Flame size={15} className="fill-white text-white" />
        : isToday
        ? <Flame size={15} className="text-orange-500/50" />
        : <span className="text-[10px] font-black text-zinc-700">{label}</span>
      }
    </div>
  </div>
);

// ── Goal item type ─────────────────────────────────────────────────────────
interface GoalItem { id: string; label: string; icon: React.FC<{ size: number; style?: React.CSSProperties }>; color: string; done: boolean; }

// ── Dashboard ──────────────────────────────────────────────────────────────
export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);
  const [todayWorkout, setTodayWorkout] = useState<string | null>(null);
  const [lastActivityDate, setLastActivityDate] = useState<string | null>(null);
  const [todayProtein, setTodayProtein] = useState(0);
  const [todayWorkoutCalsBurned, setTodayWorkoutCalsBurned] = useState(0);
  const [dailyGoals, setDailyGoals] = useState<GoalItem[]>([
    { id: 'workout',  label: 'Complete a Workout', icon: Dumbbell,  color: '#3b82f6', done: false },
    { id: 'meals',    label: 'Log All Meals',       icon: Utensils,  color: '#22c55e', done: false },
    { id: 'hydrate',  label: 'Stay Hydrated',       icon: Droplets,  color: '#06b6d4', done: false },
    { id: 'rest',     label: 'Get Quality Sleep',   icon: Moon,      color: '#8b5cf6', done: false },
  ]);
  const [quote] = useState(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  const [isLoading, setIsLoading] = useState(true);

  // Animated counts
  const animStreak  = useCountUp(streak);
  const animXp      = useCountUp(xp);
  const animCals    = useCountUp(todayCalories);
  const animBurned  = useCountUp(todayWorkoutCalsBurned);

  // ── Load data (stable ref, safe for useEffect deps) ───────────────────
  const loadDashboardData = useCallback(async () => {
    const userId = localStorage.getItem('fitbridge_token');
    try {
      const { isSupabaseConfigured, getTotalXP, getUserStreaks, getWorkoutLogs, getDietLogs } =
        await import('../services/supabaseClient');

      if (isSupabaseConfigured() && userId) {
        const [xpData, streaks, workouts, meals] = await Promise.all([
          getTotalXP(userId) as Promise<XPRecord>,
          getUserStreaks(userId) as Promise<StreakRecord[]>,
          getWorkoutLogs(userId, 10) as Promise<WorkoutEntry[]>,
          getDietLogs(userId, new Date().toISOString().split('T')[0], 20) as Promise<MealEntry[]>,
        ]);

        setXp(xpData.xp);

        const workoutStreak = streaks.find(s => s.streak_type === 'workout');
        if (!workoutStreak || !workoutStreak.current_streak) {
          const savedWorkouts: WorkoutEntry[] = JSON.parse(localStorage.getItem('fitbridge_manual_workouts') || '[]');
          let streakCount = 0;
          if (savedWorkouts.length > 0) {
            const sorted = [...savedWorkouts].sort((a, b) => b.timestamp - a.timestamp);
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const checkDate = new Date(today);
            let found = true;
            while (found && streakCount < 365) {
              const hasW = sorted.some(w => {
                const wd = new Date(w.timestamp); wd.setHours(0, 0, 0, 0);
                return wd.getTime() === checkDate.getTime();
              });
              if (hasW) { streakCount++; checkDate.setDate(checkDate.getDate() - 1); }
              else if (checkDate.getTime() === today.getTime()) { checkDate.setDate(checkDate.getDate() - 1); }
              else found = false;
            }
          }
          setStreak(streakCount);
        } else {
          setStreak(workoutStreak.current_streak);
        }

        setLastActivityDate(workoutStreak?.last_activity_date ?? null);

        const todayStr = new Date().toISOString().split('T')[0];
        const todayWorkouts = workouts.filter(w => w.workout_date === todayStr);
        if (todayWorkouts.length === 0) {
          const saved: WorkoutEntry[] = JSON.parse(localStorage.getItem('fitbridge_manual_workouts') || '[]');
          const base = new Date(); base.setHours(0, 0, 0, 0);
          const local = saved.filter(w => { const d = new Date(w.timestamp); d.setHours(0,0,0,0); return d.getTime() === base.getTime(); });
          setTodayWorkout(local[0]?.activity ?? null);
          setTodayWorkoutCalsBurned(local.reduce((s, w) => s + (w.calories ?? 0), 0));
        } else {
          setTodayWorkout(todayWorkouts[0].title ?? null);
          setTodayWorkoutCalsBurned(todayWorkouts.reduce((s, w) => s + (w.calories_burned ?? 0), 0));
        }

        setTodayCalories(meals.reduce((s, m) => s + (m.calories ?? 0), 0));
        setTodayProtein(meals.reduce((s, m) => s + (m.protein ?? 0), 0));

      } else {
        // localStorage fallback
        const saved = localStorage.getItem('fitbridge_dashboard_data');
        if (saved) {
          const data = JSON.parse(saved) as { streak?: number; xp?: number; todayCalories?: number; todayWorkout?: string; lastActivityDate?: string };
          setStreak(data.streak ?? 0);
          setXp(data.xp ?? 0);
          setTodayCalories(data.todayCalories ?? 0);
          setTodayWorkout(data.todayWorkout ?? null);
          setLastActivityDate(data.lastActivityDate ?? null);
        }
        const savedMeals: MealEntry[] = JSON.parse(localStorage.getItem('fitbridge_manual_meals') || '[]');
        const todayStr = new Date().toDateString();
        const todayMeals = savedMeals.filter(m => new Date(m.timestamp).toDateString() === todayStr);
        setTodayCalories(todayMeals.reduce((s, m) => s + (m.calories ?? 0), 0));
        setTodayProtein(todayMeals.reduce((s, m) => s + (m.protein ?? 0), 0));

        const savedWorkouts: WorkoutEntry[] = JSON.parse(localStorage.getItem('fitbridge_manual_workouts') || '[]');
        const localToday = savedWorkouts.filter(w => new Date(w.timestamp).toDateString() === todayStr);
        if (localToday.length > 0) {
          setTodayWorkout(localToday[0].activity ?? 'Workout');
          setTodayWorkoutCalsBurned(localToday.reduce((s, w) => s + (w.calories ?? 0), 0));
        }
      }
    } catch (err) {
      console.error('[Dashboard] load error:', err);
      const saved = localStorage.getItem('fitbridge_dashboard_data');
      if (saved) {
        const data = JSON.parse(saved) as { streak?: number; xp?: number };
        setStreak(data.streak ?? 0);
        setXp(data.xp ?? 0);
      }
    } finally {
      setIsLoading(false);
    }
  }, []); // stable — no external deps that change

  // ── Persist dashboard snapshot ─────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('fitbridge_dashboard_data', JSON.stringify({
      streak, xp, todayCalories, todayWorkout, lastActivityDate
    }));
  }, [streak, xp, todayCalories, todayWorkout, lastActivityDate]);

  // ── Initial load ────────────────────────────────────────────────────────
  useEffect(() => {
    loadDashboardData();
    const saved = localStorage.getItem('fitbridge_daily_goals_state');
    if (saved) {
      const state = JSON.parse(saved) as { date: string; goals: Record<string, boolean> };
      if (state.date === new Date().toDateString()) {
        setDailyGoals(prev => prev.map(g => ({ ...g, done: state.goals[g.id] ?? false })));
      }
    }
  }, [loadDashboardData]);

  // ── Periodic refresh ───────────────────────────────────────────────────
  useEffect(() => {
    const onStorage = () => loadDashboardData();
    window.addEventListener('storage', onStorage);
    const interval = setInterval(loadDashboardData, 15000);
    return () => { window.removeEventListener('storage', onStorage); clearInterval(interval); };
  }, [loadDashboardData]);

  // ── Expose global hook ─────────────────────────────────────────────────
  const recordActivity = useCallback((xpEarned = 10) => {
    const today = new Date().toDateString();
    setXp(prev => prev + xpEarned);
    if (lastActivityDate !== today) { setStreak(prev => prev + 1); setLastActivityDate(today); }
  }, [lastActivityDate]);

  useEffect(() => {
    (window as Record<string, unknown>)['recordFitbridgeActivity'] = recordActivity;
  }, [recordActivity]);

  // ── Goal toggle ────────────────────────────────────────────────────────
  const toggleGoal = (id: string) => {
    setDailyGoals(prev => {
      const updated = prev.map(g => g.id === id ? { ...g, done: !g.done } : g);
      localStorage.setItem('fitbridge_daily_goals_state', JSON.stringify({
        date: new Date().toDateString(),
        goals: Object.fromEntries(updated.map(g => [g.id, g.done]))
      }));
      return updated;
    });
  };

  // ── Level ──────────────────────────────────────────────────────────────
  const currentLevel = XP_LEVELS.slice().reverse().find(l => xp >= l.minXP) ?? XP_LEVELS[0];
  const levelProgress = Math.min(100, Math.round(((xp - currentLevel.minXP) / (currentLevel.maxXP - currentLevel.minXP)) * 100));

  // ── Daily load ─────────────────────────────────────────────────────────
  const dailyLoad = Math.min(100, Math.round(
    (todayWorkout ? 40 : 0) +
    Math.min((todayCalories / 2000) * 30, 30) +
    (todayWorkoutCalsBurned > 200 ? 20 : todayWorkoutCalsBurned > 0 ? 10 : 0) +
    (todayProtein > 50 ? 10 : 0)
  ));

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      active: streak > 0 && i >= 7 - streak,
      isToday: i === 6,
    };
  });

  const goalsCompleted = dailyGoals.filter(g => g.done).length;
  const calProgress   = Math.min(100, Math.round((todayCalories / 2000) * 100));
  const proteinProgress = Math.min(100, Math.round((todayProtein / 120) * 100));

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 18 ? 'Good afternoon' : 'Good evening';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-40 animate-fade-in min-h-screen" style={{ background: '#080808' }}>

      {/* Header */}
      <div className="px-5 pt-12 pb-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-[0.15em] mb-1">{greeting}</p>
          <h1 className="text-[28px] font-black text-white tracking-tight leading-none">{user.name.split(' ')[0]} 👋</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-orange-500/30">
            <img src={`https://picsum.photos/seed/${user.name}/200`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-full border border-white/5">
            <Zap size={10} fill={currentLevel.color} color={currentLevel.color} />
            <span className="text-[10px] font-black text-white">{animXp} XP</span>
          </div>
        </div>
      </div>

      {/* Streak Hero */}
      <div className="mx-4 mb-4 rounded-[24px] overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #0f0f0f 60%, #1a0a00 100%)', border: '1px solid rgba(249,115,22,0.2)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.12) 0%, transparent 65%)' }} />
        <div className="relative z-10 p-5 pb-4">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame size={18} className={streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-zinc-600'} />
                <span className="text-[10px] font-black text-orange-500/70 uppercase tracking-[0.2em]">Day Streak</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-[56px] font-black text-white leading-none tracking-tighter">{animStreak}</span>
                <span className="mb-2 text-zinc-600 font-bold text-sm">days</span>
              </div>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                {streak === 0 ? 'Start your streak today!' : streak < 3 ? 'Keep it going!' : streak < 7 ? "You're on fire 🔥" : streak < 30 ? 'Unstoppable! 🏆' : 'Legendary! 👑'}
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center border" style={{ background: 'rgba(0,0,0,0.4)', borderColor: currentLevel.color + '40' }}>
                <span className="text-2xl leading-none">{currentLevel.emoji}</span>
                <span className="text-[9px] font-black uppercase tracking-wider mt-1" style={{ color: currentLevel.color }}>{currentLevel.level}</span>
              </div>
              <div className="w-16">
                <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${levelProgress}%`, background: currentLevel.color }} />
                </div>
                <p className="text-[8px] text-center text-zinc-600 font-bold mt-0.5">{levelProgress}% to next</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end px-1">
            {last7Days.map((day, i) => <StreakDay key={i} label={day.label} active={day.active} isToday={day.isToday} />)}
          </div>

          {streak > 2 && (
            <div className="mt-4 flex items-center gap-2 bg-black/30 rounded-2xl p-3 border border-white/5">
              <Shield size={14} className="text-blue-400" />
              <span className="text-xs font-bold text-zinc-400">Streak Shield active — you're protected</span>
              <Star size={10} className="text-yellow-500 fill-yellow-500 ml-auto" />
            </div>
          )}
        </div>
      </div>

      {/* Daily Load */}
      <div className="mx-4 mb-4 rounded-[24px] p-5" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em] mb-0.5">Daily Load</p>
            <p className="text-xs text-zinc-600 font-medium">Today's performance score</p>
          </div>
          <RingProgress size={72} strokeWidth={7} progress={dailyLoad}
            color={dailyLoad >= 80 ? '#22c55e' : dailyLoad >= 50 ? '#f59e0b' : dailyLoad >= 20 ? '#3b82f6' : '#374151'} bg="#1c1c1e">
            <span className="text-sm font-black text-white">{dailyLoad}</span>
          </RingProgress>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'kcal in',  val: animCals,   color: '#22c55e' },
            { label: 'kcal out', val: animBurned, color: '#f97316' },
            { label: 'protein',  val: todayProtein, color: '#3b82f6', suffix: 'g' },
          ].map(m => (
            <div key={m.label} className="rounded-2xl p-3 text-center" style={{ background: '#1a1a1a' }}>
              <span className="block text-lg font-black leading-none" style={{ color: m.color }}>{m.val}{m.suffix ?? ''}</span>
              <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">{m.label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {[
            { label: 'Calories', progress: calProgress,     color: '#22c55e', current: todayCalories, goal: 2000, unit: 'kcal' },
            { label: 'Protein',  progress: proteinProgress, color: '#3b82f6', current: todayProtein,   goal: 120,  unit: 'g' },
          ].map(bar => (
            <div key={bar.label}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-bold text-zinc-500">{bar.label}</span>
                <span className="text-[10px] font-black text-zinc-400">{bar.current}<span className="text-zinc-700"> / {bar.goal}{bar.unit}</span></span>
              </div>
              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${bar.progress}%`, background: bar.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Workout */}
      {todayWorkout ? (
        <div className="mx-4 mb-4 rounded-[24px] p-4 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, transparent 100%)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={20} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-blue-500/70 uppercase tracking-widest">Today's Workout</p>
            <p className="text-sm font-black text-white truncate">{todayWorkout}</p>
          </div>
          <TrendingUp size={16} className="text-blue-400 flex-shrink-0" />
        </div>
      ) : (
        <div className="mx-4 mb-4 rounded-[24px] p-4 flex items-center gap-3"
          style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center flex-shrink-0">
            <Circle size={20} className="text-zinc-700" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Today's Workout</p>
            <p className="text-sm font-bold text-zinc-500">Not logged yet</p>
          </div>
          <button onClick={() => onNavigate(AppTab.WORKOUT)} className="text-xs font-black text-blue-500 flex items-center gap-0.5 flex-shrink-0">
            Start <ChevronRight size={12} />
          </button>
        </div>
      )}

      {/* Daily Goals */}
      <div className="mx-4 mb-4 rounded-[24px] p-5" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em] mb-0.5">Daily Goals</p>
            <p className="text-xs text-zinc-600 font-medium">{goalsCompleted} of {dailyGoals.length} complete</p>
          </div>
          <div className="flex items-center gap-1">
            {dailyGoals.map((g, i) => (
              <div key={i} className="w-2 h-2 rounded-full transition-all" style={{ background: g.done ? '#22c55e' : '#27272a' }} />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {dailyGoals.map(goal => (
            <button key={goal.id} onClick={() => toggleGoal(goal.id)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left active:scale-[0.98]"
              style={{ background: goal.done ? 'rgba(34,197,94,0.05)' : '#1a1a1a', border: goal.done ? '1px solid rgba(34,197,94,0.15)' : '1px solid transparent' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: goal.done ? goal.color + '20' : '#252525' }}>
                <goal.icon size={16} style={{ color: goal.done ? goal.color : '#52525b' }} />
              </div>
              <span className={`flex-1 text-sm font-bold transition-all ${goal.done ? 'text-zinc-500 line-through' : 'text-white'}`}>{goal.label}</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${goal.done ? 'border-green-500 bg-green-500' : 'border-zinc-700'}`}>
                {goal.done && <span className="text-white text-[10px] font-black">✓</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quote */}
      <div className="mx-4 mb-6 px-4 py-3 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
        <p className="text-xs font-semibold text-zinc-600 italic">"{quote}"</p>
      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-[84px] left-4 right-4 z-30 flex gap-2.5">
        <button onClick={() => onNavigate(AppTab.CHAT)}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-[18px] transition-all active:scale-95"
          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
          <MessageSquare size={16} className="text-pink-400" />
          <span className="text-xs font-black text-white uppercase tracking-wider">AI Coach</span>
        </button>
        <button onClick={() => onNavigate(AppTab.DIET)}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-[18px] transition-all active:scale-95"
          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Utensils size={16} className="text-green-400" />
          <span className="text-xs font-black text-white uppercase tracking-wider">Diet</span>
        </button>
        <button onClick={() => onNavigate(AppTab.WORKOUT)}
          className="flex-[1.4] flex items-center justify-center gap-2 py-4 rounded-[18px] transition-all active:scale-95 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #ff6b35 0%, #f97316 100%)', boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}>
          <Play size={16} className="text-white fill-white" />
          <span className="text-xs font-black text-white uppercase tracking-wider">Workout</span>
        </button>
      </div>
    </div>
  );
};
