/**
 * AuthScreen Component
 * Login and Signup UI with beautiful animations
 */

import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2,
  Dumbbell,
  Flame,
  Target,
  Chrome
} from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
  onSkip?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess, onSkip }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Import Supabase client dynamically to handle cases where it's not configured
      const { signIn, signUp, isSupabaseConfigured } = await import('../services/supabaseClient');
      
      if (!isSupabaseConfigured()) {
        // Demo mode - skip auth
        onAuthSuccess({
          id: 'demo-user',
          email: email || 'demo@fitbridge.app',
          name: name || 'Demo User'
        });
        return;
      }

      if (isLogin) {
        const { user } = await signIn(email, password);
        onAuthSuccess(user);
      } else {
        const { user } = await signUp(email, password, name);
        if (user) {
          onAuthSuccess(user);
        } else {
          setError('Check your email to confirm your account!');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const { signInWithGoogle, isSupabaseConfigured } = await import('../services/supabaseClient');
      
      if (!isSupabaseConfigured()) {
        onAuthSuccess({
          id: 'demo-user',
          email: 'demo@fitbridge.app',
          name: 'Demo User'
        });
        return;
      }

      await signInWithGoogle();
      // OAuth will redirect, so we don't need to handle success here
    } catch (err: any) {
      setError(err.message || 'Google sign in failed.');
      setIsLoading(false);
    }
  };

  const handleDemoMode = () => {
    onAuthSuccess({
      id: 'demo-user',
      email: 'demo@fitbridge.app',
      name: 'Demo User'
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-indigo-900/30 to-purple-900/20 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-primary/20 to-emerald-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col max-w-md mx-auto w-full px-6 py-8">
        
        {/* Logo & Welcome */}
        <div className="text-center mb-8 mt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-emerald-400 to-teal-500 shadow-2xl shadow-primary/30 mb-6">
            <Dumbbell className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            FitBridge
          </h1>
          <p className="text-zinc-500 mt-2">Your AI-powered fitness companion</p>
        </div>

        {/* Feature Pills */}
        <div className="flex justify-center gap-2 mb-8">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900/80 rounded-full border border-zinc-800">
            <Flame className="w-3 h-3 text-orange-400" />
            <span className="text-xs text-zinc-400">AI Workouts</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900/80 rounded-full border border-zinc-800">
            <Target className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-zinc-400">Smart Diet</span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl rounded-3xl border border-white/5 p-6 shadow-2xl">
          
          {/* Tab Switcher */}
          <div className="flex bg-zinc-800/50 rounded-xl p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                isLogin 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                !isLogin 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name field (signup only) */}
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            )}

            {/* Email field */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Password field */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-zinc-500 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-emerald-400 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-zinc-900/50 text-zinc-500">or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 border border-zinc-700/50 disabled:opacity-50"
          >
            <Chrome className="w-5 h-5" />
            Google
          </button>
        </div>

        {/* Demo Mode Link */}
        <div className="mt-6 text-center">
          <button
            onClick={handleDemoMode}
            className="text-zinc-500 hover:text-primary text-sm transition-colors"
          >
            Continue without account (Demo Mode)
          </button>
        </div>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-zinc-600">
          By continuing, you agree to our{' '}
          <a href="#" className="text-zinc-400 hover:text-white">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-zinc-400 hover:text-white">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};
