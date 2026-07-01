"""
Image router — analyze, generate, edit, and OCR.
"""

from fastapi import APIRouter, Depends, File, Form, UploadFile
from pydantic import BaseModel
from typing import Literal, Optional

from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.image_service import ImageService

router = APIRouter()


class ImageAnalysisResponse(BaseModel):
    description: str
    objects: list[str]
    colors: list[str]
    text_detected: Optional[str] = None


class ImageGenerationRequest(BaseModel):
    prompt: str
    size: Literal["256x256", "512x512", "1024x1024", "1024x1792", "1792x1024"] = "1024x1024"
    quality: Literal["standard", "hd"] = "standard"
    style: Literal["vivid", "natural"] = "vivid"


class ImageGenerationResponse(BaseModel):
    image_url: str
    revised_prompt: Optional[str] = None


class OCRResponse(BaseModel):
    text: str
    confidence: float
    language: Optional[str] = None


@router.post("/analyze", response_model=ImageAnalysisResponse)
async def analyze_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Analyze an image using vision AI."""
    service = ImageService()
    image_bytes = await file.read()
    result = await service.analyze(image_bytes)
    return ImageAnalysisResponse(**result)


@router.post("/generate", response_model=ImageGenerationResponse)
async def generate_image(
    body: ImageGenerationRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate an image from a text prompt."""
    service = ImageService()
    result = await service.generate(
        prompt=body.prompt, size=body.size, quality=body.quality, style=body.style
    )
    return ImageGenerationResponse(**result)


@router.post("/ocr", response_model=OCRResponse)
async def extract_text(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Extract text from an image using OCR."""
    service = ImageService()
    image_bytes = await file.read()
    result = await service.ocr(image_bytes)
    return OCRResponse(**result)


@router.post("/edit")
async def edit_image(
    file: UploadFile = File(...),
    prompt: str = Form(...),
    current_user: User = Depends(get_current_user),
):
    """Edit an image based on a text prompt."""
    service = ImageService()
    image_bytes = await file.read()
    return await service.edit(image_bytes, prompt=prompt)
