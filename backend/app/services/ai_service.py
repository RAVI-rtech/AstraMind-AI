"""
AI Service — routes completions to OpenAI, Anthropic, or Google AI.

AI provider calls are stubbed until API keys are configured in .env.
"""

from typing import Any, Literal

from app.core.config import settings


class AIService:
    async def complete(
        self,
        prompt: str,
        model: Literal["gpt-4o", "gpt-4o-mini", "claude-3-5-sonnet", "gemini-pro"],
        system_prompt: str,
        max_tokens: int,
        temperature: float,
    ) -> dict[str, Any]:
        """Route to the correct AI provider based on the model name."""
        if model.startswith("gpt"):
            return await self._openai_complete(prompt, model, system_prompt, max_tokens, temperature)
        elif model.startswith("claude"):
            return await self._anthropic_complete(prompt, model, system_prompt, max_tokens, temperature)
        elif model.startswith("gemini"):
            return await self._google_complete(prompt, model, system_prompt, max_tokens, temperature)
        else:
            raise ValueError(f"Unknown model: {model}")

    async def _openai_complete(
        self, prompt: str, model: str, system_prompt: str, max_tokens: int, temperature: float
    ) -> dict[str, Any]:
        if not settings.OPENAI_API_KEY:
            return self._stub_response(model)

        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            max_tokens=max_tokens,
            temperature=temperature,
        )
        return {
            "content": response.choices[0].message.content or "",
            "model": model,
            "tokens_used": response.usage.total_tokens if response.usage else 0,
        }

    async def _anthropic_complete(
        self, prompt: str, model: str, system_prompt: str, max_tokens: int, temperature: float
    ) -> dict[str, Any]:
        if not settings.ANTHROPIC_API_KEY:
            return self._stub_response(model)

        import anthropic
        client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        response = await client.messages.create(
            model="claude-3-5-sonnet-20241022",
            system=system_prompt,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
        )
        return {
            "content": response.content[0].text if response.content else "",
            "model": model,
            "tokens_used": response.usage.input_tokens + response.usage.output_tokens,
        }

    async def _google_complete(
        self, prompt: str, model: str, system_prompt: str, max_tokens: int, temperature: float
    ) -> dict[str, Any]:
        if not settings.GOOGLE_API_KEY:
            return self._stub_response(model)

        import google.generativeai as genai
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        gemini = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            system_instruction=system_prompt,
        )
        response = await gemini.generate_content_async(prompt)
        return {
            "content": response.text,
            "model": model,
            "tokens_used": 0,
        }

    @staticmethod
    def _stub_response(model: str) -> dict[str, Any]:
        return {
            "content": (
                f"[{model}] AI features are not yet configured. "
                "Add your API keys to the backend .env file to enable them."
            ),
            "model": model,
            "tokens_used": 0,
        }
