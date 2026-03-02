import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from 'recharts';
import {
  Flame,
  Utensils,
  Scale,
  Plus,
  Target,
  Activity,
  Trash2,
  Zap,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  X,
} from 'lucide-react';

// ── Tiny animated counter ──────────────────────────────────────────────────
const AnimNum = ({ v, suffix = '' }: { v: number; suffix?: string }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (ref.current) clearInterval(ref.current);
    if (v === 0) {
      setDisplay(0);
      return;
    }
    let curr = 0;
    const steps = 28;
    const inc = Math.ceil(v / steps);
    ref.current = setInterval(() => {
      curr += inc;
      if (curr >= v) {
        setDisplay(v);
        clearInterval(ref.current!);
      } else setDisplay(curr);
    }, 900 / steps);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [v]);
  return (
    <span>
      {display}
      {suffix}
    </span>
  );
};

// ── Trend badge ────────────────────────────────────────────────────────────
const TrendBadge = ({
  value,
  unit = '',
  inverse = false,
}: {
  value: number;
  unit?: string;
  inverse?: boolean;
}) => {
  const positive = inverse ? value < 0 : value > 0;
  const neutral = value === 0;
  const Icon = neutral ? Minus : positive ? TrendingUp : TrendingDown;
  const color = neutral ? '#52525b' : positive ? '#22c55e' : '#ef4444';
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-xl"
      style={{ background: color + '15', color }}
    >
      <Icon size={9} />
      {value > 0 ? '+' : ''}
      {value}
      {unit}
    </span>
  );
};

// ── Raw data types (from localStorage / Supabase) ─────────────────────────
interface RawWorkout {
  id?: string;
  title?: string;
  activity?: string;
  duration?: number;
  duration_minutes?: number;
  calories?: number;
  calories_burned?: number;
  timestamp?: number;
  workout_date?: string;
  created_at?: string;
}
interface RawMeal {
  id?: string;
  meal_name?: string;
  name?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  timestamp?: number;
  log_date?: string;
  created_at?: string;
}
interface ChartPayloadEntry {
  name: string;
  value: number;
  color?: string;
}

// ── Custom tooltip base ────────────────────────────────────────────────────
const ChartTooltip = ({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: ChartPayloadEntry[];
  label?: string;
  formatter?: (value: number, name: string) => string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#111',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: '10px 14px',
        minWidth: 120,
      }}
    >
      <p
        style={{
          fontSize: 10,
          color: '#71717a',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 6,
        }}
      >
        {label}
      </p>
      {payload.map((p, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 20,
            fontSize: 12,
            fontWeight: 700,
            color: p.color || '#fff',
            marginBottom: 2,
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>{p.name}</span>
          <span>{formatter ? formatter(p.value, p.name) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Section Header ─────────────────────────────────────────────────────────
const SectionHeader = ({
  icon: Icon,
  color,
  title,
  sub,
}: {
  icon: React.FC<{ size: number; style?: React.CSSProperties }>;
  color: string;
  title: string;
  sub?: string;
}) => (
  <div className="flex items-center gap-2 mb-4">
    <div
      className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: color + '18' }}
    >
      <Icon size={14} style={{ color }} />
    </div>
    <div>
      <h3 className="text-sm font-black text-white leading-none">{title}</h3>
      {sub && <p className="text-[10px] text-zinc-600 font-medium mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Stat Mini Card ─────────────────────────────────────────────────────────
const MiniStat = ({
  label,
  value,
  color,
  suffix = '',
}: {
  label: string;
  value: number;
  color: string;
  suffix?: string;
}) => (
  <div className="rounded-2xl p-3 text-center" style={{ background: '#1a1a1a' }}>
    <span className="block text-lg font-black leading-none" style={{ color }}>
      <AnimNum v={value} suffix={suffix} />
    </span>
    <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1">
      {label}
    </span>
  </div>
);

// ── Interfaces ─────────────────────────────────────────────────────────────
interface WeightLog {
  id: string;
  weight: number;
  date: string;
  timestamp: number;
}
interface DailyStats {
  date: string;
  dayName: string;
  weekday: string;
  dayNumber: number;
  caloriesIn: number;
  caloriesOut: number;
  hasWorkout: boolean;
  workoutDuration: number;
  netCalories: number;
  protein: number;
}
interface PeriodSummary {
  id: string;
  label: string;
  subLabel: string;
  workoutCount: number;
  totalDuration: number;
  avgWeight: number;
  caloriesBurned: number;
  caloriesIn: number;
}

// ── Main Component ─────────────────────────────────────────────────────────
export const ActivityTab: React.FC = () => {
  const [view, setView] = useState<'Week' | 'Month'>('Week');
  const [weights, setWeights] = useState<WeightLog[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [periodHistory, setPeriodHistory] = useState<PeriodSummary[]>([]);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);
  const [activeChart, setActiveChart] = useState<'calories' | 'workout'>('calories');

  const loadData = useCallback(async () => {
    // Weight logs
    const savedWeights = localStorage.getItem('fitbridge_weight_logs');
    let loadedWeights: WeightLog[] = savedWeights ? JSON.parse(savedWeights) : [];
    loadedWeights = loadedWeights.sort((a, b) => a.timestamp - b.timestamp);
    setWeights(loadedWeights);

    let savedWorkouts: RawWorkout[] = JSON.parse(
      localStorage.getItem('fitbridge_manual_workouts') || '[]'
    );
    let savedMeals: RawMeal[] = JSON.parse(localStorage.getItem('fitbridge_manual_meals') || '[]');

    try {
      const { getWorkoutLogs, getDietLogs, isSupabaseConfigured } =
        await import('../services/supabaseClient');
      const userId = localStorage.getItem('fitbridge_token');
      if (isSupabaseConfigured() && userId) {
        const [dbWorkouts, dbMeals] = await Promise.all([
          getWorkoutLogs(userId, 200),
          getDietLogs(userId, undefined, 200),
        ]);
        if (dbWorkouts?.length > 0) {
          const dbMapped: RawWorkout[] = (dbWorkouts as RawWorkout[]).map((w) => ({
            id: w.id,
            title: w.title,
            duration: w.duration_minutes ?? 0,
            calories: w.calories_burned ?? 0,
            timestamp: new Date(w.workout_date ?? w.created_at ?? Date.now()).getTime(),
          }));
          const localIds = new Set(dbMapped.map((w) => w.id));
          savedWorkouts = [...dbMapped, ...savedWorkouts.filter((w) => !localIds.has(w.id))];
          localStorage.setItem('fitbridge_manual_workouts', JSON.stringify(savedWorkouts));
        }
        if (dbMeals?.length > 0) {
          const dbMapped: RawMeal[] = (dbMeals as RawMeal[]).map((m) => ({
            id: m.id,
            name: m.meal_name,
            calories: m.calories ?? 0,
            protein: m.protein ?? 0,
            carbs: m.carbs ?? 0,
            fats: m.fats ?? 0,
            timestamp: new Date(
              m.log_date ? `${m.log_date}T12:00:00` : (m.created_at ?? Date.now())
            ).getTime(),
          }));
          const localIds = new Set(dbMapped.map((m) => m.id));
          savedMeals = [...dbMapped, ...savedMeals.filter((m) => !localIds.has(m.id))];
          localStorage.setItem('fitbridge_manual_meals', JSON.stringify(savedMeals));
        }
      }
    } catch (err) {
      console.warn('Supabase load skipped:', err);
    }

    // Daily stats
    const daysBack = view === 'Week' ? 7 : 30;
    const stats: DailyStats[] = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dateStr = d.toLocaleDateString();
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = d.getDate();
      const dayMeals = savedMeals.filter((m) => {
        const md = new Date(m.timestamp ?? 0);
        md.setHours(0, 0, 0, 0);
        return md.getTime() === d.getTime();
      });
      const calsIn = dayMeals.reduce((s, m) => s + (m.calories ?? 0), 0);
      const protein = dayMeals.reduce((s, m) => s + (m.protein ?? 0), 0);
      const dayWorkouts = savedWorkouts.filter((w) => {
        const wd = new Date(w.timestamp ?? 0);
        wd.setHours(0, 0, 0, 0);
        return wd.getTime() === d.getTime();
      });
      const calsOut = dayWorkouts.reduce((s, w) => s + (w.calories ?? 0), 0);
      const dur = dayWorkouts.reduce((s, w) => s + (w.duration ?? 0), 0);
      stats.push({
        date: dateStr,
        weekday,
        dayNumber,
        dayName: `${weekday} ${dayNumber}`,
        caloriesIn: calsIn,
        caloriesOut: calsOut,
        hasWorkout: dayWorkouts.length > 0,
        workoutDuration: dur,
        netCalories: calsIn - calsOut,
        protein,
      });
    }
    setDailyStats(stats);

    // Period history
    const history: PeriodSummary[] = [];
    for (let i = 0; i < 6; i++) {
      let label = '',
        subLabel = '',
        startTime = 0,
        endTime = 0;
      if (view === 'Week') {
        const start = new Date();
        start.setDate(start.getDate() - start.getDay() + 1 - i * 7);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        startTime = start.getTime();
        endTime = end.getTime();
        label = i === 0 ? 'This Week' : `Week ${getWeekNum(start)}`;
        subLabel = `${start.getDate()}/${start.getMonth() + 1} – ${end.getDate()}/${end.getMonth() + 1}`;
      } else {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        startTime = d.getTime();
        endTime = end.getTime();
        label = d.toLocaleDateString('en-US', { month: 'long' });
        subLabel = d.getFullYear().toString();
      }
      const pw = savedWorkouts.filter(
        (w) => (w.timestamp ?? 0) >= startTime && (w.timestamp ?? 0) <= endTime
      );
      const pm = savedMeals.filter(
        (m) => (m.timestamp ?? 0) >= startTime && (m.timestamp ?? 0) <= endTime
      );
      const pw2 = loadedWeights.filter(
        (w: WeightLog) => w.timestamp >= startTime && w.timestamp <= endTime
      );
      const avgW = pw2.length ? pw2.reduce((s, w) => s + w.weight, 0) / pw2.length : 0;
      if (i === 0 || pw.length > 0 || pw2.length > 0) {
        history.push({
          id: i.toString(),
          label,
          subLabel,
          workoutCount: pw.length,
          totalDuration: pw.reduce((s, w) => s + (w.duration ?? 0), 0),
          avgWeight: avgW,
          caloriesBurned: pw.reduce((s, w) => s + (w.calories ?? 0), 0),
          caloriesIn: pm.reduce((s, m) => s + (m.calories ?? 0), 0),
        });
      }
    }
    setPeriodHistory(history);
  }, [view]); // view is the only external dep

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getWeekNum = (d: Date) => {
    const jan = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - jan.getTime()) / 86400000 + jan.getDay() + 1) / 7);
  };

  const handleAddWeight = () => {
    if (!newWeight) return;
    const wv = parseFloat(newWeight);
    if (isNaN(wv)) return;
    const log: WeightLog = {
      id: Date.now().toString(),
      weight: wv,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now(),
    };
    const updated = [...weights, log].sort((a, b) => a.timestamp - b.timestamp);
    setWeights(updated);
    localStorage.setItem('fitbridge_weight_logs', JSON.stringify(updated));
    setNewWeight('');
    setShowWeightModal(false);
  };

  const deleteWeightLog = (id: string) => {
    const updated = weights.filter((w) => w.id !== id);
    setWeights(updated);
    localStorage.setItem('fitbridge_weight_logs', JSON.stringify(updated));
  };

  // ── Derived numbers ──
  const currentWeight = weights.length > 0 ? weights[weights.length - 1].weight : 0;
  const prevWeight = weights.length > 1 ? weights[weights.length - 2].weight : currentWeight;
  const weightTrend = parseFloat((currentWeight - prevWeight).toFixed(1));
  const todayStats = dailyStats[dailyStats.length - 1] || {
    caloriesIn: 0,
    caloriesOut: 0,
    protein: 0,
  };
  const netCals = todayStats.caloriesIn - todayStats.caloriesOut;

  const totalCalIn = dailyStats.reduce((s, d) => s + d.caloriesIn, 0);
  const totalCalOut = dailyStats.reduce((s, d) => s + d.caloriesOut, 0);
  const activeDays = dailyStats.filter((d) => d.caloriesIn > 0 || d.caloriesOut > 0).length || 1;
  const avgIn = Math.round(totalCalIn / activeDays);
  const avgOut = Math.round(totalCalOut / activeDays);
  const avgNet = avgIn - avgOut;

  let currentStreak = 0;
  for (let i = dailyStats.length - 1; i >= 0; i--) {
    if (dailyStats[i].hasWorkout) currentStreak++;
    else break;
  }
  const workoutDays = dailyStats.filter((d) => d.hasWorkout).length;
  const loggedDays = dailyStats.filter((d) => d.caloriesIn > 0 || d.hasWorkout).length;
  const totalDuration = dailyStats.reduce((s, d) => s + d.workoutDuration, 0);

  const cp = periodHistory[0] || {
    workoutCount: 0,
    totalDuration: 0,
    caloriesBurned: 0,
    caloriesIn: 0,
  };
  const pp = periodHistory[1] || {
    workoutCount: 0,
    totalDuration: 0,
    caloriesBurned: 0,
    caloriesIn: 0,
  };
  const workoutTrend = cp.workoutCount - pp.workoutCount;

  // Smart insight
  const getInsight = () => {
    if (cp.workoutCount === 0 && netCals > 200)
      return {
        type: 'warn',
        title: 'Action Needed',
        msg: "You're at a surplus with no workouts. Move today!",
        icon: AlertCircle,
        color: '#f97316',
      };
    if (workoutTrend > 0)
      return {
        type: 'success',
        title: 'Crushing It',
        msg: `${workoutTrend} more workouts than last period!`,
        icon: TrendingUp,
        color: '#22c55e',
      };
    if (weightTrend < 0 && netCals < 0)
      return {
        type: 'success',
        title: 'On Track',
        msg: 'Weight trending down with a calorie deficit. Perfect!',
        icon: Target,
        color: '#3b82f6',
      };
    return {
      type: 'neutral',
      title: 'Keep Going',
      msg: `${loggedDays}/${dailyStats.length} days tracked this ${view.toLowerCase()}.`,
      icon: Zap,
      color: '#8b5cf6',
    };
  };
  const insight = getInsight();
  const InsightIcon = insight.icon;

  // Macro radar data
  const totalProtein = dailyStats.reduce((s, d) => s + d.protein, 0);
  // Estimate carbs/fats from caloric ratio (rough – actual data if logged)
  const macroTarget = { protein: 120, carbs: 250, fats: 70 };
  const radarData = [
    {
      subject: 'Protein',
      A: Math.min(
        100,
        Math.round((totalProtein / (macroTarget.protein * dailyStats.length)) * 100)
      ),
      fullMark: 100,
    },
    {
      subject: 'Workouts',
      A: Math.min(100, Math.round((workoutDays / Math.max(dailyStats.length, 1)) * 100)),
      fullMark: 100,
    },
    { subject: 'Calories', A: Math.min(100, Math.round((avgIn / 2000) * 100)), fullMark: 100 },
    { subject: 'Streak', A: Math.min(100, Math.round((currentStreak / 7) * 100)), fullMark: 100 },
    {
      subject: 'Deficit',
      A: avgNet < 0 ? Math.min(100, Math.round((Math.abs(avgNet) / 500) * 100)) : 0,
      fullMark: 100,
    },
  ];

  return (
    <div className="pb-40 min-h-screen animate-fade-in" style={{ background: '#080808' }}>
      {/* ── Header ── */}
      <div className="px-5 pt-12 pb-5 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.15em] mb-1">
            Performance
          </p>
          <h1 className="text-[28px] font-black text-white tracking-tight leading-none">
            Activity
          </h1>
        </div>
        <div className="bg-zinc-900 border border-white/5 p-1 rounded-2xl flex gap-1">
          {(['Week', 'Month'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
              style={{
                background: view === v ? '#222' : 'transparent',
                color: view === v ? '#fff' : '#52525b',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* ── SMART COACH INSIGHT ── */}
      <div
        className="mx-4 mb-4 rounded-[24px] p-4 flex items-start gap-3"
        style={{ background: insight.color + '10', border: `1px solid ${insight.color}25` }}
      >
        <div
          className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: insight.color + '20' }}
        >
          <InsightIcon size={16} style={{ color: insight.color }} />
        </div>
        <div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">
            Smart Coach
          </p>
          <h4 className="text-sm font-black leading-none mb-1" style={{ color: insight.color }}>
            {insight.title}
          </h4>
          <p className="text-xs text-zinc-400 font-medium leading-relaxed">{insight.msg}</p>
        </div>
      </div>

      {/* ── TOP STATS ROW ── */}
      <div className="mx-4 mb-4 grid grid-cols-4 gap-2">
        <div
          className="rounded-[20px] p-3 text-center"
          style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <Flame size={14} className="mx-auto mb-1.5 text-orange-500" />
          <span className="block text-xl font-black text-white leading-none">{currentStreak}</span>
          <span className="block text-[8px] font-bold text-zinc-600 uppercase tracking-wider mt-0.5">
            Streak
          </span>
        </div>
        <div
          className="rounded-[20px] p-3 text-center"
          style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <Dumbbell size={14} className="mx-auto mb-1.5 text-blue-500" />
          <span className="block text-xl font-black text-white leading-none">
            {workoutDays}
            <span className="text-xs text-zinc-600">/{dailyStats.length}</span>
          </span>
          <span className="block text-[8px] font-bold text-zinc-600 uppercase tracking-wider mt-0.5">
            Sessions
          </span>
        </div>
        <div
          className="rounded-[20px] p-3 text-center"
          style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <Activity size={14} className="mx-auto mb-1.5 text-green-500" />
          <span className="block text-xl font-black text-white leading-none">
            {totalDuration}
            <span className="text-xs text-zinc-600">m</span>
          </span>
          <span className="block text-[8px] font-bold text-zinc-600 uppercase tracking-wider mt-0.5">
            Active
          </span>
        </div>
        <div
          className="rounded-[20px] p-3 text-center"
          style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <Target size={14} className="mx-auto mb-1.5 text-purple-500" />
          <span className="block text-xl font-black text-white leading-none">
            {loggedDays}
            <span className="text-xs text-zinc-600">/{dailyStats.length}</span>
          </span>
          <span className="block text-[8px] font-bold text-zinc-600 uppercase tracking-wider mt-0.5">
            Logged
          </span>
        </div>
      </div>

      {/* ── WEEKLY HEATMAP ── */}
      <div
        className="mx-4 mb-4 rounded-[24px] p-5"
        style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <SectionHeader
          icon={Calendar}
          color="#f97316"
          title={`${view}ly Overview`}
          sub="Activity intensity by day"
        />
        <div className="flex gap-2 justify-between">
          {dailyStats.slice(-7).map((d, i) => {
            const intensity = d.caloriesOut + d.caloriesIn + (d.hasWorkout ? 600 : 0);
            let bg = '#1a1a1a';
            let glow = false;
            if (intensity > 2500) {
              bg = '#16a34a';
              glow = true;
            } else if (intensity > 1500) {
              bg = 'rgba(34,197,94,0.5)';
            } else if (intensity > 500) {
              bg = 'rgba(34,197,94,0.25)';
            }
            const isToday = i === dailyStats.slice(-7).length - 1;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className="w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all relative"
                  style={{
                    background: bg,
                    boxShadow: glow ? '0 0 10px rgba(34,197,94,0.3)' : 'none',
                    border: isToday
                      ? '1.5px solid rgba(255,255,255,0.15)'
                      : '1px solid transparent',
                  }}
                >
                  {d.hasWorkout && <Dumbbell size={11} className="text-white/80 mb-0.5" />}
                  {d.caloriesIn > 0 && (
                    <Utensils
                      size={9}
                      style={{
                        color: d.hasWorkout ? 'rgba(255,255,255,0.5)' : 'rgba(34,197,94,0.6)',
                      }}
                    />
                  )}
                </div>
                <span className="text-[9px] font-bold text-zinc-600">{d.weekday}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 mt-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-zinc-800" />
            <span className="text-[9px] text-zinc-600 font-bold">Inactive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: 'rgba(34,197,94,0.25)' }}
            />
            <span className="text-[9px] text-zinc-600 font-bold">Light</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#16a34a' }} />
            <span className="text-[9px] text-zinc-600 font-bold">Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Dumbbell size={9} className="text-zinc-500" />
            <span className="text-[9px] text-zinc-600 font-bold">Workout</span>
          </div>
        </div>
      </div>

      {/* ── ENERGY BALANCE CHART ── */}
      <div
        className="mx-4 mb-4 rounded-[24px] p-5"
        style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <SectionHeader
          icon={Zap}
          color="#f59e0b"
          title="Energy Balance"
          sub={`Avg ${avgIn} kcal in · ${avgOut} kcal out`}
        />

        {/* Tab toggle */}
        <div className="flex gap-2 mb-4">
          {(['calories', 'workout'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setActiveChart(c)}
              className="flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
              style={{
                background: activeChart === c ? '#222' : 'transparent',
                color: activeChart === c ? '#fff' : '#52525b',
                border:
                  activeChart === c ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
              }}
            >
              {c === 'calories' ? 'Calories' : 'Workout Min'}
            </button>
          ))}
        </div>

        {/* Avg stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <MiniStat label="Avg In" value={avgIn} color="#22c55e" suffix=" kcal" />
          <MiniStat label="Avg Out" value={avgOut} color="#f97316" suffix=" kcal" />
          <div className="rounded-2xl p-3 text-center" style={{ background: '#1a1a1a' }}>
            <span
              className="block text-lg font-black leading-none"
              style={{ color: avgNet > 0 ? '#22c55e' : '#ef4444' }}
            >
              {avgNet > 0 ? '+' : ''}
              <AnimNum v={Math.abs(avgNet)} />
            </span>
            <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1">
              Avg Net
            </span>
          </div>
        </div>

        {/* Surplus/Deficit Badge */}
        <div
          className="flex items-center justify-between mb-4 p-3 rounded-2xl"
          style={{ background: '#1a1a1a' }}
        >
          <span className="text-xs font-bold text-zinc-400">Today's Balance</span>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-black"
              style={{ color: netCals >= 0 ? '#22c55e' : '#f97316' }}
            >
              {netCals >= 0 ? '+' : ''}
              {netCals} kcal
            </span>
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-lg"
              style={{
                background: (netCals >= 0 ? '#22c55e' : '#f97316') + '18',
                color: netCals >= 0 ? '#22c55e' : '#f97316',
              }}
            >
              {netCals >= 0 ? 'Surplus' : 'Deficit'}
            </span>
          </div>
        </div>

        {dailyStats.some((d) => d.caloriesIn > 0 || d.caloriesOut > 0 || d.workoutDuration > 0) ? (
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              {activeChart === 'calories' ? (
                <ComposedChart
                  data={dailyStats}
                  barGap={2}
                  margin={{ top: 10, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis
                    dataKey="weekday"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#52525b', fontWeight: 700 }}
                    dy={8}
                    interval={view === 'Month' ? 4 : 0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#3f3f46' }}
                  />
                  <Tooltip content={<ChartTooltip formatter={(v: number) => `${v} kcal`} />} />
                  <Bar
                    dataKey="caloriesIn"
                    name="In"
                    fill="#22c55e"
                    opacity={0.8}
                    radius={[4, 4, 2, 2]}
                    barSize={view === 'Week' ? 16 : 6}
                  />
                  <Bar
                    dataKey="caloriesOut"
                    name="Out"
                    fill="#f97316"
                    opacity={0.8}
                    radius={[4, 4, 2, 2]}
                    barSize={view === 'Week' ? 16 : 6}
                  />
                  <Line
                    type="monotone"
                    dataKey="netCalories"
                    name="Net"
                    stroke="rgba(255,255,255,0.25)"
                    strokeDasharray="3 3"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </ComposedChart>
              ) : (
                <ComposedChart
                  data={dailyStats}
                  margin={{ top: 10, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis
                    dataKey="weekday"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#52525b', fontWeight: 700 }}
                    dy={8}
                    interval={view === 'Month' ? 4 : 0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#3f3f46' }}
                  />
                  <Tooltip content={<ChartTooltip formatter={(v: number) => `${v} min`} />} />
                  <Bar
                    dataKey="workoutDuration"
                    name="Minutes"
                    fill="#3b82f6"
                    opacity={0.85}
                    radius={[4, 4, 2, 2]}
                    barSize={view === 'Week' ? 18 : 6}
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-10 border border-dashed rounded-2xl"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <Utensils size={20} className="text-zinc-800 mb-2" />
            <p className="text-xs font-bold text-zinc-600">No data tracked yet</p>
          </div>
        )}
      </div>

      {/* ── PERFORMANCE RADAR ── */}
      <div
        className="mx-4 mb-4 rounded-[24px] p-5"
        style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <SectionHeader
          icon={Target}
          color="#8b5cf6"
          title="Performance Radar"
          sub={`${view}ly fitness score`}
        />
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 10, fill: '#52525b', fontWeight: 700 }}
              />
              <Radar
                name="You"
                dataKey="A"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── WEIGHT TRACKER ── */}
      <div
        className="mx-4 mb-4 rounded-[24px] p-5"
        style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-start justify-between mb-4">
          <SectionHeader
            icon={Scale}
            color="#3b82f6"
            title="Weight Tracker"
            sub="Log & monitor progress"
          />
          <button
            onClick={() => setShowWeightModal(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>

        {/* Current weight display */}
        <div
          className="flex items-center gap-4 mb-4 p-4 rounded-2xl"
          style={{ background: '#1a1a1a' }}
        >
          <div>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
              Current
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white tracking-tighter">
                {currentWeight > 0 ? currentWeight : '—'}
              </span>
              <span className="text-sm font-bold text-zinc-500">kg</span>
            </div>
          </div>
          {weights.length > 1 && (
            <div className="ml-auto">
              <p className="text-[9px] font-bold text-zinc-600 uppercase mb-1">vs last</p>
              <TrendBadge value={weightTrend} unit="kg" inverse={true} />
            </div>
          )}
        </div>

        {/* Weight chart */}
        <div style={{ height: 140, marginLeft: -16, marginRight: -16 }}>
          {weights.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weights} margin={{ top: 8, right: 16, left: 16, bottom: 0 }}>
                <defs>
                  <linearGradient id="wFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: '#52525b', fontWeight: 700 }}
                  dy={8}
                  minTickGap={40}
                  tickFormatter={(v) => {
                    const p = v.split('/');
                    return p.length >= 2
                      ? `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(p[0]) - 1]} ${p[1]}`
                      : v;
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const log = payload[0].payload as WeightLog;
                    return (
                      <div
                        style={{
                          background: '#111',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 12,
                          padding: '8px 12px',
                        }}
                      >
                        <p
                          style={{
                            fontSize: 9,
                            color: '#52525b',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            marginBottom: 4,
                          }}
                        >
                          {new Date(log.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>
                          {log.weight} <span style={{ fontSize: 10, color: '#3b82f6' }}>kg</span>
                        </p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#wFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6', stroke: '#080808', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div
              className="h-full flex flex-col items-center justify-center border border-dashed rounded-2xl"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <Scale size={20} className="text-zinc-800 mb-2" />
              <p className="text-xs font-bold text-zinc-600">Tap + to log your weight</p>
            </div>
          )}
        </div>

        {/* Log History */}
        {weights.length > 0 && (
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-3">
              Log History
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
              {[...weights]
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-2xl group"
                    style={{ background: '#1a1a1a' }}
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {new Date(log.timestamp).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-600">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-white">
                        {log.weight} <span className="text-[9px] text-zinc-500">kg</span>
                      </span>
                      <button
                        onClick={() => deleteWeightLog(log.id)}
                        className="p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* ── PERIOD HISTORY ── */}
      <div className="mx-4 mb-4">
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.18em] mb-3 px-1">
          {view}ly Archive
        </p>
        <div className="space-y-2">
          {periodHistory.map((period, idx) => (
            <div
              key={period.id}
              className="rounded-[20px] overflow-hidden"
              style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <button
                className="w-full flex items-center justify-between p-4"
                onClick={() => setExpandedPeriod(expandedPeriod === period.id ? null : period.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: idx === 0 ? 'rgba(59,130,246,0.12)' : '#1a1a1a' }}
                  >
                    <Activity size={14} style={{ color: idx === 0 ? '#3b82f6' : '#3f3f46' }} />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-black text-white block">{period.label}</span>
                    <span className="text-[10px] font-bold text-zinc-600">{period.subLabel}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-black text-white block">
                      {period.workoutCount} <span className="text-zinc-600">sessions</span>
                    </span>
                    <span className="text-[10px] font-bold text-zinc-600">
                      {period.caloriesBurned} kcal burned
                    </span>
                  </div>
                  {expandedPeriod === period.id ? (
                    <ChevronUp size={14} className="text-zinc-600" />
                  ) : (
                    <ChevronDown size={14} className="text-zinc-600" />
                  )}
                </div>
              </button>
              {expandedPeriod === period.id && (
                <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                  <MiniStat label="Sessions" value={period.workoutCount} color="#3b82f6" />
                  <MiniStat
                    label="Duration"
                    value={period.totalDuration}
                    color="#f59e0b"
                    suffix="m"
                  />
                  <MiniStat label="Burned" value={period.caloriesBurned} color="#f97316" />
                  {period.avgWeight > 0 && (
                    <div
                      className="col-span-3 mt-1 p-3 rounded-2xl"
                      style={{ background: '#1a1a1a' }}
                    >
                      <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">
                        Avg Weight
                      </span>
                      <span className="text-sm font-black text-white ml-2">
                        {period.avgWeight.toFixed(1)} kg
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {periodHistory.length === 0 && (
            <div
              className="py-12 text-center rounded-[20px]"
              style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <Calendar size={24} className="text-zinc-800 mx-auto mb-2" />
              <p className="text-xs font-bold text-zinc-600">No history yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ── WEIGHT MODAL ── */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-end justify-center p-4 animate-fade-in">
          <div
            className="w-full max-w-sm rounded-[28px] p-6 shadow-2xl relative"
            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-black text-white">Log Weight</h3>
              <button
                onClick={() => setShowWeightModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: '#1a1a1a' }}
              >
                <X size={14} className="text-zinc-400" />
              </button>
            </div>
            <div className="relative mb-6">
              <input
                type="number"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWeight()}
                className="w-full rounded-2xl p-4 text-center text-4xl font-black text-white focus:outline-none placeholder:text-zinc-800 transition-all"
                style={{ background: '#1a1a1a', border: '1.5px solid rgba(255,255,255,0.06)' }}
                placeholder="0.0"
                autoFocus
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 font-black text-sm uppercase tracking-widest">
                kg
              </span>
            </div>
            <button
              onClick={handleAddWeight}
              disabled={!newWeight}
              className="w-full py-4 rounded-2xl text-sm font-black text-black uppercase tracking-wider transition-all disabled:opacity-40"
              style={{ background: '#fff' }}
            >
              Save Entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
