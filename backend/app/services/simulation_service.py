"""
Simulation Service — Orchestrates end-to-end cyber attack simulations.

When a user triggers an attack, this service:
1. Generates realistic fake logs matching the attack profile
2. Runs them through the ML engine (Isolation Forest)
3. Runs them through the DL engine (LSTM)
4. Asks the RAG engine for mitigation recommendations
5. Updates risk score, alerts, and activity feed
"""

import random
from datetime import datetime, timedelta

from app.services.event_store import event_store
from app.services.ml_service import ml_service
from app.services.dl_service import dl_service
from app.services.rag_service import rag_service


# ── Attack Profiles ───────────────────────────────────────────────

ATTACK_PROFILES = {
    "brute_force": {
        "label": "Brute Force Attack",
        "description": "Repeated failed login attempts from a single IP targeting one account.",
        "severity": "High",
        "failed_attempts_range": (8, 50),
        "login_success_prob": 0.05,
        "ip_pattern": "192.168.1.{}",
        "ip_count": 1,  # single IP
        "locations": ["RU", "CN"],
        "log_count": (12, 20),
        "risk_boost": 35,
    },
    "credential_stuffing": {
        "label": "Credential Stuffing",
        "description": "Many different usernames with repeated failures from one source IP.",
        "severity": "High",
        "failed_attempts_range": (3, 15),
        "login_success_prob": 0.1,
        "ip_pattern": "10.99.0.{}",
        "ip_count": 1,
        "locations": ["CN", "KP", "RU"],
        "log_count": (15, 25),
        "risk_boost": 30,
    },
    "insider_threat": {
        "label": "Insider Threat",
        "description": "Unusual login times, privilege escalation, and abnormal access patterns.",
        "severity": "Medium",
        "failed_attempts_range": (1, 5),
        "login_success_prob": 0.7,
        "ip_pattern": "10.0.0.{}",
        "ip_count": 2,
        "locations": ["US", "IN"],
        "log_count": (8, 14),
        "risk_boost": 20,
    },
    "sql_injection": {
        "label": "SQL Injection Attempt",
        "description": "Malicious SQL payloads detected in login fields.",
        "severity": "Critical",
        "failed_attempts_range": (5, 30),
        "login_success_prob": 0.0,
        "ip_pattern": "45.33.32.{}",
        "ip_count": 3,
        "locations": ["RU", "CN", "BR"],
        "log_count": (10, 18),
        "risk_boost": 40,
    },

}


def generate_attack_logs(attack_type: str) -> list[dict]:
    """Generate realistic fake logs matching the chosen attack profile."""
    profile = ATTACK_PROFILES[attack_type]
    log_count = random.randint(*profile["log_count"])
    base_time = datetime.now()

    # Generate a small set of IPs for this attack
    ip_pool = [
        profile["ip_pattern"].format(random.randint(1, 254))
        for _ in range(profile["ip_count"])
    ]

    logs = []
    for i in range(log_count):
        timestamp = base_time + timedelta(seconds=i * random.randint(1, 5))
        failed = random.randint(*profile["failed_attempts_range"])
        success = 1 if random.random() < profile["login_success_prob"] else 0

        logs.append({
            "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "ip_address": random.choice(ip_pool),
            "failed_attempts": failed,
            "login_success": success,
            "location": random.choice(profile["locations"]),
            "device_type": random.choice(["Desktop", "Mobile", "Tablet"]),
        })

    return logs


def run_simulation(attack_type: str) -> dict:
    """
    Execute the full attack simulation pipeline:
    1. Generate logs → 2. ML detection → 3. DL analysis → 4. RAG mitigation
    5. Update risk score → 6. Generate alerts → 7. Push to activity feed
    """
    if attack_type not in ATTACK_PROFILES:
        return {"error": f"Unknown attack type: {attack_type}. Supported: {list(ATTACK_PROFILES.keys())}"}

    profile = ATTACK_PROFILES[attack_type]
    now = datetime.now().strftime("%H:%M:%S")

    # ── Step 1: Generate attack logs ──────────────────────────────
    event_store.add_feed_event("simulation", f"🚨 Simulating {profile['label']}...", "warning")
    logs = generate_attack_logs(attack_type)
    event_store.add_feed_event("logs", f"Generated {len(logs)} suspicious log entries", "info")

    # ── Step 2: Run ML engine ─────────────────────────────────────
    event_store.add_feed_event("ml_engine", "ML Engine analyzing logs...", "info")
    ml_result = ml_service.detect_anomaly_from_data(logs)
    ml_status = "anomaly_detected" if ml_result["is_anomaly"] else "normal"
    event_store.add_feed_event(
        "ml_engine",
        f"ML Engine: {ml_result['anomaly_count']}/{len(logs)} anomalies detected",
        "danger" if ml_result["is_anomaly"] else "info",
    )

    # ── Step 3: Run DL engine ─────────────────────────────────────
    event_store.add_feed_event("dl_engine", "DL Engine (LSTM) analyzing sequence...", "info")
    dl_result = dl_service.analyze_sequence_from_data(logs)
    event_store.add_feed_event(
        "dl_engine",
        f"DL Engine: {dl_result['threat_prediction']} (confidence: {dl_result['confidence']:.0%})",
        "danger" if dl_result["severity"] != "Low" else "info",
    )

    # ── Step 4: RAG mitigation recommendation ─────────────────────
    event_store.add_feed_event("rag_engine", "RAG Engine generating mitigation...", "info")
    recommendation = rag_service.get_mitigation(attack_type, {
        "ml_result": ml_status,
        "dl_prediction": dl_result["threat_prediction"],
        "affected_ips": ml_result.get("affected_ips", []),
        "severity": profile["severity"],
    })
    event_store.add_feed_event("rag_engine", "Mitigation recommendation generated ✓", "success")

    # ── Step 5: Calculate risk score ──────────────────────────────
    base_risk = event_store.stats.get("risk_score", 25)
    new_risk = min(99, base_risk + profile["risk_boost"] + random.randint(-5, 10))

    # ── Step 6: Generate alert ────────────────────────────────────
    alert = {
        "attack_type": attack_type,
        "type": profile["label"],
        "severity": profile["severity"],
        "description": profile["description"],
        "status": "Detected",
        "ml_result": ml_status,
        "dl_result": dl_result,
        "affected_ips": ml_result.get("affected_ips", []),
        "logs_analyzed": len(logs),
        "risk_score": new_risk,
        "recommendation": recommendation,
        "confidence": dl_result["confidence"],
    }
    event_store.add_alert(alert)
    event_store.add_feed_event("alert", f"⚠️ Threat Alert Generated: {profile['label']}", "danger")

    # ── Step 7: Update dashboard stats ────────────────────────────
    event_store.update_stats(
        logs_analyzed=len(logs),
        attack_type=attack_type,
        risk_score=new_risk,
        dl_confidence=dl_result["confidence"],
        threat_detected=True,
    )
    event_store.add_feed_event("system", f"Risk score updated to {new_risk}", "warning")

    # ── Build response ────────────────────────────────────────────
    return {
        "attack": profile["label"],
        "severity": profile["severity"],
        "risk_score": new_risk,
        "logs_generated": len(logs),
        "ml_result": ml_status,
        "ml_details": ml_result,
        "dl_result": dl_result,
        "recommendation": recommendation,
        "alert_id": alert.get("id"),
    }
