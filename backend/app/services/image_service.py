"""
Image service — analyze (Gemini Vision), OCR (Tesseract), generate/edit (stubbed).
"""

import base64
import io
from typing import Any

from app.core.config import settings


class ImageService:
    async def analyze(self, image_bytes: bytes) -> dict[str, Any]:
        """Analyze an image using Gemini Vision."""
        if not settings.GEMINI_API_KEY:
            return {
                "description": "[Image analysis requires GEMINI_API_KEY in .env]",
                "objects": [],
                "colors": [],
                "text_detected": None,
            }

        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        b64 = base64.b64encode(image_bytes).decode()

        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                types.Part.from_text(
                    "Describe this image in detail. List the main objects you see, "
                    "the dominant colors, and any text present."
                ),
            ],
        )
        return {
            "description": response.text or "",
            "objects": [],
            "colors": [],
            "text_detected": None,
        }

    async def generate(
        self,
        prompt: str,
        size: str = "1024x1024",
        quality: str = "standard",
        style: str = "vivid",
    ) -> dict[str, Any]:
        """Image generation is not available with the Gemini backend (stubbed)."""
        return {
            "image_url": "",
            "revised_prompt": (
                "[Image generation is not available with the Gemini backend. "
                "Use the Image tab to generate images via a dedicated service.]"
            ),
        }

    async def ocr(self, image_bytes: bytes) -> dict[str, Any]:
        """Extract text from an image using Tesseract OCR."""
        try:
            import pytesseract
            from PIL import Image

            img = Image.open(io.BytesIO(image_bytes))
            text = pytesseract.image_to_string(img)
            return {"text": text.strip(), "confidence": 0.85, "language": None}
        except Exception as e:
            return {
                "text": f"[OCR error: {e}. Install tesseract-ocr system package.]",
                "confidence": 0.0,
                "language": None,
            }

    async def edit(self, image_bytes: bytes, prompt: str) -> dict[str, Any]:
        """Image editing is not available with the Gemini backend (stubbed)."""
        return {
            "image_url": "",
            "error": "Image editing is not available with the Gemini backend.",
        }
