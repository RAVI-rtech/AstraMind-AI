"""
Chat service — conversation and message persistence.
"""

from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.chat import Conversation, Message
from app.schemas.chat import (
    ConversationDetailResponse,
    ConversationResponse,
    CreateConversationRequest,
    MessageResponse,
    SendMessageRequest,
)
from app.services.ai_service import AIService


class ChatService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_conversations(self, user_id: str) -> list[ConversationResponse]:
        # Count messages per conversation via subquery
        msg_count_sq = (
            select(Message.conversation_id, func.count(Message.id).label("cnt"))
            .group_by(Message.conversation_id)
            .subquery()
        )
        result = await self.db.execute(
            select(Conversation, msg_count_sq.c.cnt)
            .outerjoin(msg_count_sq, Conversation.id == msg_count_sq.c.conversation_id)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
        )
        rows = result.all()
        conversations = []
        for conv, cnt in rows:
            resp = ConversationResponse.model_validate(conv)
            resp.message_count = cnt or 0
            conversations.append(resp)
        return conversations

    async def create_conversation(
        self, user_id: str, data: CreateConversationRequest
    ) -> ConversationResponse:
        conv = Conversation(
            user_id=user_id,
            title=data.title,
            model=data.model,
            system_prompt=data.system_prompt or "You are Asterix AI, a helpful assistant.",
        )
        self.db.add(conv)
        await self.db.commit()
        await self.db.refresh(conv)
        resp = ConversationResponse.model_validate(conv)
        resp.message_count = 0
        return resp

    async def get_conversation(
        self, conversation_id: str, user_id: str
    ) -> Optional[ConversationDetailResponse]:
        result = await self.db.execute(
            select(Conversation)
            .options(selectinload(Conversation.messages))
            .where(Conversation.id == conversation_id, Conversation.user_id == user_id)
        )
        conv = result.scalar_one_or_none()
        if not conv:
            return None
        resp = ConversationDetailResponse.model_validate(conv)
        resp.message_count = len(conv.messages)
        resp.messages = [MessageResponse.model_validate(m) for m in conv.messages]
        return resp

    async def delete_conversation(self, conversation_id: str, user_id: str) -> bool:
        result = await self.db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id,
            )
        )
        conv = result.scalar_one_or_none()
        if not conv:
            return False
        await self.db.delete(conv)
        await self.db.commit()
        return True

    async def send_message(
        self, conversation_id: str, user_id: str, data: SendMessageRequest
    ) -> MessageResponse:
        result = await self.db.execute(
            select(Conversation)
            .options(selectinload(Conversation.messages))
            .where(Conversation.id == conversation_id, Conversation.user_id == user_id)
        )
        conv = result.scalar_one_or_none()
        if not conv:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Conversation not found")

        user_msg = Message(
            conversation_id=conv.id,
            role="user",
            content=data.content,
        )
        self.db.add(user_msg)
        await self.db.flush()

        # Call AI service
        ai_svc = AIService()
        ai_result = await ai_svc.complete(
            prompt=data.content,
            model=conv.model,  # type: ignore[arg-type]
            system_prompt=conv.system_prompt,
            max_tokens=2048,
            temperature=0.7,
        )

        assistant_msg = Message(
            conversation_id=conv.id,
            role="assistant",
            content=ai_result["content"],
            tokens_used=ai_result["tokens_used"],
        )
        self.db.add(assistant_msg)
        await self.db.commit()
        await self.db.refresh(assistant_msg)

        return MessageResponse.model_validate(assistant_msg)
