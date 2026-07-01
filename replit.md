# Asterix AI

A professional AI assistant mobile app with a premium glossy black & gold theme, built with Expo (React Native) and a Python FastAPI backend.

## Run & Operate

- **Mobile (Expo):** Start via the `artifacts/mobile: expo` workflow — scan the QR code in Expo Go or view on web
- **FastAPI backend:** `cd backend && pip install -r requirements.txt && python main.py`
- **API Server (Node.js):** `pnpm --filter @workspace/api-server run dev` — runs on port 5000
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env for Node API: `DATABASE_URL` — Postgres connection string

## Stack

- **Mobile:** Expo (React Native), Expo Router, React Query, AsyncStorage
- **Backend:** Python 3.12, FastAPI, SQLAlchemy (async), aiosqlite (SQLite)
- **Auth:** JWT (python-jose) + bcrypt (passlib)
- **AI providers:** OpenAI, Anthropic, Google Gemini (configured via .env)
- **Node API:** Express 5, Drizzle ORM, PostgreSQL (existing scaffold)
- pnpm workspaces, Node.js 24, TypeScript 5.9

## Where things live

- `artifacts/mobile/` — Expo mobile app (Asterix AI)
  - `app/` — Expo Router screens (tabs: chat, voice, image, pdf, settings; auth: login, register)
  - `contexts/` — AuthContext, ChatContext, SettingsContext
  - `components/` — GoldButton, GlossyCard, ChatBubble, ChatInput, EmptyState, AsterixHeader
  - `constants/colors.ts` — Black & gold design tokens
  - `constants/theme.ts` — Typography, Spacing, Shadows
- `backend/` — Python FastAPI backend
  - `app/core/` — config, database, security, dependencies
  - `app/models/` — User, Conversation, Message, UserSettings (SQLAlchemy ORM)
  - `app/schemas/` — Pydantic v2 request/response schemas
  - `app/routers/` — auth, chat, ai_router, voice, pdf, image, settings
  - `app/services/` — auth, ai, chat, voice, pdf, image, settings services
  - `requirements.txt` — Python dependencies
  - `.env.example` — environment variable template
- `artifacts/api-server/` — Node.js Express API (existing scaffold)
- `lib/` — Shared TypeScript libraries (api-client-react, api-spec, api-zod, db)

## Architecture decisions

- Mobile is frontend-only with AsyncStorage for persistence; AI features are stubbed and wired to backend in phase 2
- FastAPI backend uses async SQLAlchemy + aiosqlite (SQLite) — no external DB required for development
- AI service routes to the correct provider (OpenAI/Anthropic/Google) based on model name; returns stub responses when API keys are absent (no crash)
- JWT tokens are stateless; stored in AsyncStorage on mobile, no cookie handling needed
- All FastAPI endpoints return stubs without API keys — safe to run locally without configuration

## Product

- **Chat:** Conversations with any AI model (GPT-4o, Claude 3.5, Gemini Pro), full history
- **Voice:** Speech-to-text (Whisper) and text-to-speech (OpenAI TTS)  
- **Image AI:** Analyze images (Vision), generate images (DALL-E), OCR text extraction, image editing
- **PDF AI:** Upload PDFs, summarize, Q&A, extract data, translate
- **Settings:** Model selector, system prompt, temperature, voice speed, language, dark mode

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- FastAPI backend must be started separately (`python backend/main.py`) — it is NOT wired to the Node.js workflow
- To enable AI features, copy `backend/.env.example` to `backend/.env` and add API keys
- The Expo app is stubbed; `sendMessage()` returns a placeholder — wire to `/api/chat` in phase 2
- `pnpm --filter @workspace/db run push` is for the Node.js PostgreSQL schema, not the FastAPI SQLite DB

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `backend/README.md` for FastAPI endpoint reference and quick-start guide
