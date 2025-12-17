"""
FitBridge FastAPI Main Application
Entry point for the AI backend server
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.routers import health, ai, workout, diet, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler - startup and shutdown"""
    # Startup
    settings = get_settings()
    print(f"🚀 FitBridge AI Backend starting...")
    print(f"📡 AI Provider: {settings.ai_provider}")
    print(f"🔗 Supabase URL: {settings.supabase_url[:30]}...")
    yield
    # Shutdown
    print("👋 FitBridge AI Backend shutting down...")


# Create FastAPI application
app = FastAPI(
    title="FitBridge AI Backend",
    description="AI-powered workout and diet plan generation for FitBridge",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(workout.router, prefix="/api/workout", tags=["Workout"])
app.include_router(diet.router, prefix="/api/diet", tags=["Diet"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])


@app.get("/")
async def root():
    """Root endpoint - API info"""
    return {
        "name": "FitBridge AI Backend",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
