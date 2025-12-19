
import React, { useState, useEffect } from 'react';
import { Utensils, RefreshCw, ChefHat, Leaf, Info, Loader2, Plus, X, Calendar, Save, Check } from 'lucide-react';
import { generateDietPlan } from '../services/apiClient';
import { DietPlan, Meal } from '../types';

interface ManualMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  timestamp: number;
}

export const DietTab: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
    const [preferences, setPreferences] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    // Manual Meal State
    const [showManualForm, setShowManualForm] = useState(false);
    const [manualMeals, setManualMeals] = useState<ManualMeal[]>([]);
    const [manualForm, setManualForm] = useState({ name: '', calories: '', protein: '', carbs: '', fats: '' });

    useEffect(() => {
        const savedMeals = localStorage.getItem('fitbridge_manual_meals');
        if (savedMeals) {
            setManualMeals(JSON.parse(savedMeals));
        }
        // Load saved diet plan
        const savedPlan = localStorage.getItem('fitbridge_saved_diet_plan');
        if (savedPlan) {
            setDietPlan(JSON.parse(savedPlan));
            setIsSaved(true);
        }
    }, []);

    const handleGenerate = async () => {
        if (!preferences) return;
        setLoading(true);
        setIsSaved(false);
        try {
            const response = await generateDietPlan(preferences);
            if (response.success && response.data) {
                setDietPlan(response.data);
            } else {
                console.error('Failed to generate diet:', response.error);
                alert('Failed to generate diet plan. Please try again.');
            }
        } catch (error) {
            console.error('Error generating diet:', error);
            alert('Error generating diet plan. Please try again.');
        }
        setLoading(false);
    };

    const handleSavePlan = () => {
        if (!dietPlan) return;
        localStorage.setItem('fitbridge_saved_diet_plan', JSON.stringify(dietPlan));
        setIsSaved(true);
    };

    const handleSaveManualMeal = async () => {
        if (!manualForm.name || !manualForm.calories) return;

        const newMeal: ManualMeal = {
            id: Date.now().toString(),
            name: manualForm.name,
            calories: Number(manualForm.calories),
            protein: Number(manualForm.protein) || 0,
            carbs: Number(manualForm.carbs) || 0,
            fats: Number(manualForm.fats) || 0,
            timestamp: Date.now()
        };

        const updatedMeals = [newMeal, ...manualMeals];
        setManualMeals(updatedMeals);
        localStorage.setItem('fitbridge_manual_meals', JSON.stringify(updatedMeals));

        // Update dashboard data (XP gain for logging meal)
        const dashboardData = JSON.parse(localStorage.getItem('fitbridge_dashboard_data') || '{}');
        const today = new Date().toDateString();
        dashboardData.xp = (dashboardData.xp || 0) + 10;
        if (dashboardData.lastActivityDate !== today) {
            dashboardData.streak = (dashboardData.streak || 0) + 1;
            dashboardData.lastActivityDate = today;
        }
        localStorage.setItem('fitbridge_dashboard_data', JSON.stringify(dashboardData));

        // Save to Supabase database if configured
        try {
            const { logMeal, isSupabaseConfigured } = await import('../services/supabaseClient');
            const userId = localStorage.getItem('fitbridge_token');
            
            if (isSupabaseConfigured() && userId) {
                await logMeal({
                    user_id: userId,
                    log_date: new Date().toISOString().split('T')[0],
                    meal_type: 'Snack',
                    meal_name: manualForm.name,
                    calories: Number(manualForm.calories),
                    protein: Number(manualForm.protein) || 0,
                    carbs: Number(manualForm.carbs) || 0,
                    fats: Number(manualForm.fats) || 0,
                    is_ai_generated: false
                });
            }
        } catch (error) {
            console.error('Failed to log meal to Supabase:', error);
        }

        setManualForm({ name: '', calories: '', protein: '', carbs: '', fats: '' });
        setShowManualForm(false);
    };

    const deleteMeal = (id: string) => {
        const updated = manualMeals.filter(m => m.id !== id);
        setManualMeals(updated);
        localStorage.setItem('fitbridge_manual_meals', JSON.stringify(updated));
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

  if (showManualForm) {
      return (
          <div className="p-6 pb-32 min-h-screen animate-fade-in flex flex-col justify-center">
              <div className="relative bg-zinc-900 border border-white/5 rounded-[2rem] p-8 shadow-2xl">
                   {/* Container for background effects */}
                   <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[50px]"></div>
                   </div>

                  <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <h1 className="text-2xl font-bold text-white tracking-tight">Log Meal</h1>
                        <button 
                            onClick={() => setShowManualForm(false)}
                            className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                      </div>

                      <div className="space-y-6">
                          <div className="space-y-2">
                              <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider ml-1">Meal Name</label>
                              <input 
                                type="text" 
                                value={manualForm.name}
                                onChange={e => setManualForm({...manualForm, name: e.target.value})}
                                placeholder="e.g. Chicken Salad, Protein Shake"
                                className="w-full bg-zinc-800/50 border border-white/5 rounded-3xl p-5 text-white focus:outline-none focus:border-green-500/30 focus:bg-zinc-800 transition-all font-medium placeholder:text-zinc-600"
                              />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider ml-1">Calories</label>
                                  <input 
                                    type="number" 
                                    value={manualForm.calories}
                                    onChange={e => setManualForm({...manualForm, calories: e.target.value})}
                                    placeholder="500"
                                    className="w-full bg-zinc-800/50 border border-white/5 rounded-3xl p-5 text-white focus:outline-none focus:border-green-500/30 focus:bg-zinc-800 transition-all font-medium placeholder:text-zinc-600"
                                  />
                              </div>
                              <div className="space-y-2">
                                  <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider ml-1">Protein (g)</label>
                                  <input 
                                    type="number" 
                                    value={manualForm.protein}
                                    onChange={e => setManualForm({...manualForm, protein: e.target.value})}
                                    placeholder="30"
                                    className="w-full bg-zinc-800/50 border border-white/5 rounded-3xl p-5 text-white focus:outline-none focus:border-green-500/30 focus:bg-zinc-800 transition-all font-medium placeholder:text-zinc-600"
                                  />
                              </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider ml-1">Carbs (g)</label>
                                  <input 
                                    type="number" 
                                    value={manualForm.carbs}
                                    onChange={e => setManualForm({...manualForm, carbs: e.target.value})}
                                    placeholder="50"
                                    className="w-full bg-zinc-800/50 border border-white/5 rounded-3xl p-5 text-white focus:outline-none focus:border-green-500/30 focus:bg-zinc-800 transition-all font-medium placeholder:text-zinc-600"
                                  />
                              </div>
                              <div className="space-y-2">
                                  <label className="text-zinc-500 text-xs font-bold uppercase tracking-wider ml-1">Fats (g)</label>
                                  <input 
                                    type="number" 
                                    value={manualForm.fats}
                                    onChange={e => setManualForm({...manualForm, fats: e.target.value})}
                                    placeholder="15"
                                    className="w-full bg-zinc-800/50 border border-white/5 rounded-3xl p-5 text-white focus:outline-none focus:border-green-500/30 focus:bg-zinc-800 transition-all font-medium placeholder:text-zinc-600"
                                  />
                              </div>
                          </div>

                          <button 
                            onClick={handleSaveManualMeal}
                            disabled={!manualForm.name || !manualForm.calories}
                            className="w-full bg-green-500 text-white font-bold py-5 rounded-3xl hover:bg-green-600 transition-all disabled:opacity-50 disabled:hover:bg-green-500 shadow-lg shadow-green-500/20 mt-2 text-lg"
                          >
                              Save Meal
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
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                Nutrition
        </h1>
        <button 
            onClick={() => setShowManualForm(true)}
            className="text-xs bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-full text-zinc-300 hover:text-white hover:border-white/30 transition-all flex items-center gap-1.5"
        >
            <Plus size={14} />
            Add Manual
        </button>
      </div>

      {!dietPlan ? (
          <div className="flex flex-col justify-center animate-fade-in space-y-8">
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
            
            {/* Manual Meals List */}
            {manualMeals.length > 0 && (
                <div>
                     <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-4 px-1">Tracked Meals</h3>
                     <div className="space-y-3">
                        {manualMeals.map((meal) => (
                            <div key={meal.id} className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                                        <Utensils size={18} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{meal.name}</p>
                                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                                            <Calendar size={10} />
                                            {new Date(meal.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-white">{meal.calories} kcal</p>
                                    <div className="flex gap-1 text-[10px] text-zinc-500 justify-end">
                                        <span>{meal.protein}P</span>
                                        <span>{meal.carbs}C</span>
                                        <span>{meal.fats}F</span>
                                    </div>
                                </div>
                                <button onClick={() => deleteMeal(meal.id)} className="ml-2 p-2 text-zinc-600 hover:text-red-400">
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
             <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">{dietPlan.dailyCalories}</span>
                    <span className="text-sm text-zinc-500 font-medium">kcal goal</span>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleSavePlan} 
                        className={`p-2 rounded-full transition-all ${isSaved ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                        title={isSaved ? 'Plan saved!' : 'Save plan'}
                    >
                        {isSaved ? <Check size={18} /> : <Save size={18} />}
                    </button>
                    <button onClick={() => { setDietPlan(null); setIsSaved(false); }} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
                        <RefreshCw size={18} />
                    </button>
                </div>
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
