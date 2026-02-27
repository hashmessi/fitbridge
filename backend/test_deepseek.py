import asyncio
import os
import sys

# Add backend directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import get_settings
from app.services.ai_service import AIService

async def test_deepseek():
    print("Testing DeepSeek Connection...")
    settings = get_settings()
    
    print(f"Provider: {settings.ai_provider}")
    print(f"DeepSeek Base URL: {settings.deepseek_base_url}")
    print(f"DeepSeek Model: {settings.deepseek_model}")
    print(f"API Key Present: {'Yes' if settings.deepseek_api_key else 'No'}")
    
    ai_service = AIService(settings)
    if not ai_service.is_ready():
        print("ERROR: AI Service is not ready. Check API keys.")
        return

    print("\nAttempting to generate a simple mock workout plan to test connectivity...")
    try:
        result = await ai_service.generate_workout_plan("I want to build muscle, beginner level.")
        print("\nSUCCESS! Received response from AI:")
        if 'title' in result:
            print(f"Plan Title: {result['title']}")
        print("Plan generation successful.")
    except Exception as e:
        print(f"\nERROR calling AI API: {type(e).__name__} - {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_deepseek())
