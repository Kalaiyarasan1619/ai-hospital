"""
Server-side fetch of live hospital data from all Spring Boot services (via API Gateway).

Set AI_INTERNAL_KEY to the same value as app.aiInternalKey in:
user-service, patient, doctor, and pharmacy.
"""
import os

import requests

DEFAULT_GATEWAY = "https://ai-hospital-api-gateway.onrender.com"


def _as_list(value: str) -> list[str]:
    return [x.strip().rstrip("/") for x in (value or "").split(",") if x.strip()]


def _candidate_urls(
    gateway: str, gateway_path: str, fallback_env: str, fallback_default: str
) -> list[str]:
    """
    Build try-order for one internal context endpoint.

    Built-in HTTPS fallbacks are always included (deduped). If *SERVICE_INTERNAL_URLS
    pointed at a dead base URL, older code omitted defaults; that is fixed here.
    """
    seen: set[str] = set()
    out: list[str] = []

    def add(u: str) -> None:
        u = (u or "").strip().rstrip("/")
        if not u or u in seen:
            return
        seen.add(u)
        out.append(u)

    g = gateway.rstrip("/")
    add(f"{g}{gateway_path}")
    for x in _as_list(os.getenv(fallback_env, "")):
        add(x)
    for x in _as_list(fallback_default):
        add(x)
    return out


def _fetch_from_candidates(
    paths: list[str], headers: dict[str, str], label: str
) -> str | None:
    last_error = ""
    for url in paths:
        try:
            r = requests.get(url, headers=headers, timeout=12)
            if r.status_code == 401:
                last_error = "HTTP 401 (X-AI-Internal-Key / app.aiInternalKey mismatch for this host)"
                continue
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
            "https://ai-hospital-user.onrender.com/api/users/internal/ai-context",
            "User accounts (Spring / user-service DB)",
        ),
        (
            "/api/patients/internal/ai-context",
            "PATIENT_SERVICE_INTERNAL_URLS",
            "https://ai-hospital-patient-service.onrender.com/api/patients/internal/ai-context",
            "Patient registry (Spring / patient DB)",
        ),
        (
            "/api/doctors/internal/ai-context",
            "DOCTOR_SERVICE_INTERNAL_URLS",
            "https://ai-hospital-doctor.onrender.com/api/doctors/internal/ai-context",
            "Doctors (Spring / doctor DB)",
        ),
        (
            "/api/pharmacy/internal/ai-context",
            "PHARMACY_SERVICE_INTERNAL_URLS",
            "https://ai-hospital-pharmacy.onrender.com/api/pharmacy/internal/ai-context",
            "Pharmacy (Spring / pharmacy service)",
        ),
    ):
        candidates = _candidate_urls(gateway, gateway_path, fallback_env, fallback_default)
        result = _fetch_from_candidates(candidates, headers, label)
        if result:
            parts.append(result)

    return "\n\n".join(parts) if parts else ""
