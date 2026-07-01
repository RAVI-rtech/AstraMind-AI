"""
Voice router — speech-to-text and text-to-speech.
"""

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Literal

from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.voice_service import VoiceService

router = APIRouter()


class TTSRequest(BaseModel):
    text: str
    voice: Literal["alloy", "echo", "fable", "onyx", "nova", "shimmer"] = "nova"
    speed: float = 1.0


class TranscriptResponse(BaseModel):
    text: str
    language: str
    confidence: float


@router.post("/transcribe", response_model=TranscriptResponse)
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = Form(default="en"),
    current_user: User = Depends(get_current_user),
):
    """Transcribe audio file to text using speech-to-text (STT)."""
    service = VoiceService()
    audio_bytes = await file.read()
    result = await service.transcribe(audio_bytes, language=language)
    return TranscriptResponse(**result)


@router.post("/synthesize")
async def synthesize_speech(
    body: TTSRequest,
    current_user: User = Depends(get_current_user),
):
    """Convert text to speech audio (TTS)."""
    service = VoiceService()
    audio_stream = await service.synthesize(body.text, voice=body.voice, speed=body.speed)
    return StreamingResponse(audio_stream, media_type="audio/mpeg")
