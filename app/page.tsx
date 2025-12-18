'use client';

import React, { useState, useEffect } from 'react';
import { AuthScreen } from '../components/AuthScreen';
import { OnboardingScreen } from '../components/OnboardingScreen';
import { Dashboard } from '../components/Dashboard';
import { WorkoutTab } from '../components/WorkoutTab';
import { DietTab } from '../components/DietTab';
import { ActivityTab } from '../components/ActivityTab';
import { ChatTab } from '../components/ChatTab';
import { ProfileTab } from '../components/ProfileTab';
import { Navigation } from '../components/Navigation';
import { UserProfile, AppTab } from '../types';
import { getCurrentUser, signOut } from '../services/supabaseClient';

// Demo user for unauthenticated usage
const DEMO_USER: UserProfile = {
  id: 'demo-user',
  name: 'hash',
  email: 'demo@fitbridge.app',
  weight: 50,
  height: 170,
  goals: ['Build Muscle', 'Stay Active'],
  level: 'Intermediate',
  levelTitle: 'Fitness Enthusiast',
  xp: 1250,
  streak: 12,
};

export default function Home() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        if (!currentUser.weight || !currentUser.height) {
          setNeedsOnboarding(true);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    if (!loggedInUser.weight || !loggedInUser.height) {
      setNeedsOnboarding(true);
    }
  };

  const handleOnboardingComplete = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    setNeedsOnboarding(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsDemoMode(false);
      setActiveTab(AppTab.DASHBOARD);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDemoMode = () => {
    setUser(DEMO_USER);
    setIsDemoMode(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD:
        return <Dashboard user={user!} onNavigate={setActiveTab} />;
      case AppTab.WORKOUT:
        return <WorkoutTab />;
      case AppTab.DIET:
        return <DietTab />;
      case AppTab.ACTIVITY:
        return <ActivityTab />;
      case AppTab.CHAT:
        return <ChatTab />;
      case AppTab.PROFILE:
        return <ProfileTab user={user!} onLogout={handleLogout} />;
      default:
        return <Dashboard user={user!} onNavigate={setActiveTab} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} onDemoMode={handleDemoMode} />;
  }

  if (needsOnboarding) {
    return <OnboardingScreen user={user} onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-lg mx-auto relative">
        {renderContent()}
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </main>
    </div>
  );
}
