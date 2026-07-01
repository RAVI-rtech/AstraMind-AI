"""
PDF service — parsing, summarization, Q&A, and translation.

Requires PyMuPDF (fitz) for parsing and AI service for analysis.
"""

from typing import Any, Literal

from app.services.ai_service import AIService


class PDFService:
    async def process(
        self,
        pdf_bytes: bytes,
        action: Literal["summarize", "extract", "analyze"],
    ) -> dict[str, Any]:
        """Parse a PDF and perform the requested action."""
        try:
            import fitz  # PyMuPDF

            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            pages = doc.page_count
            text = "\n\n".join(page.get_text() for page in doc)
            word_count = len(text.split())
            doc.close()
        except Exception:
            return {
                "pages": 0,
                "word_count": 0,
                "extracted_text": None,
                "summary": "[PDF parsing requires PyMuPDF — install requirements.txt]",
            }

        if action == "extract":
            return {
                "pages": pages,
                "word_count": word_count,
                "extracted_text": text[:10_000],
                "summary": None,
            }

        ai_svc = AIService()
        truncated = text[:6_000]
        prompt = (
            f"Please {action} the following document content:\n\n{truncated}"
        )
        result = await ai_svc.complete(
            prompt=prompt,
            model="gpt-4o",
            system_prompt="You are a document analysis assistant. Be concise and structured.",
            max_tokens=1024,
            temperature=0.3,
        )
        return {
            "pages": pages,
            "word_count": word_count,
            "extracted_text": None,
            "summary": result["content"],
        }

    async def query(self, document_id: str, question: str) -> dict[str, Any]:
        """Answer a question about a document. Placeholder — vector DB needed."""
        return {
            "answer": (
                f"[Document Q&A] Vector search will be implemented in phase 2. "
                f"Question: {question}"
            ),
            "source_pages": [],
        }

    async def translate(self, pdf_bytes: bytes, target_language: str) -> dict[str, Any]:
        """Extract and translate PDF text."""
        result = await self.process(pdf_bytes, action="extract")
        if not result.get("extracted_text"):
            return {"translated_text": None, "error": "Could not extract text from PDF"}

        ai_svc = AIService()
        translation = await ai_svc.complete(
            prompt=f"Translate the following text to {target_language}:\n\n{result['extracted_text'][:4000]}",
            model="gpt-4o",
            system_prompt="You are a professional translator. Preserve formatting.",
            max_tokens=2048,
            temperature=0.1,
        )
        return {"translated_text": translation["content"], "target_language": target_language}
