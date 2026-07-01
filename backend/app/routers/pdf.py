"""
PDF router — upload, parse, summarize, and Q&A over PDFs.
"""

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from typing import Literal, Optional

from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.pdf_service import PDFService

router = APIRouter()


class PDFAnalysisResponse(BaseModel):
    pages: int
    word_count: int
    summary: Optional[str] = None
    extracted_text: Optional[str] = None


class PDFQueryRequest(BaseModel):
    question: str
    document_id: str


class PDFQueryResponse(BaseModel):
    answer: str
    source_pages: list[int]


@router.post("/upload", response_model=PDFAnalysisResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    action: Literal["summarize", "extract", "analyze"] = Form(default="summarize"),
    current_user: User = Depends(get_current_user),
):
    """Upload a PDF and perform the requested action."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    service = PDFService()
    pdf_bytes = await file.read()
    result = await service.process(pdf_bytes, action=action)
    return PDFAnalysisResponse(**result)


@router.post("/query", response_model=PDFQueryResponse)
async def query_pdf(
    body: PDFQueryRequest,
    current_user: User = Depends(get_current_user),
):
    """Ask a question about a previously uploaded PDF."""
    service = PDFService()
    result = await service.query(body.document_id, body.question)
    return PDFQueryResponse(**result)


@router.post("/translate")
async def translate_pdf(
    file: UploadFile = File(...),
    target_language: str = Form(default="es"),
    current_user: User = Depends(get_current_user),
):
    """Extract and translate PDF content."""
    service = PDFService()
    pdf_bytes = await file.read()
    return await service.translate(pdf_bytes, target_language=target_language)
