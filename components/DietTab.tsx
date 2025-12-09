import React, { useState } from 'react';
import { Utensils, RefreshCw, ChefHat, Leaf, Info, Loader2 } from 'lucide-react';
import { generateDiet } from '../services/geminiService';
import { DietPlan, Meal } from '../types';

export const DietTab: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
    const [preferences, setPreferences] = useState('');

    const handleGenerate = async () => {
        if (!preferences) return;
        setLoading(true);
        const plan = await generateDiet(preferences);
        setDietPlan(plan);
        setLoading(false);
    };

    const MealCard = ({ title, meal, colorClass }: { title: string, meal: Meal, colorClass: string }) => (
        <div className={`p-5 rounded-3xl bg-zinc-900/60 border border-white/5 relative overflow-hidden`}>
             <div className={`absolute top-0 left-0 w-1 h-full ${colorClass}`}></div>
             <div className="flex justify-between items-start mb-2">
                 <h4 className="text-sm uppercase tracking-wider text-zinc-500 font-bold">{title}</h4>
                 <span className="text-xs font-mono text-zinc-400">{meal.calories} kcal</span>
             </div>
             <h3 className="text-lg font-bold text-white mb-2">{meal.name}</h3>
             <p className="text-xs text-zinc-400 mb-4 leading-relaxed">{meal.description}</p>
             <div className="flex gap-2">
                 <div className="bg-zinc-800/50 px-2 py-1 rounded-md text-[10px] text-zinc-300">
                    <span className="font-bold text-white">{meal.protein}g</span> P
                 </div>
                 <div className="bg-zinc-800/50 px-2 py-1 rounded-md text-[10px] text-zinc-300">
                    <span className="font-bold text-white">{meal.carbs}g</span> C
                 </div>
                 <div className="bg-zinc-800/50 px-2 py-1 rounded-md text-[10px] text-zinc-300">
                    <span className="font-bold text-white">{meal.fats}g</span> F
                 </div>
             </div>
        </div>
    );

  return (
    <div className="p-6 pb-32 min-h-screen">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600 mb-6">
            Nutrition
      </h1>

      {!dietPlan ? (
          <div className="flex flex-col justify-center mt-10">
             <div className="bg-zinc-900/80 border border-white/10 p-6 rounded-3xl backdrop-blur-xl">
                <h2 className="text-xl font-semibold text-white mb-2">Create Meal Plan</h2>
                <p className="text-zinc-400 text-sm mb-6">Describe your diet (e.g., "Keto, vegetarian, 1800 calories, high protein").</p>
                
                <textarea
                    className="w-full bg-black/50 border border-zinc-700 rounded-2xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50 transition-colors resize-none h-32 mb-4"
                    placeholder="I want a vegan diet focused on weight loss..."
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                />

                <button
                    onClick={handleGenerate}
                    disabled={loading || !preferences}
                    className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <ChefHat className="w-5 h-5" />}
                    {loading ? 'Cooking Plan...' : 'Generate Diet'}
                </button>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4 opacity-50">
                 <div className="bg-zinc-900 rounded-2xl h-32"></div>
                 <div className="bg-zinc-900 rounded-2xl h-32"></div>
            </div>
          </div>
      ) : (
          <div className="space-y-6 animate-fade-in">
             <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">{dietPlan.dailyCalories}</span>
                    <span className="text-sm text-zinc-500 font-medium">kcal goal</span>
                </div>
                <button onClick={() => setDietPlan(null)} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
                    <RefreshCw size={18} />
                </button>
             </div>

             {/* Macros Summary */}
             <div className="grid grid-cols-3 gap-3">
                 {[
                     { label: 'Protein', val: dietPlan.macros.protein, color: 'text-blue-400', bar: 'bg-blue-500' },
                     { label: 'Carbs', val: dietPlan.macros.carbs, color: 'text-orange-400', bar: 'bg-orange-500' },
                     { label: 'Fats', val: dietPlan.macros.fats, color: 'text-yellow-400', bar: 'bg-yellow-500' },
                 ].map((m) => (
                     <div key={m.label} className="bg-zinc-900 rounded-2xl p-3 border border-white/5">
                         <p className="text-xs text-zinc-500 mb-1">{m.label}</p>
                         <p className={`text-xl font-bold ${m.color}`}>{m.val}g</p>
                         <div className="w-full bg-zinc-800 h-1 mt-2 rounded-full overflow-hidden">
                             <div className={`h-full ${m.bar} w-3/4`}></div>
                         </div>
                     </div>
                 ))}
             </div>

             <div className="space-y-4 mt-6">
                 <MealCard title="Breakfast" meal={dietPlan.meals.breakfast} colorClass="bg-orange-400" />
                 <MealCard title="Lunch" meal={dietPlan.meals.lunch} colorClass="bg-green-400" />
                 <MealCard title="Dinner" meal={dietPlan.meals.dinner} colorClass="bg-blue-400" />
             </div>
          </div>
      )}
    </div>
  );
};