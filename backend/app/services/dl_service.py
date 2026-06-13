"""
DL Service — Sequential threat detection using a PyTorch LSTM neural network.

Provides two analysis modes:
- analyze_sequence(): samples a random sequence from the CSV dataset (legacy)
- analyze_sequence_from_data(logs): analyzes externally provided logs (used by simulation engine)
"""

import os
import random
import torch
import torch.nn as nn
import pandas as pd
import numpy as np


class ThreatLSTM(nn.Module):
    """LSTM network for sequential cyber threat detection."""

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
        self.device = torch.device('cpu')
        self.model = ThreatLSTM(input_size=2, hidden_size=16, num_classes=2).to(self.device)
        self.seq_length = 5
        self.model_path = os.path.join(os.path.dirname(__file__), 'dl_model.pth')
        self.is_trained = False
        self.df = None
        self._initialize_model()

    def _initialize_model(self) -> None:
        """Load saved model or train from scratch."""
        if os.path.exists(self.model_path):
            try:
                self.model.load_state_dict(
                    torch.load(self.model_path, map_location=self.device, weights_only=True)
                )
                self.model.eval()
                self.is_trained = True
                print("DL Model loaded from disk.")

                data_path = os.path.join(os.path.dirname(__file__), '../../sample_logs/login_logs.csv')
                if os.path.exists(data_path):
                    self.df = pd.read_csv(data_path)
                return
            except Exception as e:
                print(f"Failed to load DL model from disk: {e}")

        print("Training DL model locally...")
        self._train_model()

    def _train_model(self) -> None:
        """Train the LSTM on login_logs.csv sequences."""
        data_path = os.path.join(os.path.dirname(__file__), '../../sample_logs/login_logs.csv')
        if not os.path.exists(data_path):
            print("Dataset not found. Skipping DL model training.")
            return

        try:
            self.df = pd.read_csv(data_path)
            features = self.df[['failed_attempts', 'login_success']].values

            X, y = [], []
            for i in range(len(features) - self.seq_length):
                seq = features[i:i + self.seq_length]
                label = 1 if (seq[-1][0] > 3 or seq[-1][1] == 0) else 0
                X.append(seq)
                y.append(label)

            X_tensor = torch.tensor(np.array(X), dtype=torch.float32)
            y_tensor = torch.tensor(np.array(y), dtype=torch.long)

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

    def _predict_sequence(self, seq: list) -> dict:
        """Run a single sequence through the LSTM and return prediction."""
        seq_tensor = torch.tensor([seq], dtype=torch.float32).to(self.device)

        with torch.no_grad():
            output = self.model(seq_tensor)
            probabilities = torch.softmax(output, dim=1)[0]

        pred_class = torch.argmax(probabilities).item()
        confidence = round(probabilities[pred_class].item(), 2)

        if pred_class == 1:
            return {
                "threat_prediction": "Sequential Attack Pattern",
                "confidence": confidence,
                "severity": "High",
            }
        return {
            "threat_prediction": "Normal Behavior Pattern",
            "confidence": confidence,
            "severity": "Low",
        }

    def analyze_sequence(self) -> dict:
        """Legacy: sample a random sequence from the CSV dataset."""
        if not self.is_trained or self.df is None or len(self.df) <= self.seq_length:
            return {"threat_prediction": "Unknown", "confidence": 0.0, "severity": "Low"}

        features = self.df[['failed_attempts', 'login_success']].values

        # Bias 50% towards anomalous sequences for demo
        if random.random() < 0.5:
            anomaly_indices = np.where(features[:, 1] == 0)[0]
            valid_indices = [idx for idx in anomaly_indices if idx >= self.seq_length - 1]
            if valid_indices:
                end_idx = random.choice(valid_indices)
                start_idx = end_idx - self.seq_length + 1
            else:
                start_idx = random.randint(0, len(features) - self.seq_length - 1)
        else:
            start_idx = random.randint(0, len(features) - self.seq_length - 1)

        seq = features[start_idx:start_idx + self.seq_length].tolist()
        return self._predict_sequence(seq)

    def analyze_sequence_from_data(self, logs: list[dict]) -> dict:
        """
        Analyze externally provided logs as a sequence through the LSTM.

        Extracts the last `seq_length` entries, converts to feature vectors,
        and runs through the model. Used by the simulation engine.
        """
        if not self.is_trained:
            return {"threat_prediction": "Unknown", "confidence": 0.0, "severity": "Low"}

        # Build sequence from provided logs
        seq_data = [
            [log.get("failed_attempts", 0), log.get("login_success", 1)]
            for log in logs
        ]

        # Use the last seq_length entries (or pad if too short)
        if len(seq_data) >= self.seq_length:
            seq = seq_data[-self.seq_length:]
        else:
            # Pad with normal-looking entries
            padding = [[0, 1]] * (self.seq_length - len(seq_data))
            seq = padding + seq_data

        return self._predict_sequence(seq)


dl_service = DLService()
