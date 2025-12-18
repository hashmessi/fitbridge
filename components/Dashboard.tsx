
import React, { useState, useEffect } from 'react';
import { Flame, Dumbbell, Utensils, Footprints, Play, MessageSquare, Plus, Zap } from 'lucide-react';
import { UserProfile, AppTab } from '../types';

interface DashboardProps {
  user: UserProfile;
  onNavigate: (tab: AppTab) => void;
}

// XP Level thresholds
const XP_LEVELS = [
  { level: 'Beginner', minXP: 0, maxXP: 500 },
  { level: 'Intermediate', minXP: 500, maxXP: 1500 },
  { level: 'Advanced', minXP: 1500, maxXP: 3000 },
  { level: 'Elite', minXP: 3000, maxXP: 5000 },
  { level: 'Master', minXP: 5000, maxXP: 10000 },
];

const MOTIVATIONAL_QUOTES = [
  "Consistency is the bridge between goals and accomplishment.",
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Don't stop when you're tired. Stop when you're done.",
  "The pain you feel today will be the strength you feel tomorrow.",
];

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  // Dynamic State with localStorage persistence
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);
  const [steps, setSteps] = useState(0);
  const [todayWorkout, setTodayWorkout] = useState<string | null>(null);
  const [lastActivityDate, setLastActivityDate] = useState<string | null>(null);
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[0]);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('fitbridge_dashboard_data');
    if (savedData) {
      const data = JSON.parse(savedData);
      setStreak(data.streak || 0);
      setXp(data.xp || 0);
      setTodayCalories(data.todayCalories || 0);
      setSteps(data.steps || 0);
      setTodayWorkout(data.todayWorkout || null);
      setLastActivityDate(data.lastActivityDate || null);
    }

    // Load today's meals from DietTab storage
    const savedMeals = localStorage.getItem('fitbridge_manual_meals');
    if (savedMeals) {
      const meals = JSON.parse(savedMeals);
      const today = new Date().toDateString();
      const todayMeals = meals.filter((m: any) => new Date(m.timestamp).toDateString() === today);
      const totalCals = todayMeals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
      setTodayCalories(totalCals);
    }

    // Set random motivational quote
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

    // Check and update streak based on activity
    checkAndUpdateStreak();
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    const data = {
      streak,
      xp,
      todayCalories,
      steps,
      todayWorkout,
      lastActivityDate,
    };
    localStorage.setItem('fitbridge_dashboard_data', JSON.stringify(data));
  }, [streak, xp, todayCalories, steps, todayWorkout, lastActivityDate]);

  // Listen for activity updates from other tabs
  useEffect(() => {
    const handleStorageChange = () => {
      // Reload meals data
      const savedMeals = localStorage.getItem('fitbridge_manual_meals');
      if (savedMeals) {
        const meals = JSON.parse(savedMeals);
        const today = new Date().toDateString();
        const todayMeals = meals.filter((m: any) => new Date(m.timestamp).toDateString() === today);
        const totalCals = todayMeals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
        setTodayCalories(totalCals);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 5000); // Check every 5 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const checkAndUpdateStreak = () => {
    const today = new Date().toDateString();
    const savedData = localStorage.getItem('fitbridge_dashboard_data');
    
    if (savedData) {
      const data = JSON.parse(savedData);
      const lastDate = data.lastActivityDate;
      
      if (lastDate) {
        const lastActivityDate = new Date(lastDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
          // Streak broken - reset to 0
          setStreak(0);
        }
      }
    }
  };

  // Calculate level progress
  const getCurrentLevel = () => {
    for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
      if (xp >= XP_LEVELS[i].minXP) {
        return XP_LEVELS[i];
      }
    }
    return XP_LEVELS[0];
  };

  const currentLevel = getCurrentLevel();
  const levelProgress = Math.min(100, Math.round(((xp - currentLevel.minXP) / (currentLevel.maxXP - currentLevel.minXP)) * 100));

  // Calculate daily progress (based on activities)
  const calculateDailyProgress = () => {
    let progress = 0;
    if (todayWorkout) progress += 40; // 40% for completing workout
    if (todayCalories > 0) progress += 30; // 30% for logging meals
    if (steps > 5000) progress += 20; // 20% for hitting step goal
    if (steps > 0) progress += 10; // 10% for any steps
    return Math.min(100, progress);
  };

  const dailyProgress = calculateDailyProgress();

  // Function to record activity (can be called from other components)
  const recordActivity = (activityType: string, xpEarned: number = 10) => {
    const today = new Date().toDateString();
    
    // Update XP
    setXp(prev => prev + xpEarned);
    
    // Update streak
    if (lastActivityDate !== today) {
      setStreak(prev => prev + 1);
      setLastActivityDate(today);
    }
  };

  // Expose recordActivity to window for other components
  useEffect(() => {
    (window as any).recordFitbridgeActivity = recordActivity;
  }, [lastActivityDate]);

  return (
    <div className="p-6 space-y-6 pb-32 animate-fade-in min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-center px-1 pt-2">
         <div>
            <h1 className="text-2xl font-bold text-white">Hello, {user.name}</h1>
            <p className="text-zinc-500 text-xs font-medium">Ready to crush today?</p>
         </div>
         <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden">
            <img src={`https://picsum.photos/seed/${user.name}/200`} alt="Profile" className="w-full h-full object-cover" />
         </div>
      </div>

      {/* 1. Streak Management (Hero Section) */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-orange-500/20 rounded-3xl p-6 relative overflow-hidden group shadow-lg shadow-orange-900/5">
         {/* Background Effects */}
         <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-orange-500/15 transition-colors duration-500"></div>
         
         <div className="relative z-10">
             <div className="flex justify-between items-start mb-5">
                 <div className="flex flex-col gap-1">
                     <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-orange-500/10 rounded-lg">
                            <Flame className={`w-5 h-5 text-orange-500 ${streak > 0 ? 'fill-orange-500 animate-pulse' : ''}`} />
                        </div>
                        <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                          {streak > 0 ? 'On Fire' : 'Start Your Streak'}
                        </span>
                     </div>
                     <span className="text-5xl font-black text-white tracking-tighter mt-1">{streak} <span className="text-lg text-zinc-500 font-bold">Days</span></span>
                 </div>
                 
                 {/* Level Badge */}
                 <div className="bg-zinc-800/80 backdrop-blur-md border border-white/5 px-3 py-2 rounded-xl text-right min-w-[80px]">
                     <span className="block text-[10px] text-zinc-500 font-bold uppercase mb-0.5">{currentLevel.level}</span>
                     <span className="text-sm font-bold text-white block">{xp} XP</span>
                 </div>
             </div>

             {/* XP Progress Bar */}
             <div className="mb-5">
                 <div className="flex justify-between text-[10px] mb-1.5 opacity-60">
                     <span className="font-medium text-zinc-400">Progress to Next Level</span>
                     <span className="font-bold text-zinc-300">{levelProgress}%</span>
                 </div>
                 <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                    <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-[0_0_12px_rgba(249,115,22,0.6)] transition-all duration-500" 
                        style={{ width: `${levelProgress}%` }}
                    ></div>
                 </div>
             </div>

             {/* Motivation Quote */}
             <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3 flex items-center justify-center">
                 <p className="text-xs text-orange-200/90 italic text-center font-medium">
                    "{quote}"
                 </p>
             </div>
         </div>
      </div>

      {/* 2. Highlight Card (Activity Ring) */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[280px]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/5 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#27272a" strokeWidth="6" fill="transparent" strokeLinecap="round" />
                <circle 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    stroke="currentColor" 
                    strokeWidth="6" 
                    fill="transparent" 
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeDasharray="263.89" 
                    strokeDashoffset={263.89 - (263.89 * dailyProgress) / 100}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-white tracking-tighter">{dailyProgress}%</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Daily Load</span>
            </div>
        </div>
      </div>

      {/* 3. Three Simple Tiles */}
      <div className="grid grid-cols-3 gap-3 h-40">
         {/* Workout Tile */}
         <button 
           onClick={() => onNavigate(AppTab.WORKOUT)}
           className="h-full bg-zinc-900/50 border border-white/5 rounded-3xl p-4 flex flex-col justify-between items-start hover:bg-zinc-800 hover:border-white/10 transition-all group relative overflow-hidden text-left"
         >
             <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform duration-300">
                <Dumbbell size={20} />
             </div>
             <div>
                 <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Workout</p>
                 <p className="text-sm font-bold text-white leading-tight">{todayWorkout || 'None Yet'}</p>
             </div>
             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Play size={14} className="fill-white text-white" />
             </div>
         </button>

         {/* Diet Tile */}
         <button 
           onClick={() => onNavigate(AppTab.DIET)}
           className="h-full bg-zinc-900/50 border border-white/5 rounded-3xl p-4 flex flex-col justify-between items-start hover:bg-zinc-800 hover:border-white/10 transition-all"
         >
             <div className="p-3 bg-green-500/10 rounded-2xl text-green-400">
                <Utensils size={20} />
             </div>
             <div>
                 <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Calories</p>
                 <p className="text-lg font-bold text-white tracking-tight">{todayCalories.toLocaleString()}</p>
             </div>
         </button>

         {/* Activity Tile */}
         <button 
           onClick={() => onNavigate(AppTab.ACTIVITY)}
           className="h-full bg-zinc-900/50 border border-white/5 rounded-3xl p-4 flex flex-col justify-between items-start hover:bg-zinc-800 hover:border-white/10 transition-all"
         >
             <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
                <Footprints size={20} />
             </div>
             <div>
                 <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Steps</p>
                 <p className="text-lg font-bold text-white tracking-tight">{steps.toLocaleString()}</p>
             </div>
         </button>
      </div>

      {/* 4. Quick Actions */}
      <div className="flex gap-3">
          <button 
            onClick={() => onNavigate(AppTab.CHAT)}
            className="flex-1 bg-zinc-900/50 border border-white/5 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors text-xs font-bold text-zinc-300 group"
          >
              <MessageSquare size={16} className="text-pink-500 group-hover:scale-110 transition-transform" />
              AI Coach
          </button>
          
          <button 
            onClick={() => onNavigate(AppTab.WORKOUT)}
            className="flex-1 bg-zinc-900/50 border border-white/5 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors text-xs font-bold text-zinc-300 group"
          >
              <Zap size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
              Gen Workout
          </button>
          
          <button 
            onClick={() => onNavigate(AppTab.DIET)}
            className="flex-1 bg-zinc-900/50 border border-white/5 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors text-xs font-bold text-zinc-300 group"
          >
              <Plus size={16} className="text-green-500 group-hover:scale-110 transition-transform" />
              Add Meal
          </button>
      </div>
    </div>
  );
};
