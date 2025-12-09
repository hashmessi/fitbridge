import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';

const activityData = [
  { day: 'Mon', active: 45 },
  { day: 'Tue', active: 30 },
  { day: 'Wed', active: 60 },
  { day: 'Thu', active: 45 },
  { day: 'Fri', active: 90 },
  { day: 'Sat', active: 120 },
  { day: 'Sun', active: 20 },
];

const weightData = [
    { week: 'W1', weight: 82 },
    { week: 'W2', weight: 81.5 },
    { week: 'W3', weight: 80.8 },
    { week: 'W4', weight: 80.2 },
    { week: 'W5', weight: 79.5 },
];

export const ActivityTab: React.FC = () => {
  return (
    <div className="p-6 pb-32 min-h-screen">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-8">
            Activity
      </h1>

      <div className="space-y-8">
        
        {/* Weekly Chart */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-500/20 p-2 rounded-xl">
                    <Calendar className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                    <h3 className="font-bold text-white">Weekly Minutes</h3>
                    <p className="text-xs text-zinc-500">Active time per day</p>
                </div>
            </div>
            
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData}>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} />
                        <Tooltip 
                            contentStyle={{backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #3f3f46', color: '#fff'}}
                            itemStyle={{color: '#fff'}}
                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        />
                        <Bar dataKey="active" fill="#c084fc" radius={[6, 6, 6, 6]} barSize={12} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Weight Line Chart */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-pink-500/20 p-2 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                    <h3 className="font-bold text-white">Weight Goal</h3>
                    <p className="text-xs text-zinc-500">Last 5 weeks progress</p>
                </div>
            </div>
            
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightData}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.3} />
                        <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} />
                        <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                        <Tooltip 
                            contentStyle={{backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #3f3f46', color: '#fff'}}
                        />
                        <Line type="monotone" dataKey="weight" stroke="#ec4899" strokeWidth={3} dot={{fill: '#ec4899', r: 4, strokeWidth: 0}} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

      </div>
    </div>
  );
};