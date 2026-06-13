"""
API Routes — All REST endpoints for the CyberTwin AI platform.

Endpoints:
- POST /simulate-attack     → Trigger full attack simulation pipeline
- GET  /activity-feed        → Live activity feed events
- GET  /dashboard-stats      → Comprehensive dashboard statistics
- GET  /alerts               → Threat alerts (filterable)
- GET  /risk-score           → Current risk score
- GET  /system-status        → System health check
- GET  /threat-detection     → Legacy: single ML detection
- GET  /dl-threat-analysis   → Legacy: single DL analysis
- POST /security-assistant   → RAG chatbot
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.services.ml_service import ml_service
from app.services.rag_service import rag_service
from app.services.dl_service import dl_service
from app.services.event_store import event_store
from app.services.simulation_service import run_simulation, ATTACK_PROFILES

router = APIRouter(prefix="/api/v1")


# ── Request/Response Models ───────────────────────────────────────

class AssistantQuery(BaseModel):
    question: str

class SimulationRequest(BaseModel):
    attack_type: str


# ── Simulation Engine ─────────────────────────────────────────────

@router.post("/simulate-attack")
def simulate_attack(request: SimulationRequest):
    """Trigger a full attack simulation. This is the core endpoint."""
    result = run_simulation(request.attack_type)
    return result

@router.get("/attack-types")
def get_attack_types():
    """Return available attack types with their metadata."""
    return {
        key: {
            "label": profile["label"],
            "description": profile["description"],
            "severity": profile["severity"],
        }
        for key, profile in ATTACK_PROFILES.items()
    }


# ── Dashboard & Monitoring ────────────────────────────────────────

@router.get("/dashboard-stats")
def get_dashboard_stats():
    """Return comprehensive dashboard statistics."""
    return event_store.get_dashboard_data()

@router.get("/activity-feed")
def get_activity_feed(limit: int = 30):
    """Return the latest activity feed events."""
    return event_store.get_feed(limit=limit)

@router.get("/alerts")
def get_alerts(severity: Optional[str] = None, attack_type: Optional[str] = None):
    """Return threat alerts, optionally filtered."""
    alerts = event_store.get_alerts(severity=severity, attack_type=attack_type)
    # If no simulation has been run yet, return some starter alerts
    if not alerts:
        return [
            {"type": "System Initialized", "severity": "Low", "status": "Active",
             "timestamp": "Just now", "description": "CyberTwin AI platform is online and monitoring."},
        ]
    return alerts

@router.get("/risk-score")
def get_risk_score():
    """Return the current risk score from the event store."""
    data = event_store.get_dashboard_data()
    score = data.get("risk_score", 25)
    level = "Critical" if score > 85 else ("High" if score > 65 else ("Medium" if score > 40 else "Low"))
    return {"risk_score": score, "level": level}

@router.get("/system-status")
def get_system_status():
    """Return system health status."""
    return {
        "backend": "active",
        "ml_engine": "active" if ml_service.is_trained else "inactive",
        "dl_engine": "active" if dl_service.is_trained else "inactive",
        "rag_engine": "active" if rag_service.vectorstore else "inactive",
    }


# ── Legacy Endpoints (backward compatibility) ─────────────────────

@router.get("/threat-detection")
def threat_detection():
    """Legacy: single ML anomaly detection run."""
    return ml_service.detect_anomaly()

@router.get("/dl-threat-analysis")
def dl_threat_analysis():
    """Legacy: single DL sequence analysis run."""
    return dl_service.analyze_sequence()


# ── RAG Security Assistant ────────────────────────────────────────

@router.post("/security-assistant")
def security_assistant(query: AssistantQuery):
    """RAG chatbot for cybersecurity questions."""
    answer = rag_service.answer_question(query.question)
    return {"answer": answer}
