/**
 * useApi Hook
 * Provides easy access to backend API with loading and error states
 */

import { useState, useCallback } from 'react';
import * as api from './apiClient';

// Check if backend is available
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useBackendStatus() {
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkBackend = useCallback(async () => {
    setIsChecking(true);
    try {
      const available = await api.checkHealth();
      setIsBackendAvailable(available);
      return available;
    } catch {
      setIsBackendAvailable(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return { isBackendAvailable, isChecking, checkBackend, BACKEND_URL };
}

export function useWorkoutApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWorkout = useCallback(async (description: string, userProfile?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.generateWorkoutPlan(description, userProfile);
      if (!result.success) {
        setError(result.error || 'Failed to generate workout');
        return null;
      }
      return result.data;
    } catch (err: any) {
      setError(err.message || 'Failed to generate workout');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logWorkout = useCallback(async (workout: Parameters<typeof api.logWorkout>[0]) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.logWorkout(workout);
      if (!result.success) {
        setError(result.error || 'Failed to log workout');
        return null;
      }
      return result.data;
    } catch (err: any) {
      setError(err.message || 'Failed to log workout');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getWorkoutLogs = useCallback(async (limit = 10, offset = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getWorkoutLogs(limit, offset);
      if (!result.success) {
        setError(result.error || 'Failed to fetch workouts');
        return [];
      }
      return result.data || [];
    } catch (err: any) {
      setError(err.message || 'Failed to fetch workouts');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStats = useCallback(async (days = 7) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getWorkoutStats(days);
      if (!result.success) {
        setError(result.error || 'Failed to fetch stats');
        return null;
      }
      return result.data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stats');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    clearError: () => setError(null),
    generateWorkout,
    logWorkout,
    getWorkoutLogs,
    getStats,
  };
}

export function useDietApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDiet = useCallback(async (description: string, userProfile?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.generateDietPlan(description, userProfile);
      if (!result.success) {
        setError(result.error || 'Failed to generate diet plan');
        return null;
      }
      return result.data;
    } catch (err: any) {
      setError(err.message || 'Failed to generate diet plan');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logMeal = useCallback(async (meal: Parameters<typeof api.logMeal>[0]) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.logMeal(meal);
      if (!result.success) {
        setError(result.error || 'Failed to log meal');
        return null;
      }
      return result.data;
    } catch (err: any) {
      setError(err.message || 'Failed to log meal');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTodayMeals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getTodayMeals();
      if (!result.success) {
        setError(result.error || 'Failed to fetch meals');
        return null;
      }
      return result.data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch meals');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    clearError: () => setError(null),
    generateDiet,
    logMeal,
    getTodayMeals,
  };
}

export function useChatApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    message: string,
    history: { role: string; content: string }[] = [],
    userContext?: any
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.sendChatMessage(message, history, userContext);
      if (!result.success) {
        setError(result.error || 'Failed to send message');
        return null;
      }
      return result.data?.response;
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const streamMessage = useCallback(async function* (
    message: string,
    history: { role: string; content: string }[] = [],
    userContext?: any
  ) {
    setIsLoading(true);
    setError(null);
    try {
      for await (const chunk of api.streamChatMessage(message, history, userContext)) {
        yield chunk;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to stream message');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    clearError: () => setError(null),
    sendMessage,
    streamMessage,
  };
}
