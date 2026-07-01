"""
Authentication service — registration, login, profile updates.
"""

from typing import Optional, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.models.settings import UserSettings
from app.schemas.user import RegisterRequest, UpdateProfileRequest


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_user_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def register(self, data: RegisterRequest) -> Tuple[str, User]:
        existing = await self.get_user_by_email(data.email)
        if existing:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        user = User(
            email=data.email,
            name=data.name,
            hashed_password=hash_password(data.password),
        )
        self.db.add(user)
        await self.db.flush()

        # Create default settings for the new user
        user_settings = UserSettings(user_id=user.id)
        self.db.add(user_settings)
        await self.db.commit()
        await self.db.refresh(user)

        token = create_access_token(subject=user.id)
        return token, user

    async def login(self, email: str, password: str) -> Optional[Tuple[str, User]]:
        user = await self.get_user_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        token = create_access_token(subject=user.id)
        return token, user

    async def update_profile(self, user: User, data: UpdateProfileRequest) -> User:
        if data.name is not None:
            user.name = data.name
        if data.email is not None:
            user.email = data.email
        await self.db.commit()
        await self.db.refresh(user)
        return user
