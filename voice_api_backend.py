import os
import aiofiles
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

router = APIRouter()

class TTSRequest(BaseModel):
    text: str
    language: str = "en" # "en" or "te"
    voice_type: str = "premium_female"

@router.post("/stt")
async def speech_to_text(audio: UploadFile = File(...), language: str = Form("en")):
    """
    Receives an audio file from the Android client, processes it using 
    an advanced AI model (e.g., Whisper), and returns transcribed text.
    Supports English and Telugu.
    """
    if not audio.filename.endswith((".wav", ".mp3", ".m4a")):
        raise HTTPException(status_code=400, detail="Invalid audio format. Use wav, mp3, or m4a.")

    # Save incoming audio temporarily
    temp_path = f"temp_{audio.filename}"
    async with aiofiles.open(temp_path, 'wb') as out_file:
        content = await audio.read()
        await out_file.write(content)

    try:
        # In production, replace with actual call to WhisperX or Google Cloud Speech
        # e.g., transcription = whisper.transcribe(temp_path, language=language)
        
        simulated_transcription = "This is a simulated cloud transcription."
        if language == "te":
            simulated_transcription = "ఇది క్లౌడ్ ద్వారా ట్రాన్స్క్రిప్ట్ చేయబడిన టెక్స్ట్."
            
        return JSONResponse(content={
            "status": "success",
            "transcription": simulated_transcription,
            "language": language
        })
    finally:
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    """
    Converts text to natural-sounding speech.
    Used when the app needs ultra-realistic voice instead of offline Android TTS.
    """
    try:
        # In production, this would call ElevenLabs, OpenAI TTS, or Google Cloud TTS.
        # e.g., audio_path = elevenlabs.generate(request.text, voice=request.voice_type)
        
        # Simulate returning a static pre-generated audio file for architecture demonstration
        simulated_audio_path = "assets/simulated_response.mp3"
        
        if not os.path.exists(simulated_audio_path):
             return JSONResponse(content={"error": "Audio simulation asset missing."}, status_code=500)
             
        return FileResponse(
            path=simulated_audio_path, 
            media_type="audio/mpeg", 
            filename="response.mp3"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))