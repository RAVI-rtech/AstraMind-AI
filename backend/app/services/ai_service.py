"""
AI Service — calls Google Gemini 2.5 Flash for all completions.

Stubbed until GEMINI_API_KEY is set in .env.
"""

from typing import Any

from app.core.config import settings

GEMINI_MODEL = "gemini-2.5-flash"


class AIService:
    async def complete(
        self,
        prompt: str,
        model: str,
        system_prompt: str,
        max_tokens: int,
        temperature: float,
    ) -> dict[str, Any]:
        """Generate a completion using Gemini 2.5 Flash."""
        return await self._gemini_complete(prompt, system_prompt, max_tokens, temperature)

    async def _gemini_complete(
        self,
        prompt: str,
        system_prompt: str,
        max_tokens: int,
        temperature: float,
    ) -> dict[str, Any]:
        if not settings.GEMINI_API_KEY:
            return self._stub_response()

        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = await client.aio.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                max_output_tokens=max_tokens,
                temperature=temperature,
            ),
        )
        return {
            "content": response.text or "",
            "model": GEMINI_MODEL,
            "tokens_used": (
                response.usage_metadata.total_token_count
                if response.usage_metadata
                else 0
            ),
        }

    @staticmethod
    def _stub_response() -> dict[str, Any]:
        return {
            "content": (
                "AI features are not yet configured. "
                "Add GEMINI_API_KEY to backend/.env to enable real responses."
            ),
            "model": GEMINI_MODEL,
            "tokens_used": 0,
        }
