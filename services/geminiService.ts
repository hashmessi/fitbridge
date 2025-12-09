
import { GoogleGenAI, Type } from "@google/genai";
import { WorkoutPlan, DietPlan } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateWorkout = async (userDescription: string): Promise<WorkoutPlan | null> => {
  try {
    // Switch to gemini-2.5-flash for better JSON stability and to avoid 500 errors
    const model = 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model,
      contents: `Create a detailed physical fitness workout plan based on these requirements: ${userDescription}. 
      Structure the plan into days (e.g., "Day 1: Chest & Triceps", "Day 2: Back & Biceps") if appropriate for the goal/duration, or a single day.
      The plan MUST be real, executable physical exercises. 
      Return strictly structured JSON.`,
      config: {
        systemInstruction: "You are an elite fitness coach. You create serious, effective, and practical workout splits. You never output nonsense or unrelated topics. Your output is always valid JSON matching the schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            duration: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayTitle: { type: Type.STRING },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        sets: { type: Type.NUMBER },
                        reps: { type: Type.STRING },
                        notes: { type: Type.STRING },
                        description: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    
    if (response.text) {
      try {
        const plan = JSON.parse(response.text);
        // Ensure plan is an object and schedule array exists
        if (plan && typeof plan === 'object') {
          if (!Array.isArray(plan.schedule)) {
            // Fallback for older schema or hallucination
            if (Array.isArray(plan.exercises)) {
                plan.schedule = [{ dayTitle: 'Day 1', exercises: plan.exercises }];
            } else {
                plan.schedule = [];
            }
          }
          return plan as WorkoutPlan;
        }
      } catch (e) {
        console.error("JSON parse error", e);
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating workout:", error);
    return null;
  }
};

export const generateDiet = async (userDescription: string): Promise<DietPlan | null> => {
  try {
    const model = 'gemini-3-pro-preview';
    const response = await ai.models.generateContent({
      model,
      contents: `Generate a daily diet plan for: ${userDescription}. Return JSON.`,
      config: {
        systemInstruction: "You are a professional nutritionist. Create balanced, healthy meal plans with accurate macro calculations.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dailyCalories: { type: Type.NUMBER },
            macros: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fats: { type: Type.NUMBER }
              }
            },
            meals: {
              type: Type.OBJECT,
              properties: {
                breakfast: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    calories: { type: Type.NUMBER },
                    protein: { type: Type.NUMBER },
                    carbs: { type: Type.NUMBER },
                    fats: { type: Type.NUMBER },
                    description: { type: Type.STRING }
                  }
                },
                lunch: {
                   type: Type.OBJECT,
                   properties: {
                    name: { type: Type.STRING },
                    calories: { type: Type.NUMBER },
                    protein: { type: Type.NUMBER },
                    carbs: { type: Type.NUMBER },
                    fats: { type: Type.NUMBER },
                    description: { type: Type.STRING }
                  }
                },
                dinner: {
                   type: Type.OBJECT,
                   properties: {
                    name: { type: Type.STRING },
                    calories: { type: Type.NUMBER },
                    protein: { type: Type.NUMBER },
                    carbs: { type: Type.NUMBER },
                    fats: { type: Type.NUMBER },
                    description: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as DietPlan;
    }
    return null;
  } catch (error) {
    console.error("Error generating diet:", error);
    return null;
  }
};

export const chatWithThinking = async (history: {role: string, parts: {text: string}[]}[], newMessage: string) => {
  // We use the Thinking model for the chat as requested
  const model = 'gemini-3-pro-preview'; 
  
  const chat = ai.chats.create({
    model,
    history: history,
    config: {
      thinkingConfig: {
        thinkingBudget: 32768, // Max for Gemini 3 Pro
      },
      // Do NOT set maxOutputTokens when using thinking budget as per instructions
    }
  });

  const result = await chat.sendMessageStream({ message: newMessage });
  return result;
};
