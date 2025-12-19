
import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { WorkoutTab } from './components/WorkoutTab';
import { DietTab } from './components/DietTab';
import { ActivityTab } from './components/ActivityTab';
import { ChatTab } from './components/ChatTab';
import { ProfileTab } from './components/ProfileTab';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { AppTab, UserProfile } from './types';
import { Loader2 } from 'lucide-react';

// Default user profile for demo/fallback mode
const DEFAULT_USER: UserProfile = {
  name: 'Alex',
  weight: 78,
  height: 180,
  goal: 'Muscle Gain',
  level: 'Intermediate',
  streak: 12,
  xp: 1250,
  levelTitle: 'Fitness Enthusiast'
};

// App states
type AppState = 'loading' | 'auth' | 'onboarding' | 'app';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('loading');
  const [currentTab, setCurrentTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const { 
        getSession, 
        isSupabaseConfigured, 
        getUserProfile, 
        getTotalXP,
        getUserStreaks 
      } = await import('./services/supabaseClient');
      
      if (!isSupabaseConfigured()) {
        // Supabase not configured - check local storage for demo mode
        const savedUser = localStorage.getItem('fitbridge_demo_user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          
          const savedProfile = localStorage.getItem('fitbridge_user_profile');
          if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            const savedData = JSON.parse(localStorage.getItem('fitbridge_dashboard_data') || '{}');
            setUserProfile({
              ...DEFAULT_USER,
              ...profile,
              level: profile.fitness_level || 'Intermediate',
              streak: savedData.streak || 0,
              xp: savedData.xp || 0,
            });
            setAppState('app');
          } else {
            setAppState('onboarding');
          }
        } else {
          setAppState('auth');
        }
        return;
      }

      // Try to get existing session from Supabase
      const session = await getSession();
      
      if (session?.user) {
        setCurrentUser(session.user);
        
        try {
          const profile = await getUserProfile(session.user.id);
          
          if (profile && profile.goal) {
            // Fetch real streak and XP from database
            const { xp, level, title } = await getTotalXP(session.user.id);
            const streaks = await getUserStreaks(session.user.id);
            const workoutStreak = streaks.find(s => s.streak_type === 'workout');
            
            setUserProfile({
              name: profile.name || 'User',
              weight: profile.weight || 70,
              height: profile.height || 170,
              goal: profile.goal,
              level: profile.fitness_level || 'Intermediate',
              streak: workoutStreak?.current_streak || 0,
              xp: xp,
              levelTitle: title,
            });
            setAppState('app');
          } else {
            setAppState('onboarding');
          }
        } catch (err) {
          console.error('Profile fetch error:', err);
          setAppState('onboarding');
        }
      } else {
        setAppState('auth');
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setAppState('auth');
    }
  };

  const getLevelTitle = (level: string): string => {
    switch (level) {
      case 'Beginner': return 'Rising Star';
      case 'Intermediate': return 'Fitness Enthusiast';
      case 'Advanced': return 'Fitness Pro';
      default: return 'Fitness Explorer';
    }
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    
    // Save to localStorage for demo mode
    localStorage.setItem('fitbridge_demo_user', JSON.stringify(user));
    localStorage.setItem('fitbridge_token', user.id);
    
    // Check if returning user with profile
    const savedProfile = localStorage.getItem('fitbridge_user_profile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserProfile({
        ...DEFAULT_USER,
        ...profile,
        level: profile.fitness_level || 'Intermediate',
      });
      setAppState('app');
    } else {
      setAppState('onboarding');
    }
  };

  const handleOnboardingComplete = (profile: any) => {
    const fullProfile: UserProfile = {
      name: profile.name,
      weight: profile.weight,
      height: profile.height,
      goal: profile.goal,
      level: profile.fitness_level || 'Intermediate',
      streak: 0,
      xp: 0,
      levelTitle: getLevelTitle(profile.fitness_level || 'Intermediate'),
    };
    
    setUserProfile(fullProfile);
    
    // Save to localStorage
    localStorage.setItem('fitbridge_user_profile', JSON.stringify(profile));
    
    setAppState('app');
  };

  const handleLogout = async () => {
    try {
      const { signOut, isSupabaseConfigured } = await import('./services/supabaseClient');
      
      if (isSupabaseConfigured()) {
        await signOut();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    // Clear local storage
    localStorage.removeItem('fitbridge_demo_user');
    localStorage.removeItem('fitbridge_user_profile');
    localStorage.removeItem('fitbridge_token');
    
    setCurrentUser(null);
    setUserProfile(DEFAULT_USER);
    setAppState('auth');
  };

  const renderTab = () => {
    switch (currentTab) {
      case AppTab.DASHBOARD:
        return <Dashboard user={userProfile} onNavigate={setCurrentTab} />;
      case AppTab.WORKOUT:
        return <WorkoutTab />;
      case AppTab.DIET:
        return <DietTab />;
      case AppTab.ACTIVITY:
        return <ActivityTab />;
      case AppTab.CHAT:
        return <ChatTab />;
      case AppTab.PROFILE:
        return <ProfileTab user={userProfile} onLogout={handleLogout} />;
      default:
        return <Dashboard user={userProfile} onNavigate={setCurrentTab} />;
    }
  };

  // Loading state
  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-zinc-500">Loading FitBridge...</p>
        </div>
      </div>
    );
  }

  // Authentication screen
  if (appState === 'auth') {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Onboarding screen
  if (appState === 'onboarding') {
    return (
      <OnboardingScreen 
        userId={currentUser?.id || 'demo-user'} 
        onComplete={handleOnboardingComplete} 
      />
    );
  }

  // Main app
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
