"""
Settings router — get and update user preferences.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.settings import SettingsResponse, UpdateSettingsRequest
from app.services.settings_service import SettingsService

router = APIRouter()


@router.get("/", response_model=SettingsResponse)
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SettingsService(db)
    return await service.get_or_create(current_user.id)


@router.patch("/", response_model=SettingsResponse)
async def update_settings(
    body: UpdateSettingsRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SettingsService(db)
    return await service.update(current_user.id, body)


@router.delete("/", status_code=204)
async def reset_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SettingsService(db)
    await service.reset(current_user.id)
