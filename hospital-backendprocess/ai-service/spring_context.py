"""
Server-side fetch of live hospital data from all Spring Boot services (via API Gateway).

Set AI_INTERNAL_KEY to the same value as app.aiInternalKey in:
user-service, patient, doctor, and pharmacy.
"""
import os

import requests

DEFAULT_GATEWAY = "http://localhost:9090"


def _as_list(value: str) -> list[str]:
    return [x.strip().rstrip("/") for x in (value or "").split(",") if x.strip()]


def _fetch_from_candidates(
    paths: list[str], headers: dict[str, str], label: str
) -> str | None:
    last_error = ""
    for url in paths:
        try:
            r = requests.get(url, headers=headers, timeout=12)
            if r.status_code == 401:
                return f"({label}: unauthorized — check AI_INTERNAL_KEY matches Spring app.aiInternalKey)"
            if r.status_code in (404, 503):
                last_error = f"HTTP {r.status_code}"
                continue
            if not r.ok:
                return f"({label}: HTTP {r.status_code})"
            text = (r.text or "").strip()
            if text:
                return f"## {label}\n{text}"
            return None
        except requests.RequestException as e:
            last_error = str(e)
            continue
    if last_error:
        if last_error.startswith("HTTP "):
            return f"({label}: {last_error})"
        return f"({label}: unreachable — {last_error})"
    return None


def fetch_live_hospital_context() -> str:
    gateway = os.getenv("SPRING_GATEWAY_URL", DEFAULT_GATEWAY).rstrip("/")
    key = (os.getenv("AI_INTERNAL_KEY") or "").strip()
    if not key:
        return ""

    headers = {"X-AI-Internal-Key": key}
    parts: list[str] = []

    for gateway_path, fallback_env, fallback_default, label in (
        (
            "/api/users/internal/ai-context",
            "USER_SERVICE_INTERNAL_URLS",
            "http://localhost:8080/api/users/internal/ai-context",
            "User accounts (Spring / user-service DB)",
        ),
        (
            "/api/patients/internal/ai-context",
            "PATIENT_SERVICE_INTERNAL_URLS",
            "http://localhost:8082/api/patients/internal/ai-context",
            "Patient registry (Spring / patient DB)",
        ),
        (
            "/api/doctors/internal/ai-context",
            "DOCTOR_SERVICE_INTERNAL_URLS",
            "http://localhost:8081/api/doctors/internal/ai-context",
            "Doctors (Spring / doctor DB)",
        ),
        (
            "/api/pharmacy/internal/ai-context",
            "PHARMACY_SERVICE_INTERNAL_URLS",
            "http://localhost:8083/api/pharmacy/internal/ai-context",
            "Pharmacy (Spring / pharmacy service)",
        ),
    ):
        candidates = [f"{gateway}{gateway_path}"]
        candidates.extend(_as_list(os.getenv(fallback_env, "")))
        if not _as_list(os.getenv(fallback_env, "")):
            candidates.extend(_as_list(fallback_default))
        result = _fetch_from_candidates(candidates, headers, label)
        if result:
            parts.append(result)

    return "\n\n".join(parts) if parts else ""
