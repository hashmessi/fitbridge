"""
FitBridge FastAPI Main Application
Entry point for the AI backend server
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.config import get_settings
from app.routers import health, ai, workout, diet, chat


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler - startup and shutdown"""
    # Startup
    settings = get_settings()
    yield
    # Shutdown


# Create FastAPI application
app = FastAPI(
    title="FitBridge AI Backend",
    description="AI-powered workout and diet plan generation for FitBridge",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS - restricted to safe origins from settings
_settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings.cors_origins_list,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Standardized error response format"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.detail}
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
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
