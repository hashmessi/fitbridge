"""
Chat Router
AI-powered fitness coach chat endpoint
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import json

from app.services.ai_service import AIService
from app.config import get_settings

router = APIRouter()


class ChatMessage(BaseModel):
    """Chat message model"""
    role: str  # 'user' or 'assistant'
    content: str


class ChatRequest(BaseModel):
    """Chat request with history"""
    message: str
    history: Optional[List[ChatMessage]] = []
    user_context: Optional[dict] = None  # User profile for personalization


def get_ai_service() -> AIService:
    """Dependency to get AI service instance"""
    settings = get_settings()
    return AIService(settings)


async def get_user_id(authorization: str = Header(default="")) -> Optional[str]:
    """Extract user ID from authorization header (optional for chat)"""
    if authorization.startswith("Bearer "):
        return authorization[7:]
    return authorization if authorization else None


@router.post("/send")
async def send_message(
    request: ChatRequest,
    ai_service: AIService = Depends(get_ai_service),
    user_id: Optional[str] = Depends(get_user_id)
):
    """
    Send a message to the AI fitness coach and get a response
    """
    try:
        response = await ai_service.chat(
            message=request.message,
            history=request.history,
            user_context=request.user_context
        )
        
        return {
            "success": True,
            "response": response
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stream")
async def stream_message(
    request: ChatRequest,
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Stream a response from the AI fitness coach
    Returns Server-Sent Events (SSE)
    """
    async def generate():
        try:
            async for chunk in ai_service.chat_stream(
                message=request.message,
                history=request.history,
                user_context=request.user_context
            ):
                yield f"data: {json.dumps({'content': chunk})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.get("/suggestions")
async def get_suggestions():
    """Get suggested questions for the chat"""
    return {
        "success": True,
        "suggestions": [
            "What's the best workout routine for building muscle?",
            "How many calories should I eat to lose weight?",
            "Can you explain proper squat form?",
            "What should I eat before a workout?",
            "How can I improve my sleep for better recovery?",
            "What are the benefits of HIIT training?",
            "How do I track my macros effectively?",
            "What's a good stretching routine?"
        ]
    }
