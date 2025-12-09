import React from 'react';
import { Home, Dumbbell, Utensils, BarChart2, MessageSquare, User } from 'lucide-react';
import { AppTab } from '../types';

interface NavigationProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: AppTab.DASHBOARD, icon: Home, label: 'Home' },
    { id: AppTab.WORKOUT, icon: Dumbbell, label: 'Workouts' },
    { id: AppTab.DIET, icon: Utensils, label: 'Diet' },
    { id: AppTab.ACTIVITY, icon: BarChart2, label: 'Activity' },
    { id: AppTab.CHAT, icon: MessageSquare, label: 'AI Coach' },
    { id: AppTab.PROFILE, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-950/80 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
      <div className="flex justify-around items-center h-20 px-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${
                isActive ? 'text-primary scale-110' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};