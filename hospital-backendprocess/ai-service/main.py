"""Load .env from this folder first (uvicorn cwd is often not ai-service/)."""
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")
load_dotenv()

import os
from typing import Annotated, Optional

from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from rag import ask_rag
from db import store_data

app = FastAPI(title="Hospital RAG AI")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    question: str

class StoreRequest(BaseModel):
    content: str
    ref_id: int
    type: str

@app.get("/")
def home():
    return {"message": "AI RAG Service Running 🔥"}

@app.api_route("/health", methods=["GET", "HEAD"])
def health():
    return {"status": "ok"}    

@app.post("/store")
def store(
    req: StoreRequest,
    x_ai_internal_key: Annotated[Optional[str], Header(alias="X-AI-Internal-Key")] = None,
):
    expected = (os.getenv("AI_INTERNAL_KEY") or "").strip()
    if expected and (not x_ai_internal_key or x_ai_internal_key.strip() != expected):
        return JSONResponse(
            status_code=401,
            content={"detail": "Missing or invalid X-AI-Internal-Key"},
        )
    result = store_data(req.content, req.ref_id, req.type)
    return {"status": result}

@app.post("/ask")
def ask(req: Query):
    answer = ask_rag(req.question)
    return {"answer": answer}