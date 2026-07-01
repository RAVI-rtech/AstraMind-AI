---
name: Asterix AI dual-backend architecture
description: The project has two independent backends — FastAPI (Python) in backend/ and Express (Node.js) in artifacts/api-server/. They don't share code or config.
---

## Rule
The FastAPI Python backend (`backend/`) and the Node.js Express API (`artifacts/api-server/`) are completely independent. Do NOT wire them together or assume shared config.

**Why:** User requested Python FastAPI explicitly, but the workspace scaffold provides a Node.js Express server. Both coexist without conflict because they serve different paths and are started independently.

**How to apply:**
- FastAPI: `cd backend && python main.py` (port from $PORT or 8000). SQLite DB auto-created.
- Node.js: `pnpm --filter @workspace/api-server run dev`. PostgreSQL required.
- To wire the Expo app to FastAPI, add `/api/*` routes to the FastAPI server and update `artifacts/mobile/contexts/` service calls.
- FastAPI returns stub responses when API keys are absent — safe to run without .env.
