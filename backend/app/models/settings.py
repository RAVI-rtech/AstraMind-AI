"""
User settings ORM model.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    # AI settings
    selected_model: Mapped[str] = mapped_column(String(100), default="gpt-4o")
    system_prompt: Mapped[str] = mapped_column(
        Text, default="You are Asterix AI, a helpful AI assistant."
    )
    max_tokens: Mapped[int] = mapped_column(Integer, default=2048)
    temperature: Mapped[float] = mapped_column(Float, default=0.7)
    streaming_enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    # App preferences
    language: Mapped[str] = mapped_column(String(10), default="en")
    voice_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    voice_speed: Mapped[float] = mapped_column(Float, default=1.0)
    haptic_feedback: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_save_chats: Mapped[bool] = mapped_column(Boolean, default=True)
    font_size: Mapped[str] = mapped_column(String(20), default="medium")

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user: Mapped["User"] = relationship("User", back_populates="app_settings")  # type: ignore[name-defined]
