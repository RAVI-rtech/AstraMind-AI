# Asterix AI — FastAPI Backend

## Project Structure

```
backend/
├── main.py                   # FastAPI app entry point
├── requirements.txt          # Python dependencies
├── .env.example              # Environment variable template
└── app/
    ├── core/
    │   ├── config.py         # Pydantic settings (loads .env)
    │   ├── database.py       # Async SQLite engine + session
    │   ├── security.py       # JWT + bcrypt utilities
    │   └── dependencies.py   # FastAPI DI (get_current_user)
    ├── models/
    │   ├── user.py           # User ORM model
    │   ├── chat.py           # Conversation + Message ORM models
    │   └── settings.py       # UserSettings ORM model
    ├── schemas/
    │   ├── user.py           # User request/response schemas
    │   ├── chat.py           # Chat request/response schemas
    │   └── settings.py       # Settings request/response schemas
    ├── routers/
    │   ├── auth.py           # POST /api/auth/register|login, GET /api/auth/me
    │   ├── chat.py           # CRUD /api/chat/conversations
    │   ├── ai_router.py      # POST /api/ai/complete
    │   ├── voice.py          # POST /api/voice/transcribe|synthesize
    │   ├── pdf.py            # POST /api/pdf/upload|query|translate
    │   ├── image.py          # POST /api/image/analyze|generate|ocr|edit
    │   └── settings.py       # GET|PATCH|DELETE /api/settings
    └── services/
        ├── auth_service.py   # Registration, login, profile
        ├── ai_service.py     # OpenAI / Anthropic / Google router
        ├── chat_service.py   # Conversation persistence + AI calls
        ├── voice_service.py  # Whisper STT + OpenAI TTS
        ├── pdf_service.py    # PyMuPDF parsing + AI analysis
        ├── image_service.py  # Vision AI + DALL-E + OCR
        └── settings_service.py # User preferences CRUD
```

## Quick Start

```bash
cd backend
cp .env.example .env
# Edit .env and add your API keys
pip install -r requirements.txt
python main.py
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

## Modules

| Module | Endpoints | Description |
|--------|-----------|-------------|
| Auth | `/api/auth/*` | Register, login, JWT, profile |
| Chat | `/api/chat/*` | Conversations, messages, history |
| AI Router | `/api/ai/*` | Multi-provider AI completions |
| Voice | `/api/voice/*` | Whisper STT + OpenAI TTS |
| PDF | `/api/pdf/*` | Parse, summarize, Q&A, translate |
| Image | `/api/image/*` | Vision AI, DALL-E, OCR |
| Settings | `/api/settings/*` | User preferences |

## AI Providers

Set the appropriate key in `.env`:
- **OpenAI** → `OPENAI_API_KEY` (GPT-4o, DALL-E, Whisper, TTS)
- **Anthropic** → `ANTHROPIC_API_KEY` (Claude 3.5 Sonnet)
- **Google** → `GOOGLE_API_KEY` (Gemini Pro)

Without API keys, all endpoints return stub responses (no crash).
