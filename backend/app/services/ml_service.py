"""
ML Service — Anomaly detection using Scikit-Learn Isolation Forest.

Provides two detection modes:
- detect_anomaly(): samples a random log from the CSV dataset (legacy)
- detect_anomaly_from_data(logs): analyzes externally provided logs (used by simulation engine)
"""

import os
import random
import pandas as pd
from sklearn.ensemble import IsolationForest


class MLService:
    def __init__(self):
        self.model = IsolationForest(contamination=0.05, random_state=42)
        self.is_trained = False
        self.df = None
        self._train_model()

    def _train_model(self) -> None:
        """Train the Isolation Forest on the login_logs.csv dataset."""
        data_path = os.path.join(os.path.dirname(__file__), '../../sample_logs/login_logs.csv')
        if not os.path.exists(data_path):
            print("Dataset not found. Skipping ML model training.")
            return

        try:
            self.df = pd.read_csv(data_path)
            features = ['failed_attempts', 'login_success']
            X = self.df[features]
            self.model.fit(X)
            self.is_trained = True
            print("ML Model trained successfully.")
        except Exception as e:
            print(f"Error training ML model: {e}")

    def detect_anomaly(self) -> dict:
        """Legacy: sample a random log from the dataset and predict."""
        if not self.is_trained or self.df is None or self.df.empty:
            return {
                "risk_score": random.randint(70, 95),
                "threat": "Brute Force",
                "severity": "High",
                "recommendation": "Block suspicious IP",
            }

        # Bias 50% towards anomalies for demo
        if random.random() < 0.5:
            anomalies = self.df[self.df['login_success'] == 0]
            sample = anomalies.sample(n=1).iloc[0] if not anomalies.empty else self.df.sample(n=1).iloc[0]
        else:
            sample = self.df.sample(n=1).iloc[0]

        failed_attempts = sample['failed_attempts']
        login_success = sample['login_success']
        ip_address = sample.get('ip_address', 'Unknown IP')

        prediction = self.model.predict([[failed_attempts, login_success]])[0]

        if prediction == -1:
            return {
                "risk_score": random.randint(80, 99),
                "threat": "New Anomaly Detected: Brute Force",
                "severity": "High",
                "recommendation": f"Block suspicious IP: {ip_address}",
            }
        return {
            "risk_score": random.randint(10, 40),
            "threat": "Normal Login Activity",
            "severity": "Low",
            "recommendation": f"IP {ip_address} acting normally",
        }

    def detect_anomaly_from_data(self, logs: list[dict]) -> dict:
        """
        Analyze externally provided log entries through the Isolation Forest.

        Returns aggregated results: anomaly count, affected IPs, risk score.
        Used by the simulation engine.
        """
        if not self.is_trained:
            return {
                "is_anomaly": True,
                "anomaly_count": len(logs),
                "total_logs": len(logs),
                "affected_ips": list({log.get("ip_address", "Unknown") for log in logs}),
                "risk_score": 85,
            }

        anomaly_count = 0
        affected_ips = set()

        for log in logs:
            failed = log.get("failed_attempts", 0)
            success = log.get("login_success", 1)
            prediction = self.model.predict([[failed, success]])[0]

            if prediction == -1:
                anomaly_count += 1
                affected_ips.add(log.get("ip_address", "Unknown"))

        total = len(logs)
        anomaly_ratio = anomaly_count / total if total > 0 else 0
        risk_score = min(99, int(anomaly_ratio * 100) + random.randint(10, 30))

        return {
            "is_anomaly": anomaly_count > 0,
            "anomaly_count": anomaly_count,
            "total_logs": total,
            "anomaly_ratio": round(anomaly_ratio, 2),
            "affected_ips": list(affected_ips),
            "risk_score": risk_score,
        }


ml_service = MLService()
