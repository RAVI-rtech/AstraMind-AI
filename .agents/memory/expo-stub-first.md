---
name: Expo stub-first pattern for Asterix AI
description: Mobile contexts use AsyncStorage + stub AI responses on first build; wiring to FastAPI backend deferred to phase 2.
---

## Rule
In the first build, Expo mobile app contexts (AuthContext, ChatContext) use local AsyncStorage and stub responses instead of real API calls. This is intentional — phase 2 wires them to the FastAPI backend.

**Why:** The first build rule says "no backend dependencies in first Expo build." The FastAPI backend exists but isn't wired yet.

**How to apply:**
- `ChatContext.sendMessage()` → stub response; wire to `POST /api/chat/conversations/{id}/messages`
- `AuthContext.login/register()` → stub token; wire to `POST /api/auth/login` and `POST /api/auth/register`
- When wiring, use `setBaseUrl` from `@workspace/api-client-react` and `setAuthTokenGetter` for bearer token injection
