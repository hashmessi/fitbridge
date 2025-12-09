import React from 'react';
import { User, Settings, Bell, Shield, LogOut, ChevronRight } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileProps {
    user: UserProfile;
}

export const ProfileTab: React.FC<ProfileProps> = ({ user }) => {
  return (
    <div className="p-6 pb-32 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-white/10 p-1">
             <img 
                src={`https://picsum.photos/seed/${user.name}/200/200`} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
            />
        </div>
        <div>
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-zinc-500 text-sm">Member since 2023</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl text-center">
                <span className="block text-2xl font-bold text-white">{user.weight}kg</span>
                <span className="text-xs text-zinc-500 uppercase">Weight</span>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl text-center">
                <span className="block text-2xl font-bold text-white">{user.height}cm</span>
                <span className="text-xs text-zinc-500 uppercase">Height</span>
            </div>
      </div>

      <div className="space-y-4">
        {[
            { icon: Settings, label: 'Preferences' },
            { icon: Bell, label: 'Notifications' },
            { icon: Shield, label: 'Privacy & Data' },
        ].map((item, idx) => (
            <button key={idx} className="w-full bg-zinc-900/30 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:bg-zinc-800 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-zinc-800 rounded-full group-hover:bg-white group-hover:text-black transition-colors">
                        <item.icon size={18} />
                    </div>
                    <span className="text-zinc-200 font-medium">{item.label}</span>
                </div>
                <ChevronRight size={16} className="text-zinc-600" />
            </button>
        ))}

        <button className="w-full mt-8 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center justify-center gap-2 text-red-400 font-medium hover:bg-red-500/20 transition-colors">
            <LogOut size={18} />
            Sign Out
        </button>
      </div>
    </div>
  );
};