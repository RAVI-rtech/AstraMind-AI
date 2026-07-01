"""
Voice service — STT (Whisper) and TTS (OpenAI).

Stubbed until OPENAI_API_KEY is set.
"""

import io
from typing import Any

from app.core.config import settings


class VoiceService:
    async def transcribe(self, audio_bytes: bytes, language: str = "en") -> dict[str, Any]:
        """Transcribe audio to text using OpenAI Whisper."""
        if not settings.OPENAI_API_KEY:
            return {
                "text": "[Voice transcription requires OPENAI_API_KEY in .env]",
                "language": language,
                "confidence": 0.0,
            }

        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = "audio.webm"
        response = await client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language=language,
        )
        return {
            "text": response.text,
            "language": language,
            "confidence": 1.0,
        }

    async def synthesize(
        self, text: str, voice: str = "nova", speed: float = 1.0
    ) -> io.BytesIO:
        """Convert text to speech using OpenAI TTS."""
        if not settings.OPENAI_API_KEY:
            return io.BytesIO(b"")

        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        response = await client.audio.speech.create(
            model="tts-1",
            voice=voice,  # type: ignore[arg-type]
            input=text,
            speed=speed,
        )
        buffer = io.BytesIO()
        async for chunk in response.iter_bytes():
            buffer.write(chunk)
        buffer.seek(0)
        return buffer
