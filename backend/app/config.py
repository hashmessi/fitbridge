"""
FitBridge Backend Configuration
Loads environment variables and provides app settings
"""

from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    
    # AI Provider
    ai_provider: str = "openai"  # 'openai' or 'deepseek'
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com/v1"
    deepseek_model: str = "deepseek/deepseek-r1-distill-llama-70b"
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    
    # Security
    jwt_secret: str = "change-this-in-production"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
