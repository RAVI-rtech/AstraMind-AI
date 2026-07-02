from fastapi import FastAPI
from backend.app.api import chat, vision, pdf, tools

app = FastAPI(title="AstraMind AI Backend")

# Register Routers
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(vision.router, prefix="/api/vision", tags=["Vision"])
app.include_router(pdf.router, prefix="/api/pdf", tags=["PDF"])
app.include_router(tools.router, prefix="/api/tools", tags=["Tools"])

@app.get("/")
async def root():
    return {"message": "AstraMind AI API is online."}