from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(
    title="CyberTwin AI Lite MVP",
    description="AI-powered cybersecurity digital twin prototype",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development MVP only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "Welcome to CyberTwin AI Lite MVP API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}