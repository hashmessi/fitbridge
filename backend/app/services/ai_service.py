"""
AI Service
Handles all AI operations with OpenAI/DeepSeek or Mock mode
"""

import json
from typing import Optional, List, Dict, Any, AsyncGenerator

from app.config import Settings


# Mock responses for testing without AI API
MOCK_WORKOUT_PLAN = {
    "title": "Full Body Strength Program",
    "duration": "4 weeks",
    "difficulty": "Intermediate",
    "schedule": [
        {
            "dayTitle": "Day 1: Upper Body Push",
            "exercises": [
                {"name": "Bench Press", "sets": 4, "reps": "8-10", "notes": "Focus on controlled movement", "description": "Lie on bench, grip bar shoulder-width apart, lower to chest and push up"},
                {"name": "Overhead Press", "sets": 3, "reps": "8-10", "notes": "Keep core tight", "description": "Stand with feet shoulder-width, press barbell overhead"},
                {"name": "Incline Dumbbell Press", "sets": 3, "reps": "10-12", "notes": "30-45 degree angle", "description": "Press dumbbells on incline bench"},
                {"name": "Tricep Dips", "sets": 3, "reps": "12-15", "notes": "Use parallel bars or bench", "description": "Lower body by bending elbows, push back up"},
                {"name": "Lateral Raises", "sets": 3, "reps": "12-15", "notes": "Light weight, control the movement", "description": "Raise dumbbells to shoulder height laterally"}
            ]
        },
        {
            "dayTitle": "Day 2: Lower Body",
            "exercises": [
                {"name": "Barbell Squats", "sets": 4, "reps": "8-10", "notes": "Go parallel or below", "description": "Squat with barbell on upper back"},
                {"name": "Romanian Deadlift", "sets": 3, "reps": "10-12", "notes": "Keep slight bend in knees", "description": "Hinge at hips with barbell"},
                {"name": "Leg Press", "sets": 3, "reps": "12-15", "notes": "Full range of motion", "description": "Push weight on leg press machine"},
                {"name": "Walking Lunges", "sets": 3, "reps": "10 each leg", "notes": "Keep torso upright", "description": "Step forward into lunge, alternate legs"},
                {"name": "Calf Raises", "sets": 4, "reps": "15-20", "notes": "Pause at top", "description": "Rise onto toes, lower with control"}
            ]
        },
        {
            "dayTitle": "Day 3: Upper Body Pull",
            "exercises": [
                {"name": "Pull-ups", "sets": 4, "reps": "6-10", "notes": "Use assistance if needed", "description": "Hang from bar, pull chin above bar"},
                {"name": "Barbell Rows", "sets": 4, "reps": "8-10", "notes": "Keep back straight", "description": "Bend over, row barbell to lower chest"},
                {"name": "Face Pulls", "sets": 3, "reps": "12-15", "notes": "Great for rear delts", "description": "Pull rope to face on cable machine"},
                {"name": "Bicep Curls", "sets": 3, "reps": "10-12", "notes": "No swinging", "description": "Curl dumbbells with controlled motion"},
                {"name": "Hammer Curls", "sets": 3, "reps": "10-12", "notes": "Neutral grip", "description": "Curl with palms facing each other"}
            ]
        }
    ]
}

MOCK_DIET_PLAN = {
    "dailyCalories": 2200,
    "macros": {
        "protein": 165,
        "carbs": 220,
        "fats": 73
    },
    "meals": {
        "breakfast": {
            "name": "Protein Oatmeal Bowl",
            "calories": 550,
            "protein": 35,
            "carbs": 60,
            "fats": 18,
            "description": "1 cup oats with 1 scoop protein powder, 1 banana, 2 tbsp almond butter, and a handful of berries"
        },
        "lunch": {
            "name": "Grilled Chicken Quinoa Bowl",
            "calories": 650,
            "protein": 50,
            "carbs": 55,
            "fats": 22,
            "description": "200g grilled chicken breast, 1 cup quinoa, mixed greens, cherry tomatoes, cucumber, olive oil dressing"
        },
        "dinner": {
            "name": "Salmon with Sweet Potato",
            "calories": 700,
            "protein": 55,
            "carbs": 50,
            "fats": 28,
            "description": "200g baked salmon fillet, 1 large sweet potato, steamed broccoli and asparagus"
        },
        "snack": {
            "name": "Greek Yogurt Parfait",
            "calories": 300,
            "protein": 25,
            "carbs": 30,
            "fats": 8,
            "description": "1 cup Greek yogurt, honey, mixed nuts, and granola"
        }
    }
}


class AIService:
    """Service for AI-powered plan generation and chat"""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.provider = settings.ai_provider
        self.client = None
        self.model = None
        
        # Configure client based on provider
        if self.provider == "mock":
            # Mock mode - no API calls
            pass
        elif self.provider == "openai":
            from openai import AsyncOpenAI
            self.client = AsyncOpenAI(api_key=settings.openai_api_key)
            self.model = settings.openai_model
        else:  # deepseek
            from openai import AsyncOpenAI
            self.client = AsyncOpenAI(
                api_key=settings.deepseek_api_key,
                base_url=settings.deepseek_base_url
            )
            self.model = settings.deepseek_model
    
    def is_ready(self) -> bool:
        """Check if the AI service is properly configured"""
        if self.provider == "mock":
            return True
        if self.provider == "openai":
            return bool(self.settings.openai_api_key)
        return bool(self.settings.deepseek_api_key)
    
    async def generate_workout_plan(
        self,
        user_description: str,
        user_profile: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Generate a personalized workout plan
        """
        # Mock mode
        print(f"DEBUG: Generating plan with provider: {self.provider}")
        if self.provider == "mock":
            return MOCK_WORKOUT_PLAN
        
        profile_context = ""
        if user_profile:
            profile_context = f"""
User Profile:
- Weight: {user_profile.get('weight', 'Not specified')} kg
- Height: {user_profile.get('height', 'Not specified')} cm
- Goal: {user_profile.get('goal', 'General fitness')}
- Fitness Level: {user_profile.get('fitness_level', 'Beginner')}
"""
        
        system_prompt = """You are an elite fitness coach. Create serious, effective, and practical workout plans.
Your output MUST be valid JSON matching this exact structure:
{
    "title": "Plan name",
    "duration": "e.g., 4 weeks",
    "difficulty": "Beginner/Intermediate/Advanced",
    "schedule": [
        {
            "dayTitle": "Day 1: Chest & Triceps",
            "exercises": [
                {
                    "name": "Exercise name",
                    "sets": 3,
                    "reps": "8-12",
                    "notes": "Form tips or variations",
                    "description": "Brief description of the exercise"
                }
            ]
        }
    ]
}"""
        
        user_prompt = f"""{profile_context}
Create a detailed workout plan based on these requirements: {user_description}

Structure the plan into days if appropriate for the goal/duration.
The plan MUST contain real, executable physical exercises.
Return ONLY valid JSON, no additional text."""
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=2000
        )
        
        content = response.choices[0].message.content
        print(f"DEBUG: Raw AI response: {content[:200]}...")
        
        try:
            # Handle potential thinking tags or markdown code blocks
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
                
            plan = json.loads(content)
        except Exception as e:
            print(f"ERROR: Failed to parse JSON: {e}")
            raise ValueError(f"AI returned invalid JSON: {content[:100]}")
            
        # Handle case where AI returns a list instead of an object
        if isinstance(plan, list):
            # Wrap list in a schedule object
            plan = {"title": "AI Generated Plan", "schedule": plan}
            
        # Ensure schedule array exists
        if not isinstance(plan.get('schedule'), list):
            if isinstance(plan.get('exercises'), list):
                plan['schedule'] = [{'dayTitle': 'Day 1', 'exercises': plan['exercises']}]
            else:
                plan['schedule'] = []
        
        return plan
    
    async def generate_diet_plan(
        self,
        user_description: str,
        user_profile: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Generate a personalized diet plan
        """
        # Mock mode
        if self.provider == "mock":
            return MOCK_DIET_PLAN
        
        profile_context = ""
        if user_profile:
            profile_context = f"""
User Profile:
- Weight: {user_profile.get('weight', 'Not specified')} kg
- Height: {user_profile.get('height', 'Not specified')} cm
- Goal: {user_profile.get('goal', 'General health')}
"""
        
        system_prompt = """You are a professional nutritionist. Create balanced, healthy meal plans with accurate macro calculations.
Your output MUST be valid JSON matching this exact structure:
{
    "dailyCalories": 2000,
    "macros": {
        "protein": 150,
        "carbs": 200,
        "fats": 65
    },
    "meals": {
        "breakfast": {
            "name": "Meal name",
            "calories": 500,
            "protein": 30,
            "carbs": 50,
            "fats": 15,
            "description": "Detailed description with portions"
        },
        "lunch": { ... },
        "dinner": { ... },
        "snack": { ... }
    }
}"""
        
        user_prompt = f"""{profile_context}
Generate a daily diet plan for: {user_description}

Ensure all meals are practical and include accurate nutritional information.
Return ONLY valid JSON, no additional text."""
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=1500
        )
        
        content = response.choices[0].message.content
        return json.loads(content)
    
    async def chat(
        self,
        message: str,
        history: Optional[List[Dict]] = None,
        user_context: Optional[Dict] = None
    ) -> str:
        """
        Chat with the AI fitness coach
        """
        # Mock mode
        if self.provider == "mock":
            return f"""Great question! As your AI fitness coach, here are my thoughts:

Based on your question about "{message[:50]}...", I'd recommend focusing on:

1. **Consistency** - The most important factor in any fitness journey
2. **Progressive Overload** - Gradually increase intensity over time
3. **Recovery** - Don't underestimate the importance of rest days
4. **Nutrition** - Fuel your body properly for your goals

Would you like me to elaborate on any of these points? I'm here to help with workout plans, diet advice, or any fitness-related questions!"""
        
        system_prompt = """You are an expert AI fitness coach. You provide helpful, accurate, and personalized advice on:
- Workout routines and exercise techniques
- Nutrition and diet planning
- Recovery and injury prevention
- Motivation and goal setting

Be conversational, supportive, and informative. Keep responses concise but thorough.
If you don't know something, admit it rather than making up information."""
        
        if user_context:
            system_prompt += f"""

User Context:
- Name: {user_context.get('name', 'User')}
- Goal: {user_context.get('goal', 'General fitness')}
- Fitness Level: {user_context.get('fitness_level', 'Beginner')}
"""
        
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add history
        if history:
            for msg in history:
                role = "assistant" if msg.get('role') == 'assistant' else "user"
                messages.append({"role": role, "content": msg.get('content', '')})
        
        # Add current message
        messages.append({"role": "user", "content": message})
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.8,
            max_tokens=1000
        )
        
        return response.choices[0].message.content
    
    async def chat_stream(
        self,
        message: str,
        history: Optional[List[Dict]] = None,
        user_context: Optional[Dict] = None
    ) -> AsyncGenerator[str, None]:
        """
        Stream chat response from the AI fitness coach
        """
        # Mock mode - yield chunks to simulate streaming
        if self.provider == "mock":
            mock_response = f"""Great question about "{message[:30]}..."! 

Here's what I recommend:

1. **Start with proper form** - Quality over quantity
2. **Progressive overload** - Gradually increase difficulty
3. **Rest and recovery** - Muscles grow during rest
4. **Stay consistent** - Results come with time

Let me know if you need more specific advice!"""
            
            for chunk in mock_response.split(" "):
                yield chunk + " "
            return
        
        system_prompt = """You are an expert AI fitness coach. Be helpful, accurate, and supportive.
Provide advice on workouts, nutrition, recovery, and motivation. Keep responses conversational."""
        
        messages = [{"role": "system", "content": system_prompt}]
        
        if history:
            for msg in history:
                role = "assistant" if msg.get('role') == 'assistant' else "user"
                messages.append({"role": role, "content": msg.get('content', '')})
        
        messages.append({"role": "user", "content": message})
        
        stream = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.8,
            max_tokens=1000,
            stream=True
        )
        
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    
    async def analyze_progress(
        self,
        user_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze user progress and provide insights
        """
        # Mock mode
        if self.provider == "mock":
            return {
                "summary": "You're making great progress! Keep up the consistency.",
                "achievements": [
                    "Completed 5 workouts this week",
                    "Met your protein goals 4 out of 7 days",
                    "Increased squat weight by 5kg"
                ],
                "recommendations": [
                    "Consider adding an extra rest day for recovery",
                    "Try to drink more water throughout the day",
                    "Focus on compound movements for efficiency"
                ],
                "score": 78
            }
        
        system_prompt = """You are a fitness analyst. Analyze user progress data and provide insights.
Return JSON with: summary (string), achievements (array), recommendations (array), and score (0-100)."""
        
        user_prompt = f"""Analyze this fitness progress data and provide insights:
{json.dumps(user_data, indent=2)}

Return insights in JSON format."""
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=800
        )
        
        return json.loads(response.choices[0].message.content)
