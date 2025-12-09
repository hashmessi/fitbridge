import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { WorkoutTab } from './components/WorkoutTab';
import { DietTab } from './components/DietTab';
import { ActivityTab } from './components/ActivityTab';
import { ChatTab } from './components/ChatTab';
import { ProfileTab } from './components/ProfileTab';
import { AppTab, UserProfile } from './types';

// Mock User Data
const MOCK_USER: UserProfile = {
  name: 'Alex',
  weight: 78,
  height: 180,
  goal: 'Muscle Gain',
  level: 'Intermediate',
  streak: 12,
  xp: 1250,
  levelTitle: 'Fitness Enthusiast'
};

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AppTab>(AppTab.DASHBOARD);

  const renderTab = () => {
    switch (currentTab) {
      case AppTab.DASHBOARD:
        return <Dashboard user={MOCK_USER} />;
      case AppTab.WORKOUT:
        return <WorkoutTab />;
      case AppTab.DIET:
        return <DietTab />;
      case AppTab.ACTIVITY:
        return <ActivityTab />;
      case AppTab.CHAT:
        return <ChatTab />;
      case AppTab.PROFILE:
        return <ProfileTab user={MOCK_USER} />;
      default:
        return <Dashboard user={MOCK_USER} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative font-sans selection:bg-primary selection:text-black">
        {/* Global gradients for atmosphere */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-0"></div>
      
      <main className="relative z-10 max-w-md mx-auto min-h-screen border-x border-zinc-900 bg-black shadow-2xl overflow-hidden">
        {renderTab()}
      </main>
      
      <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
};

export default App;