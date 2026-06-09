from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.models.models import User

router = APIRouter(prefix="/api/users", tags=["users"])

class CreateUserRequest(BaseModel):
    name: str
    role: str = "senior"
    email: Optional[str] = None

@router.get("/seniors")
async def list_seniors(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.role == "senior"))
    seniors = result.scalars().all()
    return [{"id": str(s.id), "name": s.name, "email": s.email} for s in seniors]

@router.post("/")
async def create_user(req: CreateUserRequest, db: AsyncSession = Depends(get_db)):
    user = User(name=req.name, role=req.role, email=req.email)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {"id": str(user.id), "name": user.name, "role": user.role}
