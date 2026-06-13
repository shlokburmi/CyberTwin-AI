from fastapi import APIRouter
from pydantic import BaseModel
import random
from app.services.ml_service import ml_service
from app.services.rag_service import rag_service
from app.services.dl_service import dl_service

router = APIRouter(prefix="/api/v1")

class AssistantQuery(BaseModel):
    question: str

@router.get("/threat-detection")
def threat_detection():
    # Returns a simulated anomaly detection run
    return ml_service.detect_anomaly()

@router.get("/dl-threat-analysis")
def dl_threat_analysis():
    # Returns LSTM sequence analysis
    return dl_service.analyze_sequence()

@router.post("/security-assistant")
def security_assistant(query: AssistantQuery):
    answer = rag_service.answer_question(query.question)
    return {"answer": answer}

@router.get("/alerts")
def get_alerts():
    # Simulating recent alerts
    alerts = [
        {"type": "Brute Force", "severity": "High", "status": "Detected", "timestamp": "10 mins ago"},
        {"type": "Suspicious Login Spike", "severity": "Medium", "status": "Investigating", "timestamp": "1 hour ago"},
        {"type": "SQL Injection Attempt", "severity": "High", "status": "Blocked", "timestamp": "3 hours ago"}
    ]
    return alerts

@router.get("/risk-score")
def get_risk_score():
    score = random.randint(40, 95)
    level = "High" if score > 75 else ("Medium" if score > 50 else "Low")
    return {"risk_score": score, "level": level}

@router.get("/system-status")
def get_system_status():
    return {
        "backend": "active",
        "ml_engine": "active",
        "dl_engine": "active",
        "rag_engine": "active"
    }
