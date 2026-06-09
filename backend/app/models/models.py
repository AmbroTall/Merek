from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, date
import uuid
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    role = Column(String(50), default="senior")
    email = Column(String(255), unique=True)
    linked_senior_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    senior_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    started_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), default="active")
    messages = relationship("Message", back_populates="conversation")
    observations = relationship("Observation", back_populates="conversation")

class Message(Base):
    __tablename__ = "messages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    conversation = relationship("Conversation", back_populates="messages")

class Observation(Base):
    __tablename__ = "observations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    senior_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    signal_type = Column(String(100), nullable=False)
    severity = Column(String(20), default="low")
    description = Column(Text)
    detected_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    conversation = relationship("Conversation", back_populates="observations")

class Summary(Base):
    __tablename__ = "summaries"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=True)
    senior_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    conversation_date = Column(Date, default=date.today)
    mood = Column(String(50))
    sleep_issue = Column(Boolean, default=False)
    loneliness = Column(Boolean, default=False)
    pain = Column(Boolean, default=False)
    medication_issue = Column(Boolean, default=False)
    anxiety = Column(Boolean, default=False)
    confusion = Column(Boolean, default=False)
    social_isolation = Column(Boolean, default=False)
    risk_level = Column(String(20), default="low")
    summary_text = Column(Text)
    raw_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class Escalation(Base):
    __tablename__ = "escalations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=True)
    senior_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    priority = Column(String(20), nullable=False)
    reason = Column(Text, nullable=False)
    action_required = Column(Text, nullable=False)
    acknowledged = Column(Boolean, default=False)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
