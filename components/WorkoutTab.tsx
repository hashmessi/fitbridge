
import React, { useState, useEffect, useRef } from 'react';
import { Dumbbell, Play, Clock, BarChart, ChevronRight, Loader2, Zap, Trophy, Flame, Activity, Youtube, HelpCircle, Check, AlertCircle, Save, Download, Plus, X, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { generateWorkoutPlan } from '../services/apiClient';
import { WorkoutPlan } from '../types';

interface ManualLog {
  id: string;
  title: string;
  duration: number;
  calories: number;
  timestamp: number;
}

// Simplified list as requested
const COMMON_ACTIVITIES = [
    "Running", 
    "Walking", 
    "Weightlifting", 
    "Cycling", 
    "Yoga", 
    "Swimming",
    "Other"
];

export const WorkoutTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [hasSavedWorkout, setHasSavedWorkout] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  
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

  // Manual Logging State
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualLogs, setManualLogs] = useState<ManualLog[]>([]);
  const [manualForm, setManualForm] = useState({ title: '', duration: '', calories: '' });
  const [isCustomActivity, setIsCustomActivity] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('fitbridge_workout');
    if (saved) {
        setHasSavedWorkout(true);
    }
    const savedLogs = localStorage.getItem('fitbridge_manual_workouts');
    if (savedLogs) {
        setManualLogs(JSON.parse(savedLogs));
    }

    // Click outside handler for dropdown
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);

  }, []);

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
    setSaveStatus('idle');
    
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
    
    try {
      const response = await generateWorkoutPlan(fullDescription);
      console.log('API Response:', response);
      if (response.success && response.data) {
        console.log('Workout Plan Data:', response.data);
        setWorkout(response.data);
      } else {
        console.error('Failed to generate workout:', response.error);
        alert('Failed to generate workout. Please try again.');
      }
    } catch (error) {
      console.error('Error generating workout:', error);
      alert('Error generating workout. Please try again.');
    }
    setLoading(false);
  };

  const handleSaveWorkout = async () => {
    if (!workout) return;
    
    // Save to localStorage for resume
    const dataToSave = {
        workout,
        completedExercises,
        activeDayIndex,
        savedAt: Date.now()
    };
    localStorage.setItem('fitbridge_workout', JSON.stringify(dataToSave));
    
    // Calculate workout details using actual workout duration
    const completedCount = completedExercises.length;
    const workoutDuration = duration; // Use the duration from the form (user selected)
    const currentDay = workout.schedule[activeDayIndex];
    
    // Save to localStorage workout logs for Activity tab (Demo Mode compatibility)
    const workoutLog = {
      id: Date.now().toString(),
      title: `${workout.title} - ${currentDay?.dayTitle || 'Workout'}`,
      duration: workoutDuration,
      calories: completedCount * 50,
      timestamp: Date.now()
    };
    
    const existingLogs = JSON.parse(localStorage.getItem('fitbridge_manual_workouts') || '[]');
    existingLogs.push(workoutLog);
    localStorage.setItem('fitbridge_manual_workouts', JSON.stringify(existingLogs));
    
    // Also try to save to backend API (for authenticated users)
    try {
      const { logWorkout } = await import('../services/apiClient');
      
      const completedExercisesList = currentDay?.exercises.filter((_, idx) => 
        completedExercises.includes(`${activeDayIndex}-${idx}`)
      ) || [];
      
      const response = await logWorkout({
        title: `${workout.title} - ${currentDay?.dayTitle || 'Workout'}`,
        duration_minutes: workoutDuration,
        workout_type: workout.difficulty,
        calories_burned: completedCount * 50,
        exercises: completedExercisesList,
        notes: `Completed ${completedCount} exercises`,
        is_ai_generated: true
      });
      
      if (response.success) {
        console.log('Workout logged to backend successfully');
      }
    } catch (error) {
      console.error('Failed to log workout to backend:', error);
      // Don't block UX if backend fails - localStorage save is already done
    }
    
    setHasSavedWorkout(true);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleLoadWorkout = () => {
    const saved = localStorage.getItem('fitbridge_workout');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            setWorkout(data.workout);
            setCompletedExercises(data.completedExercises || []);
            setActiveDayIndex(data.activeDayIndex || 0);
        } catch (e) {
            console.error("Failed to load workout", e);
        }
    }
  };

  const handleSaveManualLog = () => {
      if (!manualForm.title || !manualForm.duration) return;
      
      const newLog: ManualLog = {
          id: Date.now().toString(),
          title: manualForm.title,
          duration: Number(manualForm.duration),
          calories: Number(manualForm.calories) || 0,
          timestamp: Date.now()
      };
      
      const updatedLogs = [newLog, ...manualLogs];
      setManualLogs(updatedLogs);
      localStorage.setItem('fitbridge_manual_workouts', JSON.stringify(updatedLogs));
      
      setManualForm({ title: '', duration: '', calories: '' });
      setIsCustomActivity(false);
      setShowManualForm(false);
  };

  const deleteLog = (id: string) => {
      const updated = manualLogs.filter(l => l.id !== id);
      setManualLogs(updated);
      localStorage.setItem('fitbridge_manual_workouts', JSON.stringify(updated));
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

  const calculateProgress = () => {
    if (!workout || !workout.schedule) return 0;
    let totalEx = 0;
    workout.schedule.forEach(day => {
        if (day.exercises) totalEx += day.exercises.length;
    });
    if (totalEx === 0) return 0;
    return Math.round((completedExercises.length / totalEx) * 100);
  };

  const handleActivitySelect = (activity: string) => {
    if (activity === "Other") {
        setIsCustomActivity(true);
        setManualForm({...manualForm, title: ""});
    } else {
        setIsCustomActivity(false);
        setManualForm({...manualForm, title: activity});
    }
    setIsDropdownOpen(false);
  };

  const progress = calculateProgress();
  const currentDay = workout?.schedule?.[activeDayIndex];

  if (showManualForm) {
      return (
          <div className="p-6 pb-32 min-h-screen animate-fade-in flex flex-col justify-center">
              <div className="relative bg-zinc-900 border border-white/5 rounded-[2rem] p-8 shadow-2xl">
                  {/* Container for background effects to handle overflow properly */}
                  <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px]"></div>
                  </div>
                  
                  <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <h1 className="text-2xl font-bold text-white tracking-tight">Log Workout</h1>
                        <button 
                            onClick={() => setShowManualForm(false)}
                            className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                      </div>

                      <div className="space-y-6">
                          <div className="space-y-2">
                              <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider ml-1">Activity Type</label>
                              
                              <div className="relative" ref={dropdownRef}>
                                  <div 
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`w-full bg-zinc-800/80 border border-white/5 rounded-3xl p-5 text-white flex justify-between items-center cursor-pointer hover:bg-zinc-800 transition-all ${isDropdownOpen ? 'ring-2 ring-blue-500/20' : ''}`}
                                  >
                                    <span className={manualForm.title ? "text-white font-medium" : "text-zinc-500"}>
                                        {isCustomActivity ? "Other" : (manualForm.title || "Select Activity")}
                                    </span>
                                    {isDropdownOpen ? <ChevronUp size={18} className="text-blue-500" /> : <ChevronDown size={18} className="text-zinc-500" />}
                                  </div>

                                  {/* Custom Dropdown Menu */}
                                  {isDropdownOpen && (
                                      <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-50 animate-fade-in">
                                          {COMMON_ACTIVITIES.map((activity, idx) => (
                                              <div 
                                                key={activity}
                                                onClick={() => handleActivitySelect(activity)}
                                                className={`p-4 cursor-pointer flex items-center justify-between hover:bg-zinc-800 transition-colors ${
                                                    idx !== COMMON_ACTIVITIES.length - 1 ? 'border-b border-white/5' : ''
                                                } ${manualForm.title === activity ? 'bg-blue-500/10 text-blue-400' : 'text-zinc-300'}`}
                                              >
                                                  <span className="font-medium">{activity}</span>
                                                  {manualForm.title === activity && <Check size={16} />}
                                              </div>
                                          ))}
                                      </div>
                                  )}
                              </div>
                              
                              {isCustomActivity && (
                                  <input 
                                    type="text" 
                                    value={manualForm.title}
                                    onChange={e => setManualForm({...manualForm, title: e.target.value})}
                                    placeholder="Enter activity name..."
                                    className="w-full bg-zinc-800/50 border border-white/5 rounded-3xl p-5 text-white focus:outline-none focus:border-blue-500/30 focus:bg-zinc-800 mt-2 animate-fade-in transition-all"
                                    autoFocus
                                  />
                              )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider ml-1">Time (min)</label>
                                  <input 
                                    type="number" 
                                    value={manualForm.duration}
                                    onChange={e => setManualForm({...manualForm, duration: e.target.value})}
                                    placeholder="45"
                                    className="w-full bg-zinc-800/50 border border-white/5 rounded-3xl p-5 text-white focus:outline-none focus:border-blue-500/30 focus:bg-zinc-800 transition-all font-medium placeholder:text-zinc-600"
                                  />
                              </div>
                              <div className="space-y-2">
                                  <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider ml-1">Calories</label>
                                  <input 
                                    type="number" 
                                    value={manualForm.calories}
                                    onChange={e => setManualForm({...manualForm, calories: e.target.value})}
                                    placeholder="350"
                                    className="w-full bg-zinc-800/50 border border-white/5 rounded-3xl p-5 text-white focus:outline-none focus:border-blue-500/30 focus:bg-zinc-800 transition-all font-medium placeholder:text-zinc-600"
                                  />
                              </div>
                          </div>

                          <button 
                            onClick={handleSaveManualLog}
                            disabled={!manualForm.title || !manualForm.duration}
                            className="w-full bg-blue-500 text-white font-bold py-5 rounded-3xl hover:bg-blue-600 transition-all disabled:opacity-50 disabled:hover:bg-blue-500 shadow-lg shadow-blue-500/20 mt-2 text-lg"
                          >
                              Save Activity
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="p-6 pb-32 min-h-screen">
       <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                AI Workout
          </h1>
          {!workout && (
              <button 
                onClick={() => setShowManualForm(true)}
                className="text-xs bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-full text-zinc-300 hover:text-white hover:border-white/30 transition-all flex items-center gap-1.5"
              >
                  <Plus size={14} />
                  Log Manual
              </button>
          )}
       </div>

      {!workout ? (
        <div className="flex flex-col justify-center animate-fade-in space-y-8">
            <div className="bg-zinc-900/80 border border-white/10 p-6 rounded-3xl backdrop-blur-xl space-y-8">
                
                {/* 1. Goal Selection (Carousel) */}
                <div>
                    <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3 block">
                        Select Goal
                    </label>
                    <div className="relative">
                        {/* Goal Cards Container */}
                        <div className="flex gap-3 overflow-hidden">
                            {goals.map((goal) => {
                                const Icon = goal.icon;
                                const isSelected = selectedGoal === goal.id;
                                return (
                                    <button
                                        key={goal.id}
                                        onClick={() => setSelectedGoal(goal.id)}
                                        className={`flex-1 min-w-0 p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 relative overflow-hidden group ${
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
                        
                        {/* Navigation Arrows for Mobile */}
                        <div className="flex justify-center gap-2 mt-3">
                            {goals.map((goal, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedGoal(goal.id)}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                        selectedGoal === goal.id
                                            ? 'bg-white w-4'
                                            : 'bg-zinc-700'
                                    }`}
                                />
                            ))}
                        </div>
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

                <div className="space-y-3">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 shadow-xl shadow-white/5"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Dumbbell className="w-5 h-5" />}
                        {loading ? 'Designing Plan...' : 'Generate Workout'}
                    </button>

                    {hasSavedWorkout && !loading && (
                        <button
                            onClick={handleLoadWorkout}
                            className="w-full bg-zinc-800/50 text-zinc-300 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors border border-white/5"
                        >
                            <Download size={18} />
                            Resume Last Workout
                        </button>
                    )}
                </div>
            </div>

            {/* Manual Logs List */}
            {manualLogs.length > 0 && (
                <div>
                     <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-4 px-1">Recent Manual Logs</h3>
                     <div className="space-y-3">
                        {manualLogs.map((log) => (
                            <div key={log.id} className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                                        <Activity size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{log.title}</p>
                                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                                            <Calendar size={10} />
                                            {new Date(log.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-white">{log.duration} min</p>
                                    <p className="text-xs text-zinc-500">{log.calories > 0 ? `${log.calories} kcal` : ''}</p>
                                </div>
                                <button onClick={() => deleteLog(log.id)} className="ml-2 p-2 text-zinc-600 hover:text-red-400">
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                     </div>
                </div>
            )}
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
                <button 
                    onClick={handleSaveWorkout} 
                    disabled={saveStatus === 'saved'}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                        saveStatus === 'saved' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                    }`}
                >
                    {saveStatus === 'saved' ? <Check size={14} /> : <Save size={14} />}
                    {saveStatus === 'saved' ? 'Saved!' : 'Save Progress'}
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

            {/* Day Tabs - Mobile Carousel Style */}
            {workout.schedule && workout.schedule.length > 1 && (
                <div className="relative flex items-center gap-3 mb-4">
                    {/* Left Arrow */}
                    <button
                        onClick={() => setActiveDayIndex(Math.max(0, activeDayIndex - 1))}
                        disabled={activeDayIndex === 0}
                        className={`p-2 rounded-full transition-all ${
                            activeDayIndex === 0
                                ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed'
                                : 'bg-zinc-800 text-white hover:bg-zinc-700'
                        }`}
                    >
                        <ChevronRight className="rotate-180 w-4 h-4" />
                    </button>

                    {/* Current Day Tab */}
                    <div className="flex-1">
                        <button
                            className="w-full px-4 py-2 rounded-full text-sm font-bold bg-white text-black"
                        >
                            {workout.schedule[activeDayIndex]?.dayTitle || `Day ${activeDayIndex + 1}`}
                        </button>
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={() => setActiveDayIndex(Math.min(workout.schedule.length - 1, activeDayIndex + 1))}
                        disabled={activeDayIndex === workout.schedule.length - 1}
                        className={`p-2 rounded-full transition-all ${
                            activeDayIndex === workout.schedule.length - 1
                                ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed'
                                : 'bg-zinc-800 text-white hover:bg-zinc-700'
                        }`}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Progress Indicator Dots */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {workout.schedule.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                    idx === activeDayIndex
                                        ? 'bg-white w-3'
                                        : 'bg-zinc-700'
                                }`}
                            />
                        ))}
                    </div>
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
