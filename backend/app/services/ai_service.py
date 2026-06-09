import anthropic
import json
from datetime import date
from app.core.config import settings

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

SYSTEM_PROMPT = """You are a warm, compassionate healthcare companion AI named "Clara" designed specifically for elderly users. Your role is to have genuine, caring conversations that feel natural and human - never robotic or clinical.

PERSONALITY:
- Warm, patient, and empathetic - like a caring friend or family member
- Curious and engaged - ask follow-up questions to understand better
- Never rush the conversation
- Use simple, clear language appropriate for seniors
- Remember everything shared in this conversation and reference it naturally
- Offer gentle encouragement and emotional support

IMPORTANT GUIDELINES:
- Always prioritize emotional wellbeing over information delivery
- If someone mentions pain, medication, falls, or serious health concerns, acknowledge them warmly but also note the importance of speaking with their care team
- Never diagnose or prescribe - you're a companion, not a doctor
- If someone seems distressed, stay calm and supportive
- Keep responses concise but warm (2-4 sentences usually)
- Occasionally use the senior's name if you know it

WELLBEING MONITORING (internal, don't mention to user):
Pay attention to these signals in the conversation:
- Loneliness or social isolation
- Sleep problems
- Physical pain
- Medication concerns
- Confusion or memory issues
- Anxiety or worry
- Mentions of falls or accidents
"""

SIGNAL_EXTRACTION_PROMPT = """Analyze this conversation and extract wellbeing signals. 
Return ONLY a valid JSON object with NO additional text or markdown:

{
  "mood": "positive|slightly_positive|neutral|slightly_negative|negative",
  "sleep_issue": true|false,
  "loneliness": true|false,
  "pain": true|false,
  "medication_issue": true|false,
  "anxiety": true|false,
  "confusion": true|false,
  "social_isolation": true|false,
  "risk_level": "low|medium|high",
  "observations": [
    {"signal": "signal_name", "severity": "low|medium|high", "description": "brief description"}
  ],
  "summary_text": "2-3 sentence summary of the conversation for caregivers",
  "escalation_needed": true|false,
  "escalation_priority": "low|medium|high",
  "escalation_reason": "reason if escalation needed"
}

Risk levels:
- low: Minor concerns, mild mood dips
- medium: Persistent pain, repeated sleep issues, notable loneliness
- high: Missed medication, fall incidents, serious health concerns, crisis signals

Analyze this conversation:
"""

async def get_ai_response(messages: list[dict], senior_name: str = "friend") -> str:
    """Get conversational response from Claude."""
    system = SYSTEM_PROMPT + f"\nThe senior's name is {senior_name}. Use their name occasionally."
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        system=system,
        messages=messages
    )
    return response.content[0].text

async def analyze_conversation(conversation_text: str) -> dict:
    """Extract wellbeing signals from conversation."""
    prompt = SIGNAL_EXTRACTION_PROMPT + conversation_text
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    raw = response.content[0].text.strip()
    # Strip markdown if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()
    
    try:
        return json.loads(raw)
    except Exception:
        return {
            "mood": "neutral",
            "sleep_issue": False,
            "loneliness": False,
            "pain": False,
            "medication_issue": False,
            "anxiety": False,
            "confusion": False,
            "social_isolation": False,
            "risk_level": "low",
            "observations": [],
            "summary_text": "Conversation completed.",
            "escalation_needed": False,
            "escalation_priority": "low",
            "escalation_reason": ""
        }
