"""
Chat Pydantic schemas.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CreateConversationRequest(BaseModel):
    title: str = "New Conversation"
    model: str = "gpt-4o"
    system_prompt: Optional[str] = None


class SendMessageRequest(BaseModel):
    content: str
    stream: bool = False


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    tokens_used: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    id: str
    title: str
    model: str
    system_prompt: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    model_config = {"from_attributes": True}


class ConversationDetailResponse(ConversationResponse):
    messages: list[MessageResponse] = []
