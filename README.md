# CyberTwin AI Lite

An AI-powered cybersecurity digital twin prototype focused on **threat detection, cybersecurity intelligence (RAG), and risk monitoring**. This is a Lite/MVP version designed to showcase clean architecture and scalable machine learning integrations.

## Tech Stack
- **Backend:** Python, FastAPI, Uvicorn, Pandas, Scikit-learn
- **RAG:** LangChain, ChromaDB, Sentence Transformers
- **Frontend:** React.js (Vite), Tailwind CSS, Axios
- **Deployment:** Docker, Docker Compose

## Features
1. **Threat Detection Engine (ML):** Uses Scikit-learn Isolation Forest to detect anomalies like brute-force attacks and suspicious login spikes from a mock dataset.
2. **Cybersecurity RAG Assistant:** Uses LangChain and an embedded ChromaDB vector store with HuggingFace `sentence-transformers` to answer basic cybersecurity questions.
3. **Risk Dashboard APIs:** A set of FastAPI endpoints offering risk scores, system statuses, and active threat alerts.
4. **Frontend Dashboard:** A professional dark-themed React dashboard that connects to the backend to present the alerts, risk scores, and host the chatbot UI.

## Getting Started

### Option 1: Docker Compose (Recommended)
You can run the entire application using Docker Compose.

```bash
docker-compose up --build
```
This will start:
- Backend API at `http://localhost:8000`
- Frontend Dashboard at `http://localhost:5173`
- API Documentation (Swagger) at `http://localhost:8000/docs`

### Option 2: Run Locally (Without Docker)

#### Backend Setup
```bash
cd backend
python -m venv venv
# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt

# Generate the mock dataset
python scripts/generate_data.py

# Start the server
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints
- `GET /health` : Health check
- `GET /api/v1/alerts` : Get recent threat alerts
- `GET /api/v1/risk-score` : Get current system risk score
- `GET /api/v1/system-status` : Check engine statuses
- `GET /api/v1/threat-detection` : Run an anomaly detection pass
- `POST /api/v1/security-assistant` : Query the RAG chatbot