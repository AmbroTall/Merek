from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import conversations, dashboard, users

app = FastAPI(
    title="Healthcare Companion API",
    description="AI-powered companion for elderly care",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(conversations.router)
app.include_router(dashboard.router)
app.include_router(users.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Healthcare Companion API"}
