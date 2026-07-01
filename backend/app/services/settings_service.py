"""
Settings service — get, update, and reset user preferences.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.settings import UserSettings
from app.schemas.settings import SettingsResponse, UpdateSettingsRequest


class SettingsService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_or_create(self, user_id: str) -> SettingsResponse:
        result = await self.db.execute(
            select(UserSettings).where(UserSettings.user_id == user_id)
        )
        user_settings = result.scalar_one_or_none()

        if not user_settings:
            user_settings = UserSettings(user_id=user_id)
            self.db.add(user_settings)
            await self.db.commit()
            await self.db.refresh(user_settings)

        return SettingsResponse.model_validate(user_settings)

    async def update(self, user_id: str, data: UpdateSettingsRequest) -> SettingsResponse:
        result = await self.db.execute(
            select(UserSettings).where(UserSettings.user_id == user_id)
        )
        user_settings = result.scalar_one_or_none()

        if not user_settings:
            user_settings = UserSettings(user_id=user_id)
            self.db.add(user_settings)

        update_data = data.model_dump(exclude_none=True)
        for field, value in update_data.items():
            setattr(user_settings, field, value)

        await self.db.commit()
        await self.db.refresh(user_settings)
        return SettingsResponse.model_validate(user_settings)

    async def reset(self, user_id: str) -> None:
        result = await self.db.execute(
            select(UserSettings).where(UserSettings.user_id == user_id)
        )
        user_settings = result.scalar_one_or_none()
        if user_settings:
            await self.db.delete(user_settings)
            await self.db.commit()
