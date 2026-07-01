"""
Settings Pydantic schemas.
"""

from typing import Literal, Optional

from pydantic import BaseModel, Field


class SettingsResponse(BaseModel):
    selected_model: str
    system_prompt: str
    max_tokens: int
    temperature: float
    streaming_enabled: bool
    language: str
    voice_enabled: bool
    voice_speed: float
    haptic_feedback: bool
    auto_save_chats: bool
    font_size: str

    model_config = {"from_attributes": True}


class UpdateSettingsRequest(BaseModel):
    selected_model: Optional[Literal["gpt-4o", "gpt-4o-mini", "claude-3-5-sonnet", "gemini-pro"]] = None
    system_prompt: Optional[str] = None
    max_tokens: Optional[int] = Field(None, ge=256, le=8192)
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    streaming_enabled: Optional[bool] = None
    language: Optional[str] = None
    voice_enabled: Optional[bool] = None
    voice_speed: Optional[float] = Field(None, ge=0.5, le=2.0)
    haptic_feedback: Optional[bool] = None
    auto_save_chats: Optional[bool] = None
    font_size: Optional[Literal["small", "medium", "large"]] = None
