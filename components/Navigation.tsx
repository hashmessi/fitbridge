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
              aria-label={`Go to ${tab.label}`}
              className={`flex flex-col items-center justify-center p-2 min-h-[48px] min-w-[48px] transition-all duration-300 relative ${
                isActive ? 'text-primary scale-110' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="relative flex flex-col items-center justify-center">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="mb-1" />
                <span className="text-[10px] font-medium leading-none">{tab.label}</span>
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
