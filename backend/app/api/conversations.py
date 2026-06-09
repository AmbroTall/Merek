from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime, date

from app.core.database import get_db
from app.models.models import User, Conversation, Message, Observation, Summary, Escalation
from app.services.ai_service import get_ai_response, analyze_conversation

router = APIRouter(prefix="/api", tags=["conversations"])

class SendMessageRequest(BaseModel):
    conversation_id: Optional[str] = None
    senior_id: str
    content: str

class StartConversationRequest(BaseModel):
    senior_id: str

class EndConversationRequest(BaseModel):
    conversation_id: str

@router.post("/conversations/start")
async def start_conversation(req: StartConversationRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == uuid.UUID(req.senior_id)))
    senior = result.scalar_one_or_none()
    if not senior:
        raise HTTPException(status_code=404, detail="Senior not found")
    
    conv = Conversation(senior_id=uuid.UUID(req.senior_id), status="active")
    db.add(conv)
    await db.commit()
    await db.refresh(conv)
    
    # Warm greeting
    greeting = f"Hello {senior.name}! It's so lovely to chat with you today. How are you feeling?"
    
    msg = Message(
        conversation_id=conv.id,
        role="assistant",
        content=greeting
    )
    db.add(msg)
    await db.commit()
    
    return {
        "conversation_id": str(conv.id),
        "greeting": greeting
    }

@router.post("/conversations/message")
async def send_message(req: SendMessageRequest, db: AsyncSession = Depends(get_db)):
    # Get or create conversation
    if req.conversation_id:
        result = await db.execute(
            select(Conversation).where(Conversation.id == uuid.UUID(req.conversation_id))
        )
        conv = result.scalar_one_or_none()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conv = Conversation(senior_id=uuid.UUID(req.senior_id), status="active")
        db.add(conv)
        await db.commit()
        await db.refresh(conv)
    
    # Get senior name
    result = await db.execute(select(User).where(User.id == uuid.UUID(req.senior_id)))
    senior = result.scalar_one_or_none()
    senior_name = senior.name if senior else "friend"
    
    # Save user message
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=req.content
    )
    db.add(user_msg)
    await db.commit()
    
    # Get full conversation history
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conv.id)
        .order_by(Message.created_at)
    )
    all_msgs = result.scalars().all()
    
    history = [{"role": m.role, "content": m.content} for m in all_msgs]
    
    # Get AI response
    ai_text = await get_ai_response(history, senior_name)
    
    # Save AI response
    ai_msg = Message(
        conversation_id=conv.id,
        role="assistant",
        content=ai_text
    )
    db.add(ai_msg)
    await db.commit()
    
    return {
        "conversation_id": str(conv.id),
        "response": ai_text
    }

@router.post("/conversations/end")
async def end_conversation(req: EndConversationRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Conversation).where(Conversation.id == uuid.UUID(req.conversation_id))
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Get all messages
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conv.id)
        .order_by(Message.created_at)
    )
    msgs = result.scalars().all()
    
    if len(msgs) < 2:
        conv.status = "completed"
        conv.ended_at = datetime.utcnow()
        await db.commit()
        return {"status": "completed", "summary": None}
    
    # Build conversation text for analysis
    conv_text = "\n".join([f"{m.role.upper()}: {m.content}" for m in msgs])
    
    # Analyze with AI
    analysis = await analyze_conversation(conv_text)
    
    # Save observations
    for obs in analysis.get("observations", []):
        observation = Observation(
            conversation_id=conv.id,
            senior_id=conv.senior_id,
            signal_type=obs.get("signal", "unknown"),
            severity=obs.get("severity", "low"),
            description=obs.get("description", "")
        )
        db.add(observation)
    
    # Save summary
    summary = Summary(
        conversation_id=conv.id,
        senior_id=conv.senior_id,
        conversation_date=date.today(),
        mood=analysis.get("mood", "neutral"),
        sleep_issue=analysis.get("sleep_issue", False),
        loneliness=analysis.get("loneliness", False),
        pain=analysis.get("pain", False),
        medication_issue=analysis.get("medication_issue", False),
        anxiety=analysis.get("anxiety", False),
        confusion=analysis.get("confusion", False),
        social_isolation=analysis.get("social_isolation", False),
        risk_level=analysis.get("risk_level", "low"),
        summary_text=analysis.get("summary_text", ""),
        raw_data=analysis
    )
    db.add(summary)
    
    # Save escalation if needed
    if analysis.get("escalation_needed"):
        priority = analysis.get("escalation_priority", "low")
        action_map = {
            "low": "Inform relative or caregiver at next check-in",
            "medium": "Caregiver review recommended within 24 hours",
            "high": "Immediate alert - contact caregiver now"
        }
        escalation = Escalation(
            conversation_id=conv.id,
            senior_id=conv.senior_id,
            priority=priority,
            reason=analysis.get("escalation_reason", ""),
            action_required=action_map.get(priority, "Review recommended")
        )
        db.add(escalation)
    
    # Mark conversation complete
    conv.status = "completed"
    conv.ended_at = datetime.utcnow()
    await db.commit()
    
    return {
        "status": "completed",
        "summary": analysis
    }

@router.get("/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == uuid.UUID(conversation_id))
        .order_by(Message.created_at)
    )
    msgs = result.scalars().all()
    return [{"role": m.role, "content": m.content, "created_at": m.created_at.isoformat()} for m in msgs]
