
import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { WorkoutTab } from './components/WorkoutTab';
import { DietTab } from './components/DietTab';
import { ActivityTab } from './components/ActivityTab';
import { ChatTab } from './components/ChatTab';
import { ProfileTab } from './components/ProfileTab';
import { AppTab, UserProfile } from './types';
import { ShieldCheck, ArrowRight, Loader2, CreditCard } from 'lucide-react';

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
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      // Check if running in AI Studio environment with window.aistudio
      if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
        const has = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      } else if (process.env.API_KEY) {
        // Fallback for standard environments
        setHasApiKey(true);
      }
      setIsCheckingKey(false);
    };
    checkKey();
  }, []);

  const handleConnectKey = async () => {
    if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
        // Assume success to avoid race conditions as per instructions
        setHasApiKey(true); 
    }
  };

  const renderTab = () => {
    switch (currentTab) {
      case AppTab.DASHBOARD:
        return <Dashboard user={MOCK_USER} onNavigate={setCurrentTab} />;
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
        return <Dashboard user={MOCK_USER} onNavigate={setCurrentTab} />;
    }
  };

  if (isCheckingKey) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
        </div>
    );
  }

  if (!hasApiKey) {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
             {/* Background Effects */}
             <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none"></div>
             <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>

             <div className="relative z-10 max-w-sm w-full bg-zinc-900/50 border border-white/5 p-8 rounded-3xl backdrop-blur-xl flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <ShieldCheck className="w-8 h-8 text-black" />
                </div>
                
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Welcome to FitBridge</h1>
                    <p className="text-zinc-400 text-sm">To access AI Workouts, Diet Plans, and the Smart Coach, please connect your Google Gemini API Key.</p>
                </div>

                <div className="space-y-4 w-full">
                    <button 
                        onClick={handleConnectKey}
                        className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10"
                    >
                        Connect Intelligence <ArrowRight size={18} />
                    </button>
                    
                    <a 
                        href="https://ai.google.dev/gemini-api/docs/billing" 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        <CreditCard size={12} />
                        Billing required for advanced models
                    </a>
                </div>
             </div>
        </div>
    );
  }

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
