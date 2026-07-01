"""
Image service — analyze, generate, edit, and OCR.

Stubbed until API keys are configured.
"""

import base64
import io
from typing import Any, Literal

from app.core.config import settings


class ImageService:
    async def analyze(self, image_bytes: bytes) -> dict[str, Any]:
        """Analyze an image using OpenAI Vision."""
        if not settings.OPENAI_API_KEY:
            return {
                "description": "[Image analysis requires OPENAI_API_KEY in .env]",
                "objects": [],
                "colors": [],
                "text_detected": None,
            }

        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        b64 = base64.b64encode(image_bytes).decode()
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{b64}"},
                        },
                        {
                            "type": "text",
                            "text": (
                                "Describe this image in detail. List the main objects you see, "
                                "the dominant colors, and any text present."
                            ),
                        },
                    ],
                }
            ],
            max_tokens=512,
        )
        content = response.choices[0].message.content or ""
        return {
            "description": content,
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
        """Generate an image using DALL-E 3."""
        if not settings.OPENAI_API_KEY:
            return {
                "image_url": "",
                "revised_prompt": "[Image generation requires OPENAI_API_KEY in .env]",
            }

        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        response = await client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size=size,  # type: ignore[arg-type]
            quality=quality,  # type: ignore[arg-type]
            style=style,  # type: ignore[arg-type]
            n=1,
        )
        image_data = response.data[0]
        return {
            "image_url": image_data.url or "",
            "revised_prompt": image_data.revised_prompt,
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
        """Edit an image using DALL-E."""
        if not settings.OPENAI_API_KEY:
            return {"image_url": "", "error": "OPENAI_API_KEY not configured"}

        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        response = await client.images.edit(
            image=("image.png", image_bytes, "image/png"),
            prompt=prompt,
            n=1,
            size="1024x1024",
        )
        return {"image_url": response.data[0].url or ""}
