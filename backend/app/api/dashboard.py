from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_
import uuid
from datetime import datetime

from app.core.database import get_db
from app.models.models import User, Conversation, Message, Observation, Summary, Escalation

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/seniors")
async def get_seniors(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.role == "senior"))
    seniors = result.scalars().all()
    
    senior_data = []
    for s in seniors:
        # Get latest conversation
        conv_result = await db.execute(
            select(Conversation)
            .where(Conversation.senior_id == s.id)
            .order_by(desc(Conversation.started_at))
            .limit(1)
        )
        latest_conv = conv_result.scalar_one_or_none()
        
        # Get latest summary
        sum_result = await db.execute(
            select(Summary)
            .where(Summary.senior_id == s.id)
            .order_by(desc(Summary.created_at))
            .limit(1)
        )
        latest_summary = sum_result.scalar_one_or_none()
        
        # Get unacknowledged escalations
        esc_result = await db.execute(
            select(Escalation)
            .where(and_(Escalation.senior_id == s.id, Escalation.acknowledged == False))
            .order_by(desc(Escalation.created_at))
        )
        escalations = esc_result.scalars().all()
        
        senior_data.append({
            "id": str(s.id),
            "name": s.name,
            "email": s.email,
            "latest_interaction": latest_conv.started_at.isoformat() if latest_conv else None,
            "risk_level": latest_summary.risk_level if latest_summary else "unknown",
            "mood": latest_summary.mood if latest_summary else None,
            "pending_escalations": len(escalations),
            "escalations": [
                {
                    "id": str(e.id),
                    "priority": e.priority,
                    "reason": e.reason,
                    "action_required": e.action_required,
                    "created_at": e.created_at.isoformat()
                }
                for e in escalations
            ]
        })
    
    return senior_data

@router.get("/senior/{senior_id}")
async def get_senior_detail(senior_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == uuid.UUID(senior_id)))
    senior = result.scalar_one_or_none()
    if not senior:
        raise HTTPException(status_code=404, detail="Senior not found")
    
    # Recent summaries
    sum_result = await db.execute(
        select(Summary)
        .where(Summary.senior_id == uuid.UUID(senior_id))
        .order_by(desc(Summary.created_at))
        .limit(10)
    )
    summaries = sum_result.scalars().all()
    
    # Recent observations
    obs_result = await db.execute(
        select(Observation)
        .where(Observation.senior_id == uuid.UUID(senior_id))
        .order_by(desc(Observation.detected_at))
        .limit(20)
    )
    observations = obs_result.scalars().all()
    
    # All escalations
    esc_result = await db.execute(
        select(Escalation)
        .where(Escalation.senior_id == uuid.UUID(senior_id))
        .order_by(desc(Escalation.created_at))
    )
    escalations = esc_result.scalars().all()
    
    return {
        "senior": {
            "id": str(senior.id),
            "name": senior.name,
            "email": senior.email,
        },
        "summaries": [
            {
                "id": str(s.id),
                "date": s.conversation_date.isoformat(),
                "mood": s.mood,
                "sleep_issue": s.sleep_issue,
                "loneliness": s.loneliness,
                "pain": s.pain,
                "medication_issue": s.medication_issue,
                "anxiety": s.anxiety,
                "risk_level": s.risk_level,
                "summary_text": s.summary_text
            }
            for s in summaries
        ],
        "observations": [
            {
                "id": str(o.id),
                "signal_type": o.signal_type,
                "severity": o.severity,
                "description": o.description,
                "detected_at": o.detected_at.isoformat()
            }
            for o in observations
        ],
        "escalations": [
            {
                "id": str(e.id),
                "priority": e.priority,
                "reason": e.reason,
                "action_required": e.action_required,
                "acknowledged": e.acknowledged,
                "created_at": e.created_at.isoformat()
            }
            for e in escalations
        ]
    }

@router.post("/escalations/{escalation_id}/acknowledge")
async def acknowledge_escalation(escalation_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Escalation).where(Escalation.id == uuid.UUID(escalation_id))
    )
    esc = result.scalar_one_or_none()
    if not esc:
        raise HTTPException(status_code=404, detail="Escalation not found")
    
    esc.acknowledged = True
    esc.acknowledged_at = datetime.utcnow()
    await db.commit()
    return {"status": "acknowledged"}
