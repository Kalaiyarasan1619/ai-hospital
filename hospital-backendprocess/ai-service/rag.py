import os

from db import search_similar
from groq_client import ask_groq
from spring_context import fetch_live_hospital_context

# Avoid oversized prompts when all microservices return large snapshots (override via env).
_MAX_CTX = int(os.getenv("RAG_MAX_CONTEXT_CHARS", "28000"))


def _missing_key_help() -> str:
    return (
        "Hospital data is not connected because AI_INTERNAL_KEY is missing in the "
        "ai-service environment (this is the usual reason for this screen).\n\n"
        "Fix (same secret everywhere):\n"
        "1. In `hospital-backendprocess/ai-service/.env` add:\n"
        "   AI_INTERNAL_KEY=choose-a-long-random-secret\n"
        "   SPRING_GATEWAY_URL=http://localhost:9090\n"
        "2. Restart **uvicorn** after saving `.env`.\n"
        "3. Before starting each Spring Boot app, set the same value, e.g. PowerShell:\n"
        "   $env:AI_INTERNAL_KEY='choose-a-long-random-secret'\n"
        "   (user-service 8080, doctor 8081, patient 8082, pharmacy 8083 — "
        "`app.aiInternalKey` reads this env var.)\n"
        "4. Start **Eureka** (8761), then **API Gateway** (9090), then all Java services, "
        "then ai-service.\n\n"
        "Optional: call **POST /store** on ai-service to add pgvector embeddings for extra context."
    )


def ask_rag(question: str):
    if not (os.getenv("AI_INTERNAL_KEY") or "").strip():
        return _missing_key_help()

    live = fetch_live_hospital_context()
    docs = search_similar(question)

    chunks: list[str] = []
    if live:
        chunks.append(live)
    if docs:
        chunks.append("## Vector index (pgvector / embeddings)\n" + "\n---\n".join(docs))

    if not chunks:
        return (
            "No context available. Options: (1) Set AI_INTERNAL_KEY in ai-service and "
            "app.aiInternalKey in user-service, patient, doctor, and pharmacy; start Eureka + "
            "gateway + all services; (2) Index text via POST /store into the embeddings table."
        )

    context = "\n\n".join(chunks)
    if len(context) > _MAX_CTX:
        context = (
            context[:_MAX_CTX]
            + "\n\n[Context truncated at "
            + str(_MAX_CTX)
            + " characters; raise RAG_MAX_CONTEXT_CHARS if needed.]"
        )
    return ask_groq(context, question)

