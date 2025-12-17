
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Flame, Utensils, Scale, Plus, TrendingUp, TrendingDown, Target, Calendar, X, Trash2, Timer, Zap, Activity, ChevronRight, BarChart2, History } from 'lucide-react';

interface WeightLog {
  id: string;
  weight: number;
  date: string; // ISO date string
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
}

interface PeriodSummary {
    id: string;
    label: string;
    subLabel: string;
    workoutCount: number;
    totalDuration: number;
    avgWeight: number;
    caloriesBurned: number;
}

export const ActivityTab: React.FC = () => {
  const [view, setView] = useState<'Week' | 'Month'>('Week');
  const [weights, setWeights] = useState<WeightLog[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [periodHistory, setPeriodHistory] = useState<PeriodSummary[]>([]);
  
  // Weight Modal State
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  // Stats
  const [totalWorkoutMinutes, setTotalWorkoutMinutes] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    loadData();
  }, [view]);

  const loadData = async () => {
    // 1. Load Data from Storage
    const savedWeights = localStorage.getItem('fitbridge_weight_logs');
    let loadedWeights: WeightLog[] = savedWeights ? JSON.parse(savedWeights) : [];
    loadedWeights = loadedWeights.sort((a, b) => a.timestamp - b.timestamp);
    setWeights(loadedWeights);

    // TODO: Fetch from backend API once authentication is fully implemented
    // For now, use localStorage since Demo Mode doesn't have auth tokens
    const savedWorkouts = JSON.parse(localStorage.getItem('fitbridge_manual_workouts') || '[]');
    const savedMeals = JSON.parse(localStorage.getItem('fitbridge_manual_meals') || '[]');

    // 2. Generate Daily Stats for Chart (Current Period)
    const stats: DailyStats[] = [];
    const daysToLookBack = view === 'Week' ? 7 : 30;
    
    let totalMins = 0;

    for (let i = daysToLookBack - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0,0,0,0);
        
        const dateStr = d.toLocaleDateString();
        // Detailed date info for labels
        const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNumber = d.getDate();
        const dayName = `${weekday} ${dayNumber}`;
        
        // Aggregate Meals
        const daysMeals = savedMeals.filter((m: any) => {
            const mDate = new Date(m.timestamp);
            mDate.setHours(0,0,0,0);
            return mDate.getTime() === d.getTime();
        });
        const calsIn = daysMeals.reduce((acc: number, curr: any) => acc + (curr.calories || 0), 0);

        // Aggregate Workouts
        const daysWorkouts = savedWorkouts.filter((w: any) => {
            const wDate = new Date(w.timestamp);
            wDate.setHours(0,0,0,0);
            return wDate.getTime() === d.getTime();
        });
        const calsOut = daysWorkouts.reduce((acc: number, curr: any) => acc + (curr.calories || 0), 0);
        const duration = daysWorkouts.reduce((acc: number, curr: any) => acc + (curr.duration || 0), 0);
        
        totalMins += duration;

        stats.push({
            date: dateStr,
            weekday,
            dayNumber,
            dayName,
            caloriesIn: calsIn,
            caloriesOut: calsOut,
            hasWorkout: daysWorkouts.length > 0,
            workoutDuration: duration
        });
    }
    setDailyStats(stats);
    setTotalWorkoutMinutes(totalMins);

    // 3. Calculate Streak
    let streakCount = 0;
    const allWorkoutsSorted = savedWorkouts.sort((a: any, b: any) => b.timestamp - a.timestamp);
    if (allWorkoutsSorted.length > 0) {
        const today = new Date();
        today.setHours(0,0,0,0);
        let checkDate = new Date(today);
        let found = true;
        
        while (found && streakCount < 365) {
            const hasW = allWorkoutsSorted.some((w: any) => {
                const wd = new Date(w.timestamp);
                wd.setHours(0,0,0,0);
                return wd.getTime() === checkDate.getTime();
            });
            
            if (hasW) {
                streakCount++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                 if (checkDate.getTime() === today.getTime()) {
                     checkDate.setDate(checkDate.getDate() - 1);
                 } else {
                     found = false;
                 }
            }
        }
    }
    setCurrentStreak(streakCount);

    // 4. Generate Historical Summaries
    const history: PeriodSummary[] = [];
    const periodsToGen = 6; 
    
    for (let i = 0; i < periodsToGen; i++) {
        let label = '';
        let subLabel = '';
        let startTime = 0;
        let endTime = 0;

        if (view === 'Week') {
             const start = new Date();
             start.setDate(start.getDate() - start.getDay() + 1 - (i * 7));
             start.setHours(0,0,0,0);
             const end = new Date(start);
             end.setDate(end.getDate() + 6);
             end.setHours(23,59,59,999);
             
             startTime = start.getTime();
             endTime = end.getTime();
             label = i === 0 ? 'Current Week' : `Week ${getWeekNumber(start)}`;
             subLabel = `${start.getDate()}/${start.getMonth()+1} - ${end.getDate()}/${end.getMonth()+1}`;
        } else {
             const d = new Date();
             d.setMonth(d.getMonth() - i);
             d.setDate(1);
             d.setHours(0,0,0,0);
             
             const end = new Date(d);
             end.setMonth(end.getMonth() + 1);
             end.setDate(0);
             end.setHours(23,59,59,999);
             
             startTime = d.getTime();
             endTime = end.getTime();
             label = d.toLocaleDateString('en-US', { month: 'long' });
             subLabel = d.getFullYear().toString();
        }

        const periodWorkouts = savedWorkouts.filter((w: any) => w.timestamp >= startTime && w.timestamp <= endTime);
        const periodWeights = loadedWeights.filter((w: any) => w.timestamp >= startTime && w.timestamp <= endTime);
        
        const count = periodWorkouts.length;
        const dur = periodWorkouts.reduce((acc: number, curr: any) => acc + (curr.duration || 0), 0);
        const burn = periodWorkouts.reduce((acc: number, curr: any) => acc + (curr.calories || 0), 0);
        
        let avgW = 0;
        if (periodWeights.length > 0) {
            avgW = periodWeights.reduce((acc: number, curr: any) => acc + curr.weight, 0) / periodWeights.length;
        }

        if (i === 0 || count > 0 || periodWeights.length > 0) {
            history.push({
                id: i.toString(),
                label,
                subLabel,
                workoutCount: count,
                totalDuration: dur,
                avgWeight: avgW,
                caloriesBurned: burn
            });
        }
    }
    setPeriodHistory(history);
  };

  const getWeekNumber = (d: Date) => {
    const onejan = new Date(d.getFullYear(), 0, 1);
    const millis = d.getTime() - onejan.getTime();
    return Math.ceil((((millis / 86400000) + onejan.getDay() + 1) / 7));
  };

  const handleAddWeight = () => {
      if (!newWeight) return;
      const weightVal = parseFloat(newWeight);
      if (isNaN(weightVal)) return;

      const log: WeightLog = {
          id: Date.now().toString(),
          weight: weightVal,
          date: new Date().toLocaleDateString(),
          timestamp: Date.now()
      };

      const updated = [...weights, log].sort((a, b) => a.timestamp - b.timestamp);
      setWeights(updated);
      localStorage.setItem('fitbridge_weight_logs', JSON.stringify(updated));
      setNewWeight('');
      setShowWeightModal(false);
  };

  const deleteWeightLog = (id: string) => {
      const updated = weights.filter(w => w.id !== id);
      setWeights(updated);
      localStorage.setItem('fitbridge_weight_logs', JSON.stringify(updated));
  };

  // UI Calculations
  const currentWeight = weights.length > 0 ? weights[weights.length - 1].weight : 0;
  const startWeight = weights.length > 0 ? weights[0].weight : currentWeight;
  const previousWeight = weights.length > 1 ? weights[weights.length - 2].weight : currentWeight;
  const weightTrend = currentWeight - previousWeight;
  
  const todayStats = dailyStats[dailyStats.length - 1] || { caloriesIn: 0, caloriesOut: 0 };
  const netCalories = todayStats.caloriesIn - todayStats.caloriesOut;
  const workoutCount = dailyStats.filter(d => d.hasWorkout).length;
  
  // Analytics for top cards
  const currentPeriod = periodHistory[0] || { workoutCount: 0, totalDuration: 0, caloriesBurned: 0 };
  const prevPeriod = periodHistory[1] || { workoutCount: 0, totalDuration: 0, caloriesBurned: 0 };
  
  const workoutTrend = currentPeriod.workoutCount - prevPeriod.workoutCount;
  const durationTrend = currentPeriod.totalDuration - prevPeriod.totalDuration;

  return (
    <div className="p-6 pb-32 min-h-screen animate-fade-in relative bg-black">
       {/* Ambient Light */}
       <div className="fixed top-0 left-0 w-full h-96 bg-purple-900/10 blur-[100px] pointer-events-none"></div>

       {/* Header */}
       <div className="flex justify-between items-end mb-8 relative z-10">
            <div>
                <h1 className="text-4xl font-black text-white italic tracking-tight">
                    PROGRESS
                </h1>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mt-1 flex items-center gap-2">
                    <BarChart2 size={12} className="text-blue-500" />
                    {view}ly Performance
                </p>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-xl flex gap-1">
                {['Week', 'Month'].map((v) => (
                    <button 
                        key={v}
                        onClick={() => setView(v as 'Week' | 'Month')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                            view === v 
                            ? 'bg-white text-black shadow-lg shadow-white/10' 
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                        }`}
                    >
                        {v}
                    </button>
                ))}
            </div>
       </div>

       {/* 1. Trend Impact Cards */}
       <div className="grid grid-cols-2 gap-4 mb-6">
           <div className="bg-zinc-900/80 border border-white/5 rounded-[2rem] p-5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-[40px] group-hover:bg-blue-500/20 transition-colors"></div>
               <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-2 text-blue-400">
                       <DumbbellIcon size={16} />
                       <span className="text-[10px] font-bold uppercase tracking-wider">Workouts</span>
                   </div>
                   <div className="flex items-baseline gap-2">
                       <span className="text-3xl font-black text-white">{currentPeriod.workoutCount}</span>
                       <span className="text-xs text-zinc-500 font-medium">sess.</span>
                   </div>
                   <div className={`mt-2 text-xs font-bold flex items-center gap-1 ${workoutTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                       {workoutTrend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                       {Math.abs(workoutTrend)} vs last {view.toLowerCase()}
                   </div>
               </div>
           </div>

           <div className="bg-zinc-900/80 border border-white/5 rounded-[2rem] p-5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-[40px] group-hover:bg-purple-500/20 transition-colors"></div>
               <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-2 text-purple-400">
                       <Timer size={16} />
                       <span className="text-[10px] font-bold uppercase tracking-wider">Duration</span>
                   </div>
                   <div className="flex items-baseline gap-2">
                       <span className="text-3xl font-black text-white">{Math.floor(currentPeriod.totalDuration / 60)}</span>
                       <span className="text-xs text-zinc-500 font-medium">hours</span>
                   </div>
                   <div className={`mt-2 text-xs font-bold flex items-center gap-1 ${durationTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                       {durationTrend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                       {Math.abs(Math.floor(durationTrend / 60))}h vs last {view.toLowerCase()}
                   </div>
               </div>
           </div>
       </div>

       {/* 2. Consistency & Load */}
       <div className="grid grid-cols-1 gap-6 mb-6">
           <div className="bg-zinc-900/80 border border-white/5 rounded-[2.5rem] p-6 backdrop-blur-md">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-500" />
                        Consistency
                    </h3>
                    <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                        <Flame size={14} className="text-green-500 fill-green-500" />
                        <span className="text-xs font-bold text-green-400">{currentStreak} Day Streak</span>
                    </div>
                </div>

                {/* Visual Strip */}
                <div className="flex justify-between items-end h-36 px-1">
                   {dailyStats.map((day, idx) => (
                       <div key={idx} className="flex flex-col items-center gap-2 w-full group">
                           {/* Bar representing duration */}
                           <div className="relative w-full flex justify-center h-full items-end">
                                <div 
                                    className={`w-3 rounded-full transition-all duration-500 group-hover:scale-110 ${
                                        day.hasWorkout 
                                        ? 'bg-gradient-to-t from-green-600 to-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                                        : 'bg-zinc-800'
                                    }`}
                                    style={{ height: day.hasWorkout ? `${Math.min(100, (day.workoutDuration / 60) * 50)}%` : '4px' }}
                                ></div>
                           </div>
                           
                           {/* Day Label */}
                           <div className="flex flex-col items-center gap-0.5">
                               {view === 'Week' && (
                                   <span className={`text-[10px] font-bold uppercase ${day.hasWorkout ? 'text-white' : 'text-zinc-600'}`}>
                                       {day.weekday}
                                   </span>
                               )}
                               <span className={`text-[10px] font-bold ${day.hasWorkout ? 'text-white' : 'text-zinc-600'}`}>
                                   {day.dayNumber}
                               </span>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
       </div>

       {/* 3. Energy Balance Chart */}
       <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-6 mb-6">
           <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-white text-sm flex items-center gap-2">
                   <Target className="w-4 h-4 text-orange-500" />
                   Energy Balance
               </h3>
               <div className="text-xs font-mono bg-zinc-800 px-2 py-1 rounded-md text-zinc-400">
                   Net: <span className={netCalories > 0 ? "text-green-400 font-bold" : "text-orange-400 font-bold"}>{netCalories > 0 ? '+' : ''}{netCalories}</span>
               </div>
           </div>
           
           <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={dailyStats} barGap={4}>
                       <XAxis 
                            dataKey="dayName" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 10, fill: '#52525b', fontWeight: 'bold'}} 
                            dy={10}
                        />
                       <Tooltip 
                           cursor={{fill: 'rgba(255,255,255,0.03)'}}
                           content={({ active, payload, label }) => {
                               if (active && payload && payload.length) {
                               return (
                                   <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl shadow-2xl">
                                       <p className="text-xs text-zinc-400 mb-2 font-bold uppercase">{label}</p>
                                       <div className="space-y-1">
                                           <div className="flex items-center gap-2 text-xs text-green-400 font-bold">
                                               <Utensils size={10} />
                                               {payload[0].value} In
                                           </div>
                                           <div className="flex items-center gap-2 text-xs text-orange-400 font-bold">
                                               <Flame size={10} />
                                               {payload[1].value} Out
                                           </div>
                                       </div>
                                   </div>
                               );
                               }
                               return null;
                           }}
                       />
                       <Bar dataKey="caloriesIn" fill="#4ade80" radius={[4, 4, 4, 4]} barSize={8} />
                       <Bar dataKey="caloriesOut" fill="#fb923c" radius={[4, 4, 4, 4]} barSize={8} />
                   </BarChart>
               </ResponsiveContainer>
           </div>
       </div>

       {/* 4. Performance Archive */}
       <div className="mt-8">
           <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="font-black text-zinc-600 text-xs uppercase tracking-widest flex items-center gap-2">
                    <History size={14} />
                    {view}ly Archive
                </h3>
           </div>
           
           <div className="space-y-3">
               {periodHistory.map((period, idx) => (
                   <div key={period.id} className={`bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between group hover:border-zinc-600 transition-colors ${idx === 0 ? 'bg-zinc-800/50 border-white/10' : ''}`}>
                       <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs shadow-inner ${idx === 0 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-zinc-950 text-zinc-500 border border-zinc-800'}`}>
                               <div className="text-center leading-tight">
                                   <Activity size={20} />
                               </div>
                           </div>
                           <div>
                               <span className="text-sm font-black text-white block">{period.label}</span>
                               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">{period.subLabel}</span>
                           </div>
                       </div>
                       
                       <div className="text-right flex flex-col items-end">
                           <span className="text-sm font-bold text-white flex items-center gap-2">
                               {period.workoutCount} Workouts
                           </span>
                           <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                               <span>{period.caloriesBurned} kcal</span>
                               <span>•</span>
                               <span>{period.avgWeight > 0 ? `${period.avgWeight.toFixed(1)}kg` : '-'}</span>
                           </div>
                       </div>
                   </div>
               ))}
               {periodHistory.length === 0 && (
                   <div className="text-center py-12 text-zinc-600 text-sm font-medium">
                       No history data available yet.
                   </div>
               )}
           </div>
       </div>
       
       {/* 5. Weight Intelligence Card */}
       <div className="mt-8 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-6 relative overflow-hidden group">
           <div className="flex justify-between items-center mb-6 relative z-10">
               <div className="flex items-center gap-2">
                   <Scale className="w-4 h-4 text-blue-500" />
                   <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Weight Tracker</span>
               </div>
               <button 
                onClick={() => setShowWeightModal(true)}
                className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 p-2 rounded-xl transition-all"
               >
                   <Plus size={20} />
               </button>
           </div>

           <div className="flex items-baseline gap-3 mb-4">
               <span className="text-4xl font-black text-white tracking-tighter">{currentWeight > 0 ? currentWeight : '--'}</span>
               <span className="text-sm font-medium text-zinc-500">kg</span>
               <span className={`text-xs font-bold ml-auto ${weightTrend < 0 ? 'text-green-500' : 'text-zinc-600'}`}>
                    {weightTrend !== 0 ? (weightTrend > 0 ? '+' : '') + weightTrend.toFixed(1) : '-'} last entry
               </span>
           </div>
           
           <div className="h-32 w-full -mx-2">
               {weights.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={weights}>
                           <defs>
                               <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                                   <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <Area 
                               type="monotone" 
                               dataKey="weight" 
                               stroke="#3b82f6" 
                               strokeWidth={3}
                               fillOpacity={1} 
                               fill="url(#colorWeight)" 
                           />
                       </AreaChart>
                   </ResponsiveContainer>
               ) : (
                   <div className="h-full flex items-center justify-center text-xs text-zinc-700">No data</div>
               )}
           </div>

           {/* Detailed Weight History List */}
           <div className="mt-8 border-t border-white/5 pt-6">
               <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                   <History size={12} />
                   Log History
               </h4>
               <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                   {[...weights].sort((a, b) => b.timestamp - a.timestamp).map((log) => (
                       <div key={log.id} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors group/item">
                           <div className="flex flex-col">
                               <span className="text-sm font-bold text-white">
                                   {new Date(log.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                               </span>
                               <span className="text-[10px] text-zinc-500 font-medium">
                                   {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                           </div>
                           <div className="flex items-center gap-4">
                               <span className="text-base font-black text-white tracking-tight">
                                   {log.weight} <span className="text-xs text-zinc-500 font-bold">kg</span>
                               </span>
                               <button 
                                   onClick={() => deleteWeightLog(log.id)}
                                   className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                   title="Delete entry"
                               >
                                   <Trash2 size={16} />
                               </button>
                           </div>
                       </div>
                   ))}
                   {weights.length === 0 && (
                       <div className="text-center py-4 text-zinc-600 text-xs">
                           No recorded weight entries.
                       </div>
                   )}
               </div>
           </div>
       </div>

       {/* Weight Modal */}
       {showWeightModal && (
           <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in">
               <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                   
                   <div className="flex justify-between items-center mb-8">
                       <h3 className="text-xl font-black text-white italic">LOG WEIGHT</h3>
                       <button onClick={() => setShowWeightModal(false)} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
                           <X size={20} />
                       </button>
                   </div>
                   
                   <div className="relative mb-8">
                        <input 
                             type="number" 
                             value={newWeight}
                             onChange={(e) => setNewWeight(e.target.value)}
                             className="w-full bg-black border-2 border-zinc-800 focus:border-blue-500 rounded-3xl p-6 text-center text-4xl font-black text-white focus:outline-none transition-all placeholder:text-zinc-800"
                             placeholder="0.0"
                             autoFocus
                        />
                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-zinc-600 font-bold">kg</span>
                   </div>

                   <button 
                        onClick={handleAddWeight}
                        disabled={!newWeight}
                        className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-zinc-200 transition-colors disabled:opacity-50 shadow-lg shadow-white/10"
                   >
                       SAVE ENTRY
                   </button>
               </div>
           </div>
       )}
    </div>
  );
};

// Simple Icon component to fix missing import
const DumbbellIcon = ({size, className}: {size: number, className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>
    </svg>
);
