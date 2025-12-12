import React, { useState } from 'react';
import { BarChart, Bar, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Footprints, Clock, Trophy, Heart } from 'lucide-react';

// Mock Data
const activityData = [
  { day: 'Mon', minutes: 45, calories: 320 },
  { day: 'Tue', minutes: 30, calories: 210 },
  { day: 'Wed', minutes: 60, calories: 450 },
  { day: 'Thu', minutes: 45, calories: 310 },
  { day: 'Fri', minutes: 90, calories: 600 },
  { day: 'Sat', minutes: 120, calories: 850 },
  { day: 'Sun', minutes: 20, calories: 150 },
];

const recentActivities = [
  { id: 1, title: 'Upper Body Power', type: 'Strength', duration: '45m', calories: 320, date: 'Today, 9:00 AM', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { id: 2, title: 'Morning Jog', type: 'Cardio', duration: '5.2km', calories: 410, date: 'Yesterday, 7:00 AM', icon: Footprints, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 3, title: 'HIIT Blast', type: 'Cardio', duration: '20m', calories: 250, date: 'Mon, 6:30 PM', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
];

export const ActivityTab: React.FC = () => {
  const [view, setView] = useState<'Week' | 'Month'>('Week');

  return (
    <div className="p-6 pb-32 min-h-screen animate-fade-in">
       {/* Header */}
       <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                Activity
            </h1>
            <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-white/5">
                {['Week', 'Month'].map((v) => (
                    <button 
                        key={v}
                        onClick={() => setView(v as 'Week' | 'Month')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            view === v 
                            ? 'bg-zinc-800 text-white shadow-lg' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        {v}
                    </button>
                ))}
            </div>
       </div>

       {/* Key Stats Grid */}
       <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-xs text-zinc-500 font-bold uppercase">Calories</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">2,450</span>
                    <span className="text-xs text-zinc-500">kcal</span>
                </div>
            </div>
            <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-zinc-500 font-bold uppercase">Active Time</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">5h 20m</span>
                </div>
            </div>
            <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Footprints className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-zinc-500 font-bold uppercase">Steps</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">42.5k</span>
                </div>
            </div>
            <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-zinc-500 font-bold uppercase">Avg HR</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">115</span>
                    <span className="text-xs text-zinc-500">bpm</span>
                </div>
            </div>
       </div>

       {/* Main Chart */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 mb-8 relative overflow-hidden">
             {/* Gradient glow behind chart */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-purple-500/20 blur-[100px] pointer-events-none"></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                    <h3 className="font-bold text-white">Activity Volume</h3>
                    <p className="text-xs text-zinc-500">Minutes per day</p>
                </div>
                <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">+12% vs last week</span>
            </div>
            
            <div className="h-56 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                         <Tooltip 
                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                return (
                                    <div className="bg-zinc-900 border border-white/10 p-3 rounded-xl shadow-xl">
                                        <p className="text-xs text-zinc-400 mb-1">{payload[0].payload.day}</p>
                                        <p className="text-sm font-bold text-white">{payload[0].value} mins</p>
                                        <p className="text-xs text-purple-400">{payload[0].payload.calories} kcal</p>
                                    </div>
                                );
                                }
                                return null;
                            }}
                        />
                        <Bar 
                            dataKey="minutes" 
                            fill="#c084fc" 
                            radius={[6, 6, 6, 6]} 
                            barSize={16}
                            animationDuration={1500}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Recent Activity List */}
        <div>
            <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="text-lg font-bold text-white">Recent Workouts</h2>
                <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">View All</button>
            </div>
            
            <div className="space-y-3">
                {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-zinc-900/30 border border-white/5 rounded-2xl hover:bg-zinc-900/50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activity.bg} ${activity.color} group-hover:scale-110 transition-transform duration-300`}>
                                <activity.icon size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">{activity.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                                    <span>{activity.type}</span>
                                    <span>•</span>
                                    <span>{activity.date}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                             <span className="block text-sm font-bold text-white">{activity.duration}</span>
                             <span className="text-xs text-zinc-500">{activity.calories} kcal</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};
