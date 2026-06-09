# ClaraCompanion – Healthcare AI Companion

A professional, production-grade AI companion for elderly care with a real-time caregiver dashboard.

---

## 🚀 Quick Start (Docker)

### 1. Clone & configure

```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 2. Launch

```bash
docker compose up --build
```

### 3. Open

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Landing page |
| http://localhost:3000/chat | Senior conversation interface |
| http://localhost:3000/dashboard | Caregiver dashboard |
| http://localhost:8000/docs | FastAPI Swagger docs |

---

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js 14    │───▶│   FastAPI       │───▶│  PostgreSQL 16  │
│   Frontend      │    │   Backend       │    │  Database       │
│   Port 3000     │    │   Port 8000     │    │  Port 5432      │
└─────────────────┘    └────────┬────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Anthropic API  │
                       │  Claude Sonnet  │
                       └─────────────────┘
```

## 📦 Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: FastAPI, SQLAlchemy (async), Pydantic
- **Database**: PostgreSQL 16
- **AI**: Anthropic Claude Sonnet
- **Infrastructure**: Docker Compose

## 🎯 Features

| Feature | Status |
|---------|--------|
| Natural Conversation (Clara AI) | ✅ |
| Session Memory & Context | ✅ |
| Wellbeing Signal Detection | ✅ |
| Structured Summary Generation | ✅ |
| Escalation Engine (Low/Medium/High) | ✅ |
| Caregiver Dashboard | ✅ |
| Risk Level Tracking | ✅ |
| Observation Feed | ✅ |

## 🌱 Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | **Required** – Your Anthropic API key |
| `POSTGRES_USER` | DB username (default: hc_user) |
| `POSTGRES_PASSWORD` | DB password (default: hc_password) |
| `POSTGRES_DB` | DB name (default: healthcare_companion) |
| `JWT_SECRET` | Secret for JWT tokens |

## 🔮 Future Extensions

- Long-term memory across sessions
- Voice input (Whisper / Deepgram)
- Text-to-speech (ElevenLabs)
- Multi-tenant SaaS
- GDPR consent management
- Telekom Public Cloud deployment
- European-hosted AI providers
