"""
Event Store — In-memory storage for alerts, activity feed, and dashboard statistics.
No external database required. Data resets on server restart (by design for MVP).
"""

import threading
from datetime import datetime
from collections import deque


class EventStore:
    """Thread-safe in-memory event store for the CyberTwin AI platform."""

    def __init__(self):
        self._lock = threading.Lock()
        self.alerts: deque = deque(maxlen=50)
        self.activity_feed: deque = deque(maxlen=100)
        self.stats = {
            "total_logs_analyzed": 0,
            "total_attacks_simulated": 0,
            "total_threats_detected": 0,
            "attacks_blocked": 0,
            "risk_score": 25,  # baseline low risk
            "risk_history": [],  # list of {timestamp, score}
            "threat_distribution": {},  # {attack_type: count}
            "last_attack_type": None,
            "last_ml_accuracy": 0.94,  # baseline from training
            "last_dl_confidence": 0.0,
        }

    # ── Alerts ────────────────────────────────────────────────────

    def add_alert(self, alert: dict) -> None:
        """Add a new alert to the store."""
        with self._lock:
            alert.setdefault("id", len(self.alerts) + 1)
            alert.setdefault("timestamp", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
            alert.setdefault("status", "Detected")
            self.alerts.appendleft(alert)

    def get_alerts(self, severity: str = None, attack_type: str = None) -> list:
        """Return alerts, optionally filtered by severity or attack_type."""
        with self._lock:
            alerts = list(self.alerts)
        if severity:
            alerts = [a for a in alerts if a.get("severity", "").lower() == severity.lower()]
        if attack_type:
            alerts = [a for a in alerts if a.get("attack_type", "").lower() == attack_type.lower()]
        return alerts

    # ── Activity Feed ─────────────────────────────────────────────

    def add_feed_event(self, event_type: str, message: str, severity: str = "info") -> None:
        """Add an event to the live activity feed."""
        with self._lock:
            self.activity_feed.appendleft({
                "timestamp": datetime.now().strftime("%H:%M:%S"),
                "type": event_type,
                "message": message,
                "severity": severity,
            })

    def get_feed(self, limit: int = 30) -> list:
        """Return the latest activity feed events."""
        with self._lock:
            return list(self.activity_feed)[:limit]

    # ── Dashboard Stats ───────────────────────────────────────────

    def update_stats(
        self,
        logs_analyzed: int = 0,
        attack_type: str = None,
        risk_score: int = None,
        dl_confidence: float = None,
        threat_detected: bool = False,
    ) -> None:
        """Update dashboard statistics after a simulation run."""
        with self._lock:
            self.stats["total_logs_analyzed"] += logs_analyzed
            self.stats["total_attacks_simulated"] += 1

            if threat_detected:
                self.stats["total_threats_detected"] += 1
                self.stats["attacks_blocked"] += 1

            if attack_type:
                self.stats["last_attack_type"] = attack_type
                dist = self.stats["threat_distribution"]
                dist[attack_type] = dist.get(attack_type, 0) + 1

            if risk_score is not None:
                self.stats["risk_score"] = risk_score
                self.stats["risk_history"].append({
                    "timestamp": datetime.now().strftime("%H:%M:%S"),
                    "score": risk_score,
                })
                # Keep last 20 entries for the chart
                if len(self.stats["risk_history"]) > 20:
                    self.stats["risk_history"] = self.stats["risk_history"][-20:]

            if dl_confidence is not None:
                self.stats["last_dl_confidence"] = dl_confidence

    def get_dashboard_data(self) -> dict:
        """Return all dashboard statistics."""
        with self._lock:
            return {
                **self.stats,
                "active_threats": len([a for a in self.alerts if a.get("status") == "Detected"]),
            }


# Singleton instance
event_store = EventStore()
