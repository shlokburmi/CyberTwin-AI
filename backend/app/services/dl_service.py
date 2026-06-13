import os
import random
import torch
import torch.nn as nn
import pandas as pd
import numpy as np

class ThreatLSTM(nn.Module):
    def __init__(self, input_size=2, hidden_size=16, num_layers=1, num_classes=2):
        super(ThreatLSTM, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, num_classes)
        
    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        out, _ = self.lstm(x, (h0, c0))
        out = self.fc(out[:, -1, :])
        return out

class DLService:
    def __init__(self):
        self.device = torch.device('cpu') # Enforce CPU usage as requested
        self.model = ThreatLSTM(input_size=2, hidden_size=16, num_classes=2).to(self.device)
        self.seq_length = 5
        self.model_path = os.path.join(os.path.dirname(__file__), 'dl_model.pth')
        self.is_trained = False
        self.df = None
        
        self._initialize_model()

    def _initialize_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model.load_state_dict(torch.load(self.model_path, map_location=self.device, weights_only=True))
                self.model.eval()
                self.is_trained = True
                print("DL Model loaded from disk.")
                
                # Also try to load the dataframe for sampling
                data_path = os.path.join(os.path.dirname(__file__), '../../sample_logs/login_logs.csv')
                if os.path.exists(data_path):
                    self.df = pd.read_csv(data_path)
                return
            except Exception as e:
                print(f"Failed to load DL model from disk: {e}")

        # If not saved, try training
        print("Training DL model locally...")
        self._train_model()

    def _train_model(self):
        data_path = os.path.join(os.path.dirname(__file__), '../../sample_logs/login_logs.csv')
        if not os.path.exists(data_path):
            print("Dataset not found. Skipping DL model training.")
            return

        try:
            self.df = pd.read_csv(data_path)
            # Use failed_attempts and login_success
            features = self.df[['failed_attempts', 'login_success']].values
            
            # Simple sequence formatting
            X, y = [], []
            for i in range(len(features) - self.seq_length):
                seq = features[i:i + self.seq_length]
                # Label 1 (anomaly) if the last event in seq has high failed attempts or low success
                label = 1 if (seq[-1][0] > 3 or seq[-1][1] == 0) else 0
                X.append(seq)
                y.append(label)

            X_tensor = torch.tensor(np.array(X), dtype=torch.float32)
            y_tensor = torch.tensor(np.array(y), dtype=torch.long)
            
            # Simple minimal training loop (just 5 epochs to keep it fast/MVP)
            criterion = nn.CrossEntropyLoss()
            optimizer = torch.optim.Adam(self.model.parameters(), lr=0.01)
            
            self.model.train()
            for epoch in range(5):
                optimizer.zero_grad()
                outputs = self.model(X_tensor)
                loss = criterion(outputs, y_tensor)
                loss.backward()
                optimizer.step()

            self.model.eval()
            self.is_trained = True
            torch.save(self.model.state_dict(), self.model_path)
            print("DL Model trained and saved successfully.")
            
        except Exception as e:
            print(f"Error training DL model: {e}")

    def analyze_sequence(self):
        # Fallback if somehow not trained
        if not self.is_trained or self.df is None or len(self.df) <= self.seq_length:
            return {
                "threat_prediction": "Unknown",
                "confidence": 0.0,
                "severity": "Low"
            }
            
        # Extract features and pick a random sequence from actual data
        features = self.df[['failed_attempts', 'login_success']].values
        start_idx = random.randint(0, len(features) - self.seq_length - 1)
        seq = features[start_idx:start_idx + self.seq_length]
            
        seq_tensor = torch.tensor([seq], dtype=torch.float32).to(self.device)
        
        with torch.no_grad():
            output = self.model(seq_tensor)
            probabilities = torch.softmax(output, dim=1)[0]
            
        pred_class = torch.argmax(probabilities).item()
        confidence = round(probabilities[pred_class].item(), 2)
        
        if pred_class == 1:
            return {
                "threat_prediction": "Sequential Brute Force Attack",
                "confidence": confidence,
                "severity": "High"
            }
        else:
             return {
                "threat_prediction": "Normal Behavior Pattern",
                "confidence": confidence,
                "severity": "Low"
            }

dl_service = DLService()
