# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Stack

Everything runs through Docker Compose. The host ports differ from the internal ports to avoid conflicts:

| Service    | Host Port | Internal Port |
|------------|-----------|---------------|
| Frontend   | 3010      | 3000          |
| Backend    | 8010      | 8000          |
| PostgreSQL | 5440      | 5432          |

```bash
cp .env.example .env   # add ANTHROPIC_API_KEY
docker compose up --build
```

`NEXT_PUBLIC_API_URL` is a Next.js build argument — it must be set at image build time (it's baked into the static bundle), not just at runtime. The `docker-compose.yml` passes it as a `build.args` value.

For local frontend development without Docker:
```bash
cd frontend && npm install && npm run dev   # runs on :3000
```

For local backend development without Docker (requires a running Postgres):
```bash
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Architecture

```
Next.js 14 (frontend)  →  FastAPI (backend)  →  PostgreSQL 16
                                  ↓
                          Anthropic Claude API
```

**Frontend** (`frontend/src/app/`): Three pages only — `/` (landing), `/chat` (senior UI), `/dashboard` (caregiver UI). No component library; everything is inline Tailwind + CSS variables from `globals.css`. The `NEXT_PUBLIC_API_URL` env var (defaulting to `http://localhost:8000`) controls which backend the frontend calls.

**Backend** (`backend/app/`):
- `core/config.py` — Pydantic Settings; reads from `.env` file
- `core/database.py` — async SQLAlchemy engine; auto-converts `postgresql://` to `postgresql+asyncpg://`
- `models/models.py` — all ORM models in one file: `User`, `Conversation`, `Message`, `Observation`, `Summary`, `Escalation`
- `api/conversations.py` — conversation lifecycle: `POST /start`, `POST /message`, `POST /end`, `GET /{id}/messages`
- `api/dashboard.py` — caregiver read endpoints and escalation acknowledgement
- `api/users.py` — user CRUD
- `services/ai_service.py` — all Anthropic calls: `get_ai_response()` (conversational) and `analyze_conversation()` (signal extraction)

**Database schema** is managed entirely through `backend/init.sql` (no Alembic migrations in use). The schema is applied once on first container start.

## Language

The app is German-first. Clara responds exclusively in German (`ANTWORTE IMMER AUF DEUTSCH` is in the system prompt). The chat UI labels and fallback messages are also in German. The caregiver dashboard remains in English but signal summaries and escalation reasons are generated in German by the AI.

The STT input uses `lang: de-DE` (browser Web Speech API — Chrome/Edge only). The TTS output uses `lang: de-DE` with `speechSynthesis` at 0.85× rate for elderly clarity. Both use browser-native APIs with no extra API key. STT is detected at runtime via `window.SpeechRecognition` / `window.webkitSpeechRecognition`; the microphone button is only rendered when it's available.

`ttsEnabledRef` (a `useRef`) mirrors the `ttsEnabled` state so the `speak()` function always reads the current value inside async callbacks without stale-closure issues.

## Conversation Flow

The lifecycle is intentionally three-step:
1. `POST /api/conversations/start` — creates a `Conversation` row, saves the greeting as an `assistant` `Message`, returns `conversation_id`
2. `POST /api/conversations/message` — saves user message, fetches full history, calls Claude for response, saves `assistant` reply
3. `POST /api/conversations/end` — builds conversation transcript, calls `analyze_conversation()` which asks Claude for structured JSON, then persists `Observation`, `Summary`, and optionally `Escalation` rows

The wellbeing analysis (signal extraction, risk level, escalation decision) happens only at conversation end, not in real time.

## Demo Data

Two seniors are seeded with fixed UUIDs:
- Margaret Wilson: `11111111-1111-1111-1111-111111111111`
- Robert Thompson: `22222222-2222-2222-2222-222222222222`

These UUIDs are also hardcoded in `frontend/src/app/chat/page.tsx` (`DEMO_SENIORS`). If you add real user management, both places need updating.

## AI Service

`services/ai_service.py` uses the Anthropic SDK synchronously (not async), even though the FastAPI routes are async. `analyze_conversation()` returns a structured dict by prompting Claude to output JSON; it strips markdown fences if present and falls back to safe defaults on parse failure.

The model is currently `claude-sonnet-4-20250514`. Check the Anthropic SDK version in `requirements.txt` before upgrading the model string.

## Styling Conventions

Design tokens are CSS variables in `globals.css` (`--sage-green`, `--warm-terra`, `--bg-main`, etc.). Inline `style` props referencing these vars are used alongside Tailwind utility classes. The display font is Cormorant Garamond (serif); body font is Lato.
