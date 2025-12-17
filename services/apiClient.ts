/**
 * FitBridge API Client
 * Connects the frontend to the Python FastAPI backend
 */

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface WorkoutPlan {
  title: string;
  duration: string;
  difficulty: string;
  schedule: {
    dayTitle: string;
    exercises: {
      name: string;
      sets: number;
      reps: string;
      notes?: string;
      description?: string;
    }[];
  }[];
}

export interface DietPlan {
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snack?: Meal;
  };
}

export interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  description: string;
}

export interface UserProfile {
  name: string;
  weight: number;
  height: number;
  goal: string;
  fitness_level: string;
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem("fitbridge_token") || "";

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();
    console.log('Raw API response from backend:', data);

    if (!response.ok) {
      return { success: false, error: data.detail || "API request failed" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("API call error:", error);
    return {
      success: false,
      error: "Network error. Please check your connection.",
    };
  }
}

// ==========================================
// HEALTH CHECK
// ==========================================

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// ==========================================
// AI GENERATION
// ==========================================

export async function generateWorkoutPlan(
  userDescription: string,
  userProfile?: UserProfile
): Promise<ApiResponse<WorkoutPlan>> {
  const response = await apiCall<{ plan: WorkoutPlan }>("/api/ai/generate", {
    method: "POST",
    body: JSON.stringify({
      user_description: userDescription,
      plan_type: "workout",
      user_profile: userProfile,
    }),
  });

  if (response.success && response.data) {
    return { success: true, data: response.data.plan };
  }
  return { success: false, error: response.error };
}

export async function generateDietPlan(
  userDescription: string,
  userProfile?: UserProfile
): Promise<ApiResponse<DietPlan>> {
  const response = await apiCall<{ plan: DietPlan }>("/api/ai/generate", {
    method: "POST",
    body: JSON.stringify({
      user_description: userDescription,
      plan_type: "diet",
      user_profile: userProfile,
    }),
  });

  if (response.success && response.data) {
    return { success: true, data: response.data.plan };
  }
  return { success: false, error: response.error };
}

// ==========================================
// WORKOUT LOGS
// ==========================================

export async function logWorkout(workout: {
  title: string;
  duration_minutes: number;
  workout_type?: string;
  calories_burned?: number;
  exercises?: any[];
  notes?: string;
  is_ai_generated?: boolean;
}): Promise<ApiResponse<any>> {
  return apiCall("/api/workout/log", {
    method: "POST",
    body: JSON.stringify(workout),
  });
}

export async function getWorkoutLogs(
  limit: number = 10,
  offset: number = 0
): Promise<ApiResponse<any[]>> {
  return apiCall(`/api/workout/logs?limit=${limit}&offset=${offset}`);
}

export async function getWorkoutStats(
  days: number = 7
): Promise<ApiResponse<any>> {
  return apiCall(`/api/workout/stats?days=${days}`);
}

export async function deleteWorkoutLog(
  workoutId: string
): Promise<ApiResponse<any>> {
  return apiCall(`/api/workout/logs/${workoutId}`, {
    method: "DELETE",
  });
}

// ==========================================
// DIET LOGS
// ==========================================

export async function logMeal(meal: {
  meal_type: string;
  meal_name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  description?: string;
  is_ai_generated?: boolean;
}): Promise<ApiResponse<any>> {
  return apiCall("/api/diet/log", {
    method: "POST",
    body: JSON.stringify(meal),
  });
}

export async function getDietLogs(
  limit: number = 20,
  logDate?: string
): Promise<ApiResponse<any[]>> {
  let url = `/api/diet/logs?limit=${limit}`;
  if (logDate) url += `&log_date=${logDate}`;
  return apiCall(url);
}

export async function getTodayMeals(): Promise<ApiResponse<any>> {
  return apiCall("/api/diet/logs/today");
}

export async function getDietStats(
  days: number = 7
): Promise<ApiResponse<any>> {
  return apiCall(`/api/diet/stats?days=${days}`);
}

export async function deleteMealLog(mealId: string): Promise<ApiResponse<any>> {
  return apiCall(`/api/diet/logs/${mealId}`, {
    method: "DELETE",
  });
}

// ==========================================
// CHAT
// ==========================================

export async function sendChatMessage(
  message: string,
  history: { role: string; content: string }[] = [],
  userContext?: any
): Promise<ApiResponse<{ response: string }>> {
  return apiCall("/api/chat/send", {
    method: "POST",
    body: JSON.stringify({
      message,
      history,
      user_context: userContext,
    }),
  });
}

export async function* streamChatMessage(
  message: string,
  history: { role: string; content: string }[] = [],
  userContext?: any
): AsyncGenerator<string, void, unknown> {
  try {
    const token = localStorage.getItem("fitbridge_token") || "";

    const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
        history,
        user_context: userContext,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to stream response");
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No reader available");

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              yield data.content;
            }
            if (data.done) {
              return;
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    console.error("Stream error:", error);
    throw error;
  }
}

export async function getChatSuggestions(): Promise<
  ApiResponse<{ suggestions: string[] }>
> {
  return apiCall("/api/chat/suggestions");
}
