# Models package — import all models here so SQLAlchemy registers them
from app.models.user import User
from app.models.chat import Conversation, Message
from app.models.settings import UserSettings

__all__ = ["User", "Conversation", "Message", "UserSettings"]
