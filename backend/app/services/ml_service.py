import pandas as pd
from sklearn.ensemble import IsolationForest
import random
import os

class MLService:
    def __init__(self):
        self.model = IsolationForest(contamination=0.05, random_state=42)
        self.is_trained = False
        self._train_model()

    def _train_model(self):
        data_path = os.path.join(os.path.dirname(__file__), '../../sample_logs/login_logs.csv')
        if not os.path.exists(data_path):
            print("Dataset not found. Skipping ML model training.")
            return
            
        try:
            df = pd.read_csv(data_path)
            # Select features for anomaly detection
            features = ['failed_attempts', 'login_success']
            X = df[features]
            
            self.model.fit(X)
            self.is_trained = True
            print("ML Model trained successfully.")
        except Exception as e:
            print(f"Error training model: {e}")

    def detect_anomaly(self):
        if not self.is_trained:
            # Fallback mock response if not trained
            return {
                "risk_score": random.randint(70, 95),
                "threat": "Brute Force",
                "severity": "High",
                "recommendation": "Block suspicious IP"
            }

        # Simulate an incoming log that might be an anomaly
        failed_attempts = random.choice([1, 2, 15, 30])
        login_success = 0 if failed_attempts > 3 else 1
        
        # Predict: 1 for normal, -1 for anomaly
        prediction = self.model.predict([[failed_attempts, login_success]])[0]
        
        if prediction == -1:
            return {
                "risk_score": random.randint(80, 99),
                "threat": "Brute Force",
                "severity": "High",
                "recommendation": "Block suspicious IP"
            }
        else:
            return {
                "risk_score": random.randint(10, 40),
                "threat": "None",
                "severity": "Low",
                "recommendation": "No action needed"
            }

ml_service = MLService()
