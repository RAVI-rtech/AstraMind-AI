"""
AI Router — routes requests to the appropriate AI provider.
"""

from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.ai_service import AIService

router = APIRouter()


class CompletionRequest(BaseModel):
    prompt: str
    model: Literal["gpt-4o", "gpt-4o-mini", "claude-3-5-sonnet", "gemini-pro"] = "gpt-4o"
    system_prompt: str = "You are Asterix AI, a helpful assistant."
    max_tokens: int = 2048
    temperature: float = 0.7
    stream: bool = False


class CompletionResponse(BaseModel):
    content: str
    model: str
    tokens_used: int


@router.post("/complete", response_model=CompletionResponse)
async def complete(
    body: CompletionRequest,
    current_user: User = Depends(get_current_user),
):
    """Route a completion request to the selected AI provider."""
    service = AIService()
    result = await service.complete(
        prompt=body.prompt,
        model=body.model,
        system_prompt=body.system_prompt,
        max_tokens=body.max_tokens,
        temperature=body.temperature,
    )
    return CompletionResponse(**result)


@router.get("/models")
async def list_models(current_user: User = Depends(get_current_user)):
    """Return available AI models."""
    return {
        "models": [
            {"id": "gpt-4o", "name": "GPT-4o", "provider": "openai", "description": "Most capable"},
            {"id": "gpt-4o-mini", "name": "GPT-4o Mini", "provider": "openai", "description": "Fast & efficient"},
            {"id": "claude-3-5-sonnet", "name": "Claude 3.5 Sonnet", "provider": "anthropic", "description": "Excellent reasoning"},
            {"id": "gemini-pro", "name": "Gemini Pro", "provider": "google", "description": "Google's best"},
        ]
    }
