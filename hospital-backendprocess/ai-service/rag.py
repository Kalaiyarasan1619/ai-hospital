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
        "1. In `hospital-backendprocess/ai-service/.env` (or your host env) set:\n"
        "   AI_INTERNAL_KEY=choose-a-long-random-secret\n"
        "   SPRING_GATEWAY_URL=https://your-api-gateway.example.com\n"
        "   (Optional overrides, comma-separated: USER_SERVICE_INTERNAL_URLS, "
        "PATIENT_SERVICE_INTERNAL_URLS, DOCTOR_SERVICE_INTERNAL_URLS, "
        "PHARMACY_SERVICE_INTERNAL_URLS — full URLs to each service's "
        "`/api/.../internal/ai-context` path.)\n"
        "2. On each Spring Boot service (user, patient, doctor, pharmacy), set the same "
        "value in `app.aiInternalKey` (e.g. platform env `AI_INTERNAL_KEY`).\n"
        "3. Deploy or restart **Eureka**, **API Gateway**, then all Java services, then "
        "ai-service, so the gateway can reach every service over HTTPS.\n"
        "4. Restart the Python app after changing env.\n\n"
        "Optional: **POST /store** on ai-service to add pgvector embeddings for extra context."
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
            "matching app.aiInternalKey on each Spring service; ensure SPRING_GATEWAY_URL "
            "and deployed Eureka + gateway + microservices are up; (2) Index text via "
            "POST /store into the embeddings table."
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

