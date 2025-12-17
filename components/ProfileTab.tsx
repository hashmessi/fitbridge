
import React from 'react';
import { User, Settings, Bell, Shield, LogOut, ChevronRight, Trophy, Flame, Crown, Star, Zap, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileProps {
    user: UserProfile;
    onLogout?: () => void;
}

export const ProfileTab: React.FC<ProfileProps> = ({ user, onLogout }) => {
    // Mock Badges Data
    const badges = [
        { id: 1, name: 'Early Riser', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10', unlocked: true },
        { id: 2, name: '7 Day Streak', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', unlocked: true },
        { id: 3, name: 'Heavy Lifter', icon: Trophy, color: 'text-blue-400', bg: 'bg-blue-400/10', unlocked: true },
        { id: 4, name: 'Nutritionist', icon: Star, color: 'text-green-400', bg: 'bg-green-400/10', unlocked: false },
        { id: 5, name: 'Marathoner', icon: Crown, color: 'text-purple-400', bg: 'bg-purple-400/10', unlocked: false },
    ];

    return (
        <div className="p-6 pb-32 min-h-screen animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Profile</h1>
                    <p className="text-zinc-500 text-sm">Manage your account</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-white/10 overflow-hidden">
                    <img
                        src={`https://picsum.photos/seed/${user.name}/200/200`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* Streak & Level Card */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 p-6 rounded-[2rem] mb-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] pointer-events-none"></div>
                 
                 <div className="flex justify-between items-start mb-6">
                     <div>
                         <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Current Level</p>
                         <h2 className="text-xl font-bold text-white flex items-center gap-2">
                             {user.levelTitle}
                             <Crown size={18} className="text-yellow-500 fill-yellow-500" />
                         </h2>
                     </div>
                     <div className="text-right">
                         <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Streak</p>
                         <div className="flex items-center justify-end gap-1 text-orange-500">
                             <Flame size={20} fill="currentColor" />
                             <span className="text-2xl font-black">{user.streak}</span>
                         </div>
                     </div>
                 </div>

                 {/* XP Bar */}
                 <div className="space-y-2">
                     <div className="flex justify-between text-xs text-zinc-500 font-medium">
                         <span>{user.xp} XP</span>
                         <span>2000 XP</span>
                     </div>
                     <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                            style={{ width: `${(user.xp / 2000) * 100}%` }}
                        ></div>
                     </div>
                     <p className="text-[10px] text-zinc-600 text-center mt-2">Earn 750 more XP to reach Elite status</p>
                 </div>
            </div>

            {/* Stats Row */}
             <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                        <span className="text-xs text-zinc-500 uppercase font-bold block">Weight</span>
                        <span className="text-xl font-bold text-white">{user.weight} <span className="text-sm font-normal text-zinc-600">kg</span></span>
                    </div>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                         <span className="text-xs text-zinc-500 uppercase font-bold block">Height</span>
                        <span className="text-xl font-bold text-white">{user.height} <span className="text-sm font-normal text-zinc-600">cm</span></span>
                    </div>
                </div>
            </div>

            {/* Badges Section */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white text-lg">Badges</h3>
                    <span className="text-xs text-zinc-500 font-medium">{badges.filter(b => b.unlocked).length}/{badges.length} Unlocked</span>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6">
                    {badges.map((badge) => (
                        <div key={badge.id} className="flex flex-col items-center gap-2 min-w-[80px]">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all ${
                                badge.unlocked 
                                ? `${badge.bg} ${badge.color} border-${badge.color.split('-')[1]}-500/30` 
                                : 'bg-zinc-900 border-zinc-800 text-zinc-700 grayscale'
                            }`}>
                                <badge.icon size={28} />
                            </div>
                            <span className={`text-[10px] font-bold text-center ${badge.unlocked ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                {badge.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Subscription Plans */}
            <div className="mb-8">
                <h3 className="font-bold text-white text-lg mb-4">Subscription</h3>
                <div className="bg-gradient-to-b from-zinc-800 to-black border border-yellow-500/30 rounded-[2rem] p-1 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-yellow-500/5 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="bg-zinc-900/90 rounded-[1.8rem] p-5 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                    FitBridge <span className="text-yellow-400">Pro</span>
                                </h4>
                                <p className="text-xs text-zinc-400">Unlock full AI potential</p>
                            </div>
                            <span className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-3 py-1 rounded-full text-xs font-bold">
                                $9.99/mo
                            </span>
                        </div>

                        <ul className="space-y-2 mb-6">
                            {[
                                'Unlimited AI Workout Generation',
                                'Advanced Diet Macros & Recipes',
                                'Gemini 3 Pro Thinking Model',
                                'No Ads'
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                                    <CheckCircle2 size={14} className="text-yellow-500" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Settings Links */}
            <div className="space-y-3">
                 <h3 className="font-bold text-zinc-500 text-xs uppercase tracking-wider pl-1 mb-2">Settings</h3>
                {[
                    { icon: Settings, label: 'Preferences' },
                    { icon: Bell, label: 'Notifications' },
                    { icon: Shield, label: 'Privacy & Data' },
                ].map((item, idx) => (
                    <button key={idx} className="w-full bg-zinc-900/30 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:bg-zinc-800 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-zinc-800 rounded-full group-hover:bg-zinc-700 text-zinc-400 transition-colors">
                                <item.icon size={18} />
                            </div>
                            <span className="text-zinc-200 font-medium">{item.label}</span>
                        </div>
                        <ChevronRight size={16} className="text-zinc-600" />
                    </button>
                ))}

                <button 
                    onClick={onLogout}
                    className="w-full mt-4 bg-red-500/5 border border-red-500/10 p-4 rounded-2xl flex items-center justify-center gap-2 text-red-500 font-medium hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </div>
    );
};
