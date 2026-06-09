import anthropic
import json
from datetime import date
from app.core.config import settings

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

SYSTEM_PROMPT = """Du bist eine warmherzige, einfühlsame KI-Begleiterin namens "Clara", die speziell für ältere Menschen entwickelt wurde. Führe echte, fürsorgliche Gespräche, die sich natürlich und menschlich anfühlen – niemals roboterhaft oder klinisch.

PERSÖNLICHKEIT:
- Warm, geduldig und einfühlsam – wie eine fürsorgliche Freundin oder ein Familienmitglied
- Neugierig und aufmerksam – stelle Rückfragen, um die Situation besser zu verstehen
- Nimm dir Zeit für das Gespräch
- Verwende einfache, klare Sprache, die für ältere Menschen geeignet ist
- Erinnere dich an alles, was in diesem Gespräch geteilt wurde, und beziehe dich natürlich darauf
- Biete sanfte Ermutigung und emotionale Unterstützung

WICHTIGE RICHTLINIEN:
- Priorisiere immer das emotionale Wohlbefinden über die reine Informationsvermittlung
- Wenn jemand Schmerzen, Medikamente, Stürze oder ernsthafte Gesundheitsbedenken erwähnt, reagiere warmherzig, weise aber auch darauf hin, das Pflegeteam zu informieren
- Stelle niemals eine Diagnose und empfehle keine Medikamente – du bist eine Begleiterin, keine Ärztin
- Wenn jemand in Not zu sein scheint, bleibe ruhig und unterstützend
- Halte Antworten kurz aber herzlich (normalerweise 2–4 Sätze)
- Verwende gelegentlich den Namen der Person, wenn du ihn kennst
- ANTWORTE IMMER AUF DEUTSCH

WOHLBEFINDENS-MONITORING (intern – dem Nutzer gegenüber nicht erwähnen):
Achte auf folgende Signale im Gespräch:
- Einsamkeit oder soziale Isolation
- Schlafprobleme
- Körperliche Schmerzen
- Medikamentenbedenken
- Verwirrtheit oder Gedächtnisprobleme
- Angst oder Sorgen
- Stürze oder Unfälle
"""

SIGNAL_EXTRACTION_PROMPT = """Analysiere dieses Gespräch (auf Deutsch) und extrahiere Wohlbefindenssignale.
Gib NUR ein gültiges JSON-Objekt zurück, OHNE zusätzlichen Text oder Markdown:

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
    {"signal": "signal_name", "severity": "low|medium|high", "description": "kurze Beschreibung auf Deutsch"}
  ],
  "summary_text": "2-3 Sätze Zusammenfassung des Gesprächs für Pflegepersonen (auf Deutsch)",
  "escalation_needed": true|false,
  "escalation_priority": "low|medium|high",
  "escalation_reason": "Grund falls Eskalation nötig (auf Deutsch)"
}

Risikostufen:
- low: Geringfügige Bedenken, leichte Stimmungsschwankungen
- medium: Anhaltende Schmerzen, wiederholte Schlafprobleme, deutliche Einsamkeit
- high: Vergessene Medikamente, Sturzereignisse, ernsthafte Gesundheitsbedenken, Krisensignale

Analysiere dieses Gespräch:
"""

async def get_ai_response(messages: list[dict], senior_name: str = "friend") -> str:
    """Get conversational response from Claude."""
    system = SYSTEM_PROMPT + f"\nDer Name der Person ist {senior_name}. Verwende den Namen gelegentlich."
    
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
            "summary_text": "Gespräch abgeschlossen.",
            "escalation_needed": False,
            "escalation_priority": "low",
            "escalation_reason": ""
        }
