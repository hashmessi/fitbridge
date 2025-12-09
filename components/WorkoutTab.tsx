
import React, { useState } from 'react';
import { Dumbbell, Play, Clock, BarChart, ChevronRight, Loader2, Zap, Trophy, Flame, Activity, Youtube, HelpCircle, Check, AlertCircle } from 'lucide-react';
import { generateWorkout } from '../services/geminiService';
import { WorkoutPlan } from '../types';

export const WorkoutTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  
  // Selection States
  const [selectedGoal, setSelectedGoal] = useState('Build Muscle');
  const [duration, setDuration] = useState(45);
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [focusArea, setFocusArea] = useState('Full Body');
  const [equipment, setEquipment] = useState<string[]>([]);
  
  // Workout Execution State
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null); // composite key
  const [completedExercises, setCompletedExercises] = useState<string[]>([]); // composite key

  const goals = [
    { id: 'Build Muscle', icon: Trophy, color: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/50' },
    { id: 'Lose Weight', icon: Flame, color: 'from-red-500/20 to-pink-500/20', border: 'border-red-500/50' },
    { id: 'Increase Strength', icon: Dumbbell, color: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/50' },
    { id: 'Improve Endurance', icon: Activity, color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/50' },
    { id: 'Flexibility', icon: Zap, color: 'from-purple-500/20 to-violet-500/20', border: 'border-purple-500/50' },
  ];

  const focusAreas = ['Full Body', 'Upper Body', 'Lower Body', 'Core', 'Cardio', 'Arms', 'Legs', 'Back & Chest'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const equipmentOptions = [
    'No Equipment',
    'Dumbbells',
    'Resistance Bands',
    'Kettlebell',
    'Pull-up Bar',
    'Full Gym'
  ];
  
  const handleGenerate = async () => {
    setLoading(true);
    setCompletedExercises([]); // Reset progress
    setActiveDayIndex(0);
    
    const equipmentString = equipment.length > 0 
      ? `Available equipment: ${equipment.join(', ')}` 
      : 'No specific equipment (bodyweight preferred unless specified otherwise)';
      
    // Construct a rich prompt from the UI selections
    const fullDescription = `
      Goal: ${selectedGoal}.
      Duration: ${duration} minutes.
      Difficulty Level: ${difficulty}.
      Focus Area: ${focusArea}.
      ${equipmentString}.
      Create a highly engaging and effective workout plan.
    `;
    
    const plan = await generateWorkout(fullDescription);
    setWorkout(plan);
    setLoading(false);
  };

  const toggleEquipment = (option: string) => {
    setEquipment(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option) 
        : [...prev, option]
    );
  };

  const openVideoLink = (exerciseName: string) => {
    const query = encodeURIComponent(`${exerciseName} exercise tutorial`);
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
  };

  const toggleExerciseCompletion = (dayIdx: number, exIdx: number) => {
    const key = `${dayIdx}-${exIdx}`;
    setCompletedExercises(prev => {
        if (prev.includes(key)) {
            return prev.filter(k => k !== key);
        } else {
            return [...prev, key];
        }
    });
  };

  // Calculate progress safely with checks for array existence
  const calculateProgress = () => {
    if (!workout || !workout.schedule) return 0;
    let totalEx = 0;
    workout.schedule.forEach(day => {
        if (day.exercises) totalEx += day.exercises.length;
    });
    if (totalEx === 0) return 0;
    return Math.round((completedExercises.length / totalEx) * 100);
  };

  const progress = calculateProgress();
  const currentDay = workout?.schedule?.[activeDayIndex];

  return (
    <div className="p-6 pb-32 min-h-screen">
       <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 mb-6">
            AI Workout
      </h1>

      {!workout ? (
        <div className="flex flex-col justify-center animate-fade-in">
            <div className="bg-zinc-900/80 border border-white/10 p-6 rounded-3xl backdrop-blur-xl space-y-8">
                
                {/* 1. Goal Selection (Slides) */}
                <div>
                    <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3 block">
                        Select Goal
                    </label>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2 snap-x">
                        {goals.map((goal) => {
                            const Icon = goal.icon;
                            const isSelected = selectedGoal === goal.id;
                            return (
                                <button
                                    key={goal.id}
                                    onClick={() => setSelectedGoal(goal.id)}
                                    className={`snap-center min-w-[140px] p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 relative overflow-hidden group ${
                                        isSelected 
                                            ? `bg-gradient-to-br ${goal.color} ${goal.border} text-white` 
                                            : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                                    }`}
                                >
                                    <Icon size={28} className={isSelected ? 'scale-110 transition-transform' : ''} />
                                    <span className="text-xs font-bold text-center">{goal.id}</span>
                                    {isSelected && <div className="absolute inset-0 bg-white/5 animate-pulse"></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Duration Slider */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                            Duration
                        </label>
                        <span className="text-white font-mono text-sm bg-zinc-800 px-2 py-1 rounded-md">
                            {duration} min
                        </span>
                    </div>
                    <input 
                        type="range" 
                        min="15" 
                        max="120" 
                        step="5"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-600 mt-1 font-mono">
                        <span>15m</span>
                        <span>120m</span>
                    </div>
                </div>

                {/* 3. Difficulty & Focus */}
                <div>
                     <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3 block">
                        Difficulty
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        {difficulties.map((level) => (
                            <button
                                key={level}
                                onClick={() => setDifficulty(level)}
                                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                                    difficulty === level
                                        ? 'bg-white text-black shadow-lg'
                                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>

                    <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3 block">
                        Focus Area
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {focusAreas.map((area) => (
                            <button
                                key={area}
                                onClick={() => setFocusArea(area)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                    focusArea === area
                                        ? 'bg-blue-500/20 border-blue-500 text-blue-200'
                                        : 'bg-zinc-800/50 border-transparent text-zinc-400 hover:border-zinc-600'
                                }`}
                            >
                                {area}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. Equipment */}
                <div>
                    <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3 block">
                        Equipment
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {equipmentOptions.map((option) => (
                            <button
                                key={option}
                                onClick={() => toggleEquipment(option)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ${
                                    equipment.includes(option)
                                        ? 'bg-primary text-black border-primary shadow-[0_0_10px_rgba(217,249,157,0.3)]'
                                        : 'bg-black/30 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 shadow-xl shadow-white/5"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Dumbbell className="w-5 h-5" />}
                    {loading ? 'Designing Plan...' : 'Generate Workout'}
                </button>
            </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
             <div className="flex items-center justify-between mb-2">
                <button onClick={() => setWorkout(null)} className="text-sm text-zinc-500 hover:text-white flex items-center gap-1 group">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700">
                        <ChevronRight className="rotate-180 w-3 h-3" />
                    </div>
                    Back to Generator
                </button>
            </div>

            <div className="bg-gradient-to-r from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 rounded-3xl p-6 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                             <h2 className="text-2xl font-bold text-white mb-1">{workout.title}</h2>
                             <p className="text-indigo-200 text-xs opacity-80">{workout.difficulty} • {workout.duration}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-black text-indigo-300">{progress}%</span>
                            <p className="text-[10px] text-indigo-200/60 uppercase font-bold tracking-wider">Complete</p>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-zinc-900/50 rounded-full mt-4 overflow-hidden backdrop-blur-sm">
                        <div 
                            className="h-full bg-indigo-400 transition-all duration-500 ease-out" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
                {/* Background decoration */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none"></div>
            </div>

            {/* Day Tabs */}
            {workout.schedule && workout.schedule.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {workout.schedule.map((day, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveDayIndex(idx)}
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                                activeDayIndex === idx
                                    ? 'bg-white text-black'
                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                            }`}
                        >
                            {day.dayTitle || `Day ${idx + 1}`}
                        </button>
                    ))}
                </div>
            )}

            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-zinc-200 px-1 flex justify-between items-center">
                    <span>{currentDay?.dayTitle || 'Exercises'}</span>
                    <span className="text-xs text-zinc-500 font-normal">
                         {currentDay?.exercises?.filter((_, i) => completedExercises.includes(`${activeDayIndex}-${i}`)).length || 0}/{currentDay?.exercises?.length || 0} done
                    </span>
                </h3>
                
                {!currentDay || !currentDay.exercises || currentDay.exercises.length === 0 ? (
                    <div className="bg-zinc-900/50 border border-red-500/30 rounded-2xl p-6 text-center">
                        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <h4 className="text-white font-bold">No Exercises Found</h4>
                        <p className="text-sm text-zinc-400 mb-4">The plan seems empty for this day. Try regenerating.</p>
                        <button 
                            onClick={() => setWorkout(null)}
                            className="text-sm bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                ) : (
                    currentDay.exercises.map((ex, i) => {
                        const key = `${activeDayIndex}-${i}`;
                        const isCompleted = completedExercises.includes(key);
                        const isExpanded = expandedExercise === key;
                        
                        return (
                            <div key={key} className={`rounded-2xl overflow-hidden transition-all duration-300 border ${
                                isCompleted ? 'bg-zinc-900/30 border-green-500/20' : 'bg-zinc-900/60 border-white/5'
                            }`}>
                                <div 
                                    className="p-4 flex items-center justify-between cursor-pointer active:bg-zinc-800/50"
                                    onClick={() => setExpandedExercise(isExpanded ? null : key)}
                                >
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleExerciseCompletion(activeDayIndex, i);
                                            }}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border transition-all duration-300 shrink-0 ${
                                                isCompleted 
                                                    ? 'bg-primary text-black border-primary scale-110' 
                                                    : 'bg-zinc-800 text-zinc-400 border-white/5 hover:border-white/20'
                                            }`}
                                        >
                                            {isCompleted ? <Check size={18} strokeWidth={3} /> : i + 1}
                                        </button>
                                        <div className={isCompleted ? 'opacity-50 transition-opacity' : ''}>
                                            <h4 className={`font-semibold ${isCompleted ? 'text-zinc-400 line-through' : 'text-white'}`}>{ex.name}</h4>
                                            <div className="text-xs text-zinc-400 flex gap-3 mt-1">
                                                <span className="text-zinc-300 font-medium">{ex.sets} Sets</span>
                                                <span className="text-zinc-600">•</span>
                                                <span className="text-zinc-300 font-medium">{ex.reps}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight 
                                        size={16} 
                                        className={`text-zinc-500 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} 
                                    />
                                </div>
                                
                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-0 animate-fade-in">
                                        <div className="ml-14 p-3 bg-zinc-950/50 rounded-xl border border-white/5 space-y-3">
                                            {ex.notes && (
                                                <div className="flex gap-2">
                                                    <HelpCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                                                    <p className="text-sm text-zinc-400 italic">{ex.notes}</p>
                                                </div>
                                            )}
                                            {ex.description && (
                                                <p className="text-sm text-zinc-400 leading-relaxed border-t border-white/5 pt-2 mt-2">
                                                    {ex.description}
                                                </p>
                                            )}
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openVideoLink(ex.name);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 text-xs font-bold py-2 rounded-lg transition-colors border border-red-600/20"
                                            >
                                                <Youtube size={14} />
                                                Watch Tutorial
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <button className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2 mt-8 transition-all ${
                progress === 100 
                ? 'bg-primary text-black shadow-[0_0_20px_rgba(217,249,157,0.5)]' 
                : 'bg-zinc-800 text-zinc-400 cursor-not-allowed opacity-50'
            }`}>
                {progress === 100 ? (
                    <>
                        <Trophy className="fill-black" size={18} />
                        Plan Complete!
                    </>
                ) : (
                    <>
                        <Activity size={18} />
                        Keep Going
                    </>
                )}
            </button>
        </div>
      )}
    </div>
  );
};
