import os
import pandas as pd
import random
from datetime import datetime, timedelta

def generate_fake_logs(filepath="sample_logs/login_logs.csv", num_records=1000):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    locations = ["US", "UK", "IN", "DE", "FR", "CN", "RU"]
    devices = ["Desktop", "Mobile", "Tablet"]
    
    data = []
    base_time = datetime.now() - timedelta(days=30)
    
    for i in range(num_records):
        timestamp = base_time + timedelta(minutes=i*15) + timedelta(seconds=random.randint(0, 60))
        
        # Introduce anomalies
        is_anomaly = random.random() < 0.05
        
        if is_anomaly:
            # High failure anomaly (Brute Force)
            failed_attempts = random.randint(10, 50)
            login_success = 0
            location = random.choice(["CN", "RU"])
            ip_address = f"192.168.1.{random.randint(100, 255)}"
            device = "Desktop"
        else:
            # Normal behavior
            failed_attempts = random.randint(0, 3)
            login_success = 1 if failed_attempts < 3 else 0
            location = random.choice(["US", "UK", "IN", "DE", "FR"])
            ip_address = f"10.0.0.{random.randint(1, 100)}"
            device = random.choice(devices)
            
        data.append({
            "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "ip_address": ip_address,
            "failed_attempts": failed_attempts,
            "login_success": login_success,
            "location": location,
            "device_type": device
        })
        
    df = pd.DataFrame(data)
    df.to_csv(filepath, index=False)
    print(f"Generated {num_records} fake log records at {filepath}")

if __name__ == "__main__":
    generate_fake_logs()
