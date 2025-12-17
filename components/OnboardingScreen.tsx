/**
 * Onboarding Screen
 * Collects user profile information after signup
 */

import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Target,
  Dumbbell,
  Scale,
  Ruler,
  Sparkles,
  Check
} from 'lucide-react';

interface OnboardingProps {
  userId: string;
  onComplete: (profile: UserProfile) => void;
}

interface UserProfile {
  name: string;
  weight: number;
  height: number;
  goal: string;
  fitness_level: string;
}

const GOALS = [
  { id: 'Muscle Gain', label: 'Build Muscle', icon: Dumbbell, color: 'from-blue-500 to-indigo-500' },
  { id: 'Fat Loss', label: 'Lose Fat', icon: Target, color: 'from-orange-500 to-red-500' },
  { id: 'Maintenance', label: 'Stay Fit', icon: Scale, color: 'from-green-500 to-emerald-500' },
  { id: 'Endurance', label: 'Build Endurance', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
];

const FITNESS_LEVELS = [
  { id: 'Beginner', label: 'Beginner', description: 'New to fitness or returning after a break' },
  { id: 'Intermediate', label: 'Intermediate', description: 'Regular workouts for 6+ months' },
  { id: 'Advanced', label: 'Advanced', description: 'Years of consistent training' },
];

export const OnboardingScreen: React.FC<OnboardingProps> = ({ userId, onComplete }) => {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile state
  const [name, setName] = useState('');
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);
  const [goal, setGoal] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('');

  const steps = [
    { title: 'Personal Info', subtitle: "Let's get to know you" },
    { title: 'Your Goal', subtitle: 'What do you want to achieve?' },
    { title: 'Fitness Level', subtitle: 'Where are you starting from?' },
  ];

  const canProceed = () => {
    switch (step) {
      case 0: return name.trim().length > 0 && weight > 0 && height > 0;
      case 1: return goal !== '';
      case 2: return fitnessLevel !== '';
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      setIsLoading(true);
      try {
        const profile: UserProfile = {
          name,
          weight,
          height,
          goal,
          fitness_level: fitnessLevel,
        };

        // Try to save to Supabase if configured
        try {
          const { updateUserProfile, isSupabaseConfigured } = await import('../services/supabaseClient');
          if (isSupabaseConfigured()) {
            await updateUserProfile(userId, profile);
          }
        } catch (err) {
          console.log('Supabase not configured, continuing in demo mode');
        }

        onComplete(profile);
      } catch (err) {
        console.error('Failed to save profile:', err);
        // Still complete onboarding even if save fails
        onComplete({ name, weight, height, goal, fitness_level: fitnessLevel });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-indigo-900/30 to-purple-900/20 blur-[100px]" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-primary/20 to-emerald-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full px-6 py-8">
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((_, i) => (
              <div 
                key={i}
                className={`h-1.5 flex-1 mx-0.5 rounded-full transition-all duration-500 ${
                  i <= step ? 'bg-primary' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">{steps[step].title}</h2>
            <p className="text-zinc-500 text-sm">{steps[step].subtitle}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1">
          
          {/* Step 0: Personal Info */}
          {step === 0 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-4 px-4 text-white placeholder-zinc-600 focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2 flex items-center gap-1">
                    <Scale className="w-4 h-4" /> Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    min={30}
                    max={300}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2 flex items-center gap-1">
                    <Ruler className="w-4 h-4" /> Height (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    min={100}
                    max={250}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-4 px-4 text-white focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              {/* BMI Preview */}
              {weight > 0 && height > 0 && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
                  <p className="text-zinc-500 text-sm">Your BMI</p>
                  <p className="text-2xl font-bold text-primary">
                    {(weight / Math.pow(height / 100, 2)).toFixed(1)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Goal Selection */}
          {step === 1 && (
            <div className="space-y-3 animate-fadeIn">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                    goal === g.id
                      ? 'bg-gradient-to-r ' + g.color + ' border-transparent text-white shadow-lg'
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    goal === g.id ? 'bg-white/20' : 'bg-zinc-800'
                  }`}>
                    <g.icon className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-lg">{g.label}</span>
                  {goal === g.id && (
                    <Check className="w-5 h-5 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Fitness Level */}
          {step === 2 && (
            <div className="space-y-3 animate-fadeIn">
              {FITNESS_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setFitnessLevel(level.id)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                    fitnessLevel === level.id
                      ? 'bg-primary/10 border-primary text-white'
                      : 'bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-lg">{level.label}</span>
                    {fitnessLevel === level.id && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-black" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500 mt-1">{level.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="px-6 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            className="flex-1 bg-gradient-to-r from-primary to-emerald-400 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {step === steps.length - 1 ? "Let's Go!" : 'Continue'}
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
