import React from 'react';
import { Flame, Trophy, Zap, Target, Award } from 'lucide-react';
import { UserProfile } from '../types';

interface DashboardProps {
  user: UserProfile;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  return (
    <div className="p-6 space-y-8 pb-32 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            Hello, {user.name}
          </h1>
          <p className="text-zinc-400 text-sm">Let's crush today's goals.</p>
        </div>
        <div className="bg-zinc-800/50 p-2 rounded-full border border-white/5">
          <img 
            src={`https://picsum.photos/seed/${user.name}/100/100`} 
            alt="Profile" 
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
      </header>

      {/* Streak & XP Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 rounded-3xl p-5 flex flex-col items-center justify-center space-y-2 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-orange-500/10 blur-xl group-hover:bg-orange-500/20 transition-all duration-500"></div>
          <Flame className="text-orange-500 w-8 h-8 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
          <div className="text-center z-10">
            <span className="text-3xl font-black text-white">{user.streak}</span>
            <p className="text-xs text-orange-200 font-medium">Day Streak</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 rounded-3xl p-5 flex flex-col items-center justify-center space-y-2 backdrop-blur-sm relative overflow-hidden">
          <Zap className="text-primary w-8 h-8 drop-shadow-[0_0_10px_rgba(217,249,157,0.5)]" />
          <div className="text-center z-10">
            <span className="text-3xl font-black text-white">{user.xp}</span>
            <p className="text-xs text-lime-200 font-medium">Total XP</p>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-zinc-900/80 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex justify-between items-end mb-4">
            <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Current Level</p>
                <h3 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    {user.levelTitle}
                </h3>
            </div>
            <span className="text-sm font-mono text-zinc-400">1,250 / 2,000 XP</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-secondary w-[62.5%] shadow-[0_0_15px_rgba(217,249,157,0.4)]"></div>
        </div>
      </div>

      {/* Today's Quests */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-secondary" />
            Daily Quests
        </h2>
        <div className="space-y-3">
            {[
                { title: 'Complete Morning Workout', xp: 50, done: true },
                { title: 'Drink 2L Water', xp: 30, done: false },
                { title: 'Log Lunch Meal', xp: 20, done: false }
            ].map((quest, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${quest.done ? 'bg-primary border-primary' : 'border-zinc-600'}`}>
                            {quest.done && <span className="text-black text-xs font-bold">✓</span>}
                        </div>
                        <span className={`text-sm ${quest.done ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{quest.title}</span>
                    </div>
                    <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-lg">+{quest.xp} XP</span>
                </div>
            ))}
        </div>
      </div>

       {/* Achievements */}
       <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            Recent Badges
        </h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="min-w-[100px] h-[120px] bg-zinc-900/50 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 p-2">
                    <img src={`https://picsum.photos/seed/badge${i}/80/80`} className="w-12 h-12 rounded-full border-2 border-purple-500/30" alt="badge" />
                    <span className="text-[10px] text-center text-zinc-400">Early Riser</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};