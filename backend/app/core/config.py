from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://hc_user:hc_password@localhost:5432/healthcare_companion"
    ANTHROPIC_API_KEY: str = ""
    JWT_SECRET: str = "supersecretjwtkey123"
    CORS_ORIGINS: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"

settings = Settings()
