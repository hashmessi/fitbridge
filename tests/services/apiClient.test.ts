/**
 * Tests for API client functions.
 * All fetch calls are mocked.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockFetch, mockFetchError } from '../setupTests';

// Import the functions we're testing
import {
  checkHealth,
  logWorkout,
  getWorkoutLogs,
  logMeal,
  getDietLogs,
  generateWorkoutPlan,
  generateDietPlan,
} from '../../services/apiClient';

// -----------------------------------------------------------------------------
// Health Check Tests
// -----------------------------------------------------------------------------

describe('checkHealth', () => {
  it('should return true when API is healthy', async () => {
    mockFetch({ status: 'healthy' }, true, 200);
    
    const result = await checkHealth();
    
    expect(result).toBe(true);
  });

  it('should return false when API is down', async () => {
    mockFetch({ error: 'Server error' }, false, 500);
    
    const result = await checkHealth();
    
    expect(result).toBe(false);
  });

  it('should return false on network error', async () => {
    mockFetchError('Network error');
    
    const result = await checkHealth();
    
    expect(result).toBe(false);
  });
});

// -----------------------------------------------------------------------------
// Workout Logging Tests
// -----------------------------------------------------------------------------

describe('logWorkout', () => {
  beforeEach(() => {
    localStorage.setItem('fitbridge_token', 'test-token');
  });

  it('should send correct request payload', async () => {
    mockFetch({ success: true, data: { id: 'workout-1' } });
    
    const workout = {
      title: 'Morning Run',
      duration_minutes: 30,
      workout_type: 'cardio',
      calories_burned: 300,
    };
    
    await logWorkout(workout);
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/workout/log'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(workout),
      })
    );
  });

  it('should return success response', async () => {
    mockFetch({ success: true, data: { id: 'workout-1' } });
    
    const result = await logWorkout({
      title: 'Test Workout',
      duration_minutes: 45,
    });
    
    expect(result.success).toBe(true);
  });

  it('should handle API errors', async () => {
    mockFetch({ detail: 'Validation error' }, false, 422);
    
    const result = await logWorkout({
      title: 'Test',
      duration_minutes: 10,
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// -----------------------------------------------------------------------------
// Get Workout Logs Tests
// -----------------------------------------------------------------------------

describe('getWorkoutLogs', () => {
  beforeEach(() => {
    localStorage.setItem('fitbridge_token', 'test-token');
  });

  it('should fetch workout logs with default parameters', async () => {
    mockFetch({ success: true, data: [] });
    
    await getWorkoutLogs();
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/workout/logs?limit=10&offset=0'),
      expect.any(Object)
    );
  });

  it('should accept custom limit and offset', async () => {
    mockFetch({ success: true, data: [] });
    
    await getWorkoutLogs(5, 10);
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('limit=5&offset=10'),
      expect.any(Object)
    );
  });

  it('should return workout data', async () => {
    const mockLogs = [
      { id: '1', title: 'Workout 1', duration_minutes: 30 },
      { id: '2', title: 'Workout 2', duration_minutes: 45 },
    ];
    mockFetch({ success: true, data: mockLogs });
    
    const result = await getWorkoutLogs();
    
    expect(result.success).toBe(true);
  });
});

// -----------------------------------------------------------------------------
// Meal Logging Tests
// -----------------------------------------------------------------------------

describe('logMeal', () => {
  beforeEach(() => {
    localStorage.setItem('fitbridge_token', 'test-token');
  });

  it('should send correct request payload', async () => {
    mockFetch({ success: true, data: { id: 'meal-1' } });
    
    const meal = {
      meal_type: 'Breakfast',
      meal_name: 'Oatmeal',
      calories: 350,
      protein: 12,
      carbs: 55,
      fats: 8,
    };
    
    await logMeal(meal);
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/diet/log'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(meal),
      })
    );
  });

  it('should return success response', async () => {
    mockFetch({ success: true, data: { id: 'meal-1' } });
    
    const result = await logMeal({
      meal_type: 'Lunch',
      meal_name: 'Salad',
      calories: 400,
    });
    
    expect(result.success).toBe(true);
  });
});

// -----------------------------------------------------------------------------
// Get Diet Logs Tests
// -----------------------------------------------------------------------------

describe('getDietLogs', () => {
  beforeEach(() => {
    localStorage.setItem('fitbridge_token', 'test-token');
  });

  it('should fetch diet logs with default parameters', async () => {
    mockFetch({ success: true, data: [] });
    
    await getDietLogs();
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/diet/logs?limit=20'),
      expect.any(Object)
    );
  });

  it('should include date filter when provided', async () => {
    mockFetch({ success: true, data: [] });
    
    await getDietLogs(20, '2025-12-21');
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('log_date=2025-12-21'),
      expect.any(Object)
    );
  });
});

// -----------------------------------------------------------------------------
// AI Plan Generation Tests
// -----------------------------------------------------------------------------

describe('generateWorkoutPlan', () => {
  beforeEach(() => {
    localStorage.setItem('fitbridge_token', 'test-token');
  });

  it('should send workout generation request', async () => {
    const mockPlan = {
      title: 'Custom Workout',
      duration: '4 weeks',
      schedule: [],
    };
    mockFetch({ success: true, data: { plan: mockPlan } });
    
    const result = await generateWorkoutPlan('Build muscle');
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/ai/generate'),
      expect.objectContaining({
        method: 'POST',
      })
    );
    expect(result.success).toBe(true);
  });

  it('should include user profile when provided', async () => {
    mockFetch({ success: true, data: { plan: {} } });
    
    await generateWorkoutPlan('Lose weight', {
      name: 'Test',
      weight: 70,
      height: 175,
      goal: 'weight_loss',
      fitness_level: 'beginner',
    });
    
    const callBody = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
    );
    expect(callBody.user_profile).toBeDefined();
    expect(callBody.plan_type).toBe('workout');
  });
});

describe('generateDietPlan', () => {
  beforeEach(() => {
    localStorage.setItem('fitbridge_token', 'test-token');
  });

  it('should send diet generation request', async () => {
    const mockPlan = {
      dailyCalories: 2000,
      meals: {},
    };
    mockFetch({ success: true, data: { plan: mockPlan } });
    
    const result = await generateDietPlan('High protein diet');
    
    const callBody = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body
    );
    expect(callBody.plan_type).toBe('diet');
    expect(result.success).toBe(true);
  });
});

// -----------------------------------------------------------------------------
// Error Handling Tests
// -----------------------------------------------------------------------------

describe('API Error Handling', () => {
  it('should handle network errors gracefully', async () => {
    mockFetchError('Network error');
    
    const result = await logWorkout({
      title: 'Test',
      duration_minutes: 30,
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Network error');
  });

  it('should include authorization header', async () => {
    localStorage.setItem('fitbridge_token', 'my-secret-token');
    mockFetch({ success: true, data: [] });
    
    await getWorkoutLogs();
    
    const headers = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].headers;
    expect(headers.Authorization).toBe('Bearer my-secret-token');
  });
});
