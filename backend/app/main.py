from fastapi import FastAPI

app = FastAPI(
    title="CyberTwin AI",
    description="AI-powered cyber digital twin system",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "CyberTwin AI Backend Running"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }