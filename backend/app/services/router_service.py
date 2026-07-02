"""
Router Service — orchestrates classification → handler dispatch → Gemini call → response.
"""

from __future__ import annotations

from typing import Any

from app.core.config import settings
from app.schemas.ai_router import (
    ClassificationResult,
    RequestCategory,
    RouterRequest,
    RouterResponse,
)
from app.services.classifier_service import ClassifierService
from app.services.handlers import (
    BaseHandler,
    ChatHandler,
    CodeHandler,
    GeneralHandler,
    ImageHandler,
    PDFHandler,
    QuizHandler,
    StudyPlannerHandler,
    VoiceHandler,
)

GEMINI_MODEL = "gemini-2.5-flash"


class RouterService:
    """
    Main orchestrator.

    Flow:
      request → ClassifierService.classify() → pick handler
              → build AI messages → call Gemini 2.5 Flash
              → handler.handle() → RouterResponse
    """

    def __init__(self) -> None:
        self._classifier = ClassifierService()
        self._registry: dict[RequestCategory, BaseHandler] = self._build_registry()

    def _build_registry(self) -> dict[RequestCategory, BaseHandler]:
        return {
            RequestCategory.CHAT: ChatHandler(),
            RequestCategory.CODE: CodeHandler(),
            RequestCategory.PDF: PDFHandler(),
            RequestCategory.IMAGE: ImageHandler(),
            RequestCategory.VOICE: VoiceHandler(),
            RequestCategory.STUDY_PLANNER: StudyPlannerHandler(),
            RequestCategory.QUIZ: QuizHandler(),
            RequestCategory.GENERAL: GeneralHandler(),
        }

    async def route(self, request: RouterRequest) -> RouterResponse:
        # 1. Classify
        classification = await self._classifier.classify(
            message=request.message,
            force_category=request.force_category,
            context=request.context,
        )

        # 2. Pick handler
        handler = self._registry.get(
            classification.category, self._registry[RequestCategory.GENERAL]
        )

        # 3. Build prompt
        prompt = self._build_prompt(request, handler, classification.category)

        # 4. Call Gemini
        ai_result = await self._call_gemini(
            system_prompt=handler.system_prompt,
            prompt=prompt,
            context=request.context,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
        )

        # 5. Post-process via handler
        category_data = await handler.handle(request, ai_result["content"])

        return RouterResponse(
            classification=classification,
            content=ai_result["content"],
            model=ai_result["model"],
            tokens_used=ai_result["tokens_used"],
            category_data=category_data,
            suggested_actions=handler.suggested_actions,
        )

    # ── Private helpers ───────────────────────────────────────────────────────

    def _build_prompt(
        self,
        request: RouterRequest,
        handler: BaseHandler,
        category: RequestCategory,
    ) -> str:
        if category == RequestCategory.QUIZ and hasattr(handler, "_build_user_prompt"):
            return handler._build_user_prompt(request)  # type: ignore[attr-defined]
        return request.message

    async def _call_gemini(
        self,
        system_prompt: str,
        prompt: str,
        context: list[dict[str, str]],
        max_tokens: int,
        temperature: float,
    ) -> dict[str, Any]:
        if not settings.GEMINI_API_KEY:
            return self._stub()

        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        # Build conversation history — Gemini uses "model" for assistant turns
        contents: list[dict] = []
        for turn in context:
            role = "model" if turn["role"] == "assistant" else "user"
            contents.append({"role": role, "parts": [{"text": turn["content"]}]})
        contents.append({"role": "user", "parts": [{"text": prompt}]})

        response = await client.aio.models.generate_content(
            model=GEMINI_MODEL,
            contents=contents,
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
    def _stub() -> dict[str, Any]:
        return {
            "content": (
                "AI features are not yet configured. "
                "Add GEMINI_API_KEY to backend/.env to enable real responses."
            ),
            "model": GEMINI_MODEL,
            "tokens_used": 0,
        }
