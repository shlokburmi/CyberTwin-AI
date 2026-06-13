import pandas as pd
from sklearn.ensemble import IsolationForest
import random
import os

class MLService:
    def __init__(self):
        self.model = IsolationForest(contamination=0.05, random_state=42)
        self.is_trained = False
        self.df = None
        self._train_model()

    def _train_model(self):
        data_path = os.path.join(os.path.dirname(__file__), '../../sample_logs/login_logs.csv')
        if not os.path.exists(data_path):
            print("Dataset not found. Skipping ML model training.")
            return
            
        try:
            self.df = pd.read_csv(data_path)
            # Select features for anomaly detection
            features = ['failed_attempts', 'login_success']
            X = self.df[features]
            
            self.model.fit(X)
            self.is_trained = True
            print("ML Model trained successfully.")
        except Exception as e:
            print(f"Error training model: {e}")

    def detect_anomaly(self):
        if not self.is_trained or self.df is None or self.df.empty:
            # Fallback mock response if not trained
            return {
                "risk_score": random.randint(70, 95),
                "threat": "Brute Force",
                "severity": "High",
                "recommendation": "Block suspicious IP"
            }

        # Sample an actual log from the dataset
        sample = self.df.sample(n=1).iloc[0]
        failed_attempts = sample['failed_attempts']
        login_success = sample['login_success']
        ip_address = sample.get('ip_address', 'Unknown IP')
        
        # Predict: 1 for normal, -1 for anomaly
        prediction = self.model.predict([[failed_attempts, login_success]])[0]
        
        if prediction == -1:
            return {
                "risk_score": random.randint(80, 99),
                "threat": "New Anomaly Detected: Brute Force",
                "severity": "High",
                "recommendation": f"Block suspicious IP: {ip_address}"
            }
        else:
            return {
                "risk_score": random.randint(10, 40),
                "threat": "Normal Login Activity",
                "severity": "Low",
                "recommendation": f"IP {ip_address} acting normally"
            }

ml_service = MLService()
