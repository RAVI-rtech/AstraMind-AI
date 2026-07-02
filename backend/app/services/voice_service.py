"""
Voice service — STT and TTS.

Gemini does not yet expose a speech API compatible with these endpoints.
Transcription and synthesis are stubbed and will remain so until
the Gemini Live / Speech API is generally available.
"""

import io
from typing import Any


class VoiceService:
    async def transcribe(self, audio_bytes: bytes, language: str = "en") -> dict[str, Any]:
        """Transcribe audio to text. (Stubbed — Gemini speech API not yet available.)"""
        return {
            "text": "[Voice transcription is not yet available with the Gemini backend.]",
            "language": language,
            "confidence": 0.0,
        }

    async def synthesize(
        self, text: str, voice: str = "nova", speed: float = 1.0
    ) -> io.BytesIO:
        """Convert text to speech. (Stubbed — Gemini TTS not yet available.)"""
        return io.BytesIO(b"")
